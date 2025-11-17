import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { VersionedMessage } from '@solana/web3.js';

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

  const messages = useMemo(
    () => payloads.map(payload => VersionedMessage.deserialize(payload)),
    [payloads],
  );

  const estimateFee = useCallback(async () => {
    setLoading(true);

    try {
      setFee(await activeBlockchainAccount.estimateTransactionsFee(messages));
    } catch (err) {
      console.error('Failed to get fee for message:', err);
      setFee(null);
    } finally {
      setLoading(false);
    }
  }, [messages, activeBlockchainAccount]);

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
