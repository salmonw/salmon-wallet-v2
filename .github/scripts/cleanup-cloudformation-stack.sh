#!/bin/bash
set -euo pipefail

# Script to clean up failed CloudFormation stacks and change sets
# Usage: cleanup-cloudformation-stack.sh <STACK_NAME> [AWS_REGION]

STACK_NAME="${1:?Error: STACK_NAME is required as first argument}"
AWS_REGION="${2:-us-east-1}"

echo "=== CloudFormation Stack Cleanup ==="
echo "Stack: $STACK_NAME"
echo "Region: $AWS_REGION"
echo ""

echo "Checking CloudFormation stack status..."

if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$AWS_REGION" 2>/dev/null; then
  STATUS=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$AWS_REGION" --query 'Stacks[0].StackStatus' --output text)
  echo "Stack exists with status: $STATUS"
  
  # Handle DELETE_FAILED state - need to clean up resources manually
  if [[ "$STATUS" == "DELETE_FAILED" ]]; then
    echo "Stack is in DELETE_FAILED state. Cleaning up resources manually..."
    
    # Get resources that failed to delete
    echo "Getting failed resources..."
    FAILED_RESOURCES=$(aws cloudformation describe-stack-resources \
      --stack-name "$STACK_NAME" \
      --region "$AWS_REGION" \
      --query 'StackResources[?ResourceStatus==`DELETE_FAILED`].{LogicalId:LogicalResourceId,PhysicalId:PhysicalResourceId,Type:ResourceType}' \
      --output json 2>/dev/null || echo "[]")
    
    echo "Failed resources: $FAILED_RESOURCES"
    
    # Get the ServerlessDeploymentBucket name
    echo "Looking for ServerlessDeploymentBucket..."
    BUCKET_NAME=$(aws cloudformation describe-stack-resources \
      --stack-name "$STACK_NAME" \
      --region "$AWS_REGION" \
      --query 'StackResources[?LogicalResourceId==`ServerlessDeploymentBucket`].PhysicalResourceId' \
      --output text 2>/dev/null || echo "")

    if [ -n "$BUCKET_NAME" ]; then
      echo "Found ServerlessDeploymentBucket: $BUCKET_NAME"

      # Delete bucket policy first
      echo "Deleting bucket policy..."
      aws s3api delete-bucket-policy --bucket "$BUCKET_NAME" --region "$AWS_REGION" 2>/dev/null || echo "Could not delete bucket policy (may not exist)"

      # Empty the bucket (this is the key step that was missing!)
      echo "Emptying bucket contents..."
      aws s3 rm "s3://$BUCKET_NAME" --recursive --region "$AWS_REGION" 2>/dev/null || echo "Could not empty bucket (may already be empty)"

      # Handle versioned objects if bucket has versioning (safe version without eval)
      echo "Removing any versioned objects..."
      aws s3api list-object-versions --bucket "$BUCKET_NAME" --region "$AWS_REGION" --output json 2>/dev/null | \
        jq -r '.Versions[]?, .DeleteMarkers[]? | [.Key, .VersionId] | @tsv' 2>/dev/null | \
        while IFS=$'\t' read -r key version_id; do
          if [ -n "$key" ] && [ -n "$version_id" ]; then
            aws s3api delete-object --bucket "$BUCKET_NAME" --region "$AWS_REGION" --key "$key" --version-id "$version_id" 2>/dev/null || true
          fi
        done || echo "No versioned objects to delete"

      echo "Bucket cleanup completed"
    fi

    # Now try to continue stack deletion with --retain-resources to avoid stuck state
    echo "Retrying stack deletion with --retain-resources..."
    aws cloudformation delete-stack --stack-name "$STACK_NAME" --region "$AWS_REGION" \
      --retain-resources ServerlessDeploymentBucket 2>/dev/null || \
    aws cloudformation delete-stack --stack-name "$STACK_NAME" --region "$AWS_REGION"
    echo "Waiting for stack deletion..."
    aws cloudformation wait stack-delete-complete --stack-name "$STACK_NAME" --region "$AWS_REGION" || echo "Stack deletion may still be in progress"
  fi
  
  # Delete all failed/pending change sets
  echo "Cleaning up change sets..."
  CHANGESETS=$(aws cloudformation list-change-sets \
    --stack-name "$STACK_NAME" \
    --region "$AWS_REGION" \
    --query 'Summaries[?Status==`FAILED` || Status==`UNAVAILABLE`].ChangeSetName' \
    --output text 2>/dev/null || echo "")
  
  if [ -n "$CHANGESETS" ]; then
    for CS in $CHANGESETS; do
      echo "Deleting change set: $CS"
      aws cloudformation delete-change-set \
        --stack-name "$STACK_NAME" \
        --change-set-name "$CS" \
        --region "$AWS_REGION" 2>/dev/null || true
    done
  else
    echo "No failed change sets to clean up"
  fi
  
  # Check if stack is in a state that prevents updates
  if [[ "$STATUS" == *"FAILED"* ]] || \
     [[ "$STATUS" == *"ROLLBACK"* ]] || \
     [[ "$STATUS" == "CREATE_FAILED" ]] || \
     [[ "$STATUS" == "ROLLBACK_COMPLETE" ]] || \
     [[ "$STATUS" == "UPDATE_ROLLBACK_COMPLETE" ]] || \
     [[ "$STATUS" == "UPDATE_ROLLBACK_FAILED" ]] || \
     [[ "$STATUS" == "REVIEW_IN_PROGRESS" ]]; then
    if [[ "$STATUS" != "DELETE_FAILED" ]]; then
      echo "Stack is in problematic state ($STATUS), deleting..."
      aws cloudformation delete-stack --stack-name "$STACK_NAME" --region "$AWS_REGION"
      echo "Waiting for stack deletion (this may take a few minutes)..."
      aws cloudformation wait stack-delete-complete --stack-name "$STACK_NAME" --region "$AWS_REGION" || echo "Stack deletion may still be in progress, continuing..."
    fi
  elif [[ "$STATUS" == "CREATE_COMPLETE" ]] || [[ "$STATUS" == "UPDATE_COMPLETE" ]]; then
    echo "Stack exists and is complete. Checking resources..."
    # Check if stack actually has resources or is empty
    RESOURCE_COUNT=$(aws cloudformation describe-stack-resources \
      --stack-name "$STACK_NAME" \
      --region "$AWS_REGION" \
      --query 'length(StackResources[])' \
      --output text 2>/dev/null || echo "0")
    
    if [ "$RESOURCE_COUNT" == "0" ] || [ -z "$RESOURCE_COUNT" ]; then
      echo "Stack exists but has no resources. Deleting for fresh deployment..."
      aws cloudformation delete-stack --stack-name "$STACK_NAME" --region "$AWS_REGION"
      aws cloudformation wait stack-delete-complete --stack-name "$STACK_NAME" --region "$AWS_REGION" || echo "Stack deletion in progress"
    else
      echo "Stack has $RESOURCE_COUNT resources. Will attempt to update."
    fi
  else
    echo "Stack is in state: $STATUS - deleting to allow fresh deployment"
    aws cloudformation delete-stack --stack-name "$STACK_NAME" --region "$AWS_REGION"
    aws cloudformation wait stack-delete-complete --stack-name "$STACK_NAME" --region "$AWS_REGION" || echo "Stack deletion in progress"
  fi
else
  echo "Stack does not exist"
fi

echo ""
echo "=== Cleanup complete ==="
