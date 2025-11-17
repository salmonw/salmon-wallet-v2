import React, { useCallback, useContext, useEffect, useState } from 'react';

import { VersionedTransaction } from '@solana/web3.js';

import { AppContext } from '../../../AppProvider';
import BasicTransactionApproval from './BasicTransactionApproval';
import LoadingTransactionApproval from './LoadingTransactionApproval';

const ApproveTransactionsForm = ({
  payloads = [],
  origin,
  name,
  icon,
  onApprove,
  onReject,
}) => {
  const [{ activeBlockchainAccount }] = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [fee, setFee] = useState(null);

  const estimateFee = useCallback(async () => {
    setLoading(true);

    try {
      const messages = payloads.map(
        payload => VersionedTransaction.deserialize(payload).message,
      );
      setFee(await activeBlockchainAccount.estimateTransactionsFee(messages));
    } catch (err) {
      console.error('Failed to get fee for message:', err);
      setFee(null);
    } finally {
      setLoading(false);
    }
  }, [payloads, activeBlockchainAccount]);

  useEffect(() => {
    estimateFee();
  }, [estimateFee]);

  if (loading) {
    return (
      <LoadingTransactionApproval origin={origin} name={name} icon={icon} />
    );
  }

  return (
    <BasicTransactionApproval
      origin={origin}
      name={name}
      icon={icon}
      fee={fee}
      network={activeBlockchainAccount.network}
      onApprove={onApprove}
      onReject={onReject}
    />
  );
};

export default ApproveTransactionsForm;
