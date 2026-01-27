#!/bin/bash
set -euo pipefail

BUCKET_NAME="${1:?Bucket name is required}"
AWS_REGION="${2:-us-east-1}"

echo "Checking if app bucket exists..."
if aws s3api head-bucket --bucket "$BUCKET_NAME" --region "$AWS_REGION" 2>/dev/null; then
    echo "Bucket $BUCKET_NAME already exists"
else
    echo "Bucket $BUCKET_NAME does not exist, creating..."
    aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$AWS_REGION"
    
    echo "Setting public access block configuration..."
    aws s3api put-public-access-block \
      --bucket "$BUCKET_NAME" \
      --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
    
    echo "Setting bucket policy for public read..."
    aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy '{
      "Version": "2012-10-17",
      "Statement": [{
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::'"$BUCKET_NAME"'/*"
      }]
    }'
    
    echo "Bucket $BUCKET_NAME created and configured"
fi
