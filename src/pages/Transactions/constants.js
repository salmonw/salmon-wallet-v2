const TRANSACTION_TYPE = {
  SEND: 'send',
  RECEIVE: 'receive',
  SWAP: 'swap',
  MINT: 'mint',
  BURN: 'burn',
  STAKE: 'stake',
  LOAN: 'loan',
  INTERACTION: 'interaction',
  UNKNOWN: 'unknown',
};

const TRANSACTION_STATUS = {
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export { TRANSACTION_TYPE, TRANSACTION_STATUS };
