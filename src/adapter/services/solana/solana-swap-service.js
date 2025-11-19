const axios = require('../axios-wrapper').default;
const { VersionedTransaction } = require('@solana/web3.js');
const { applyDecimals } = require('./solana-token-service');
const { getTokenList } = require('./solana-token-list-service');
const { SOL_ADDRESS } = require('../../constants/token-constants');
const { SALMON_API_URL } = require('../../constants/environment');

const createOrder = async (
  network,
  inAddress,
  outAddress,
  publicKey,
  amount,
  slippage,
) => {
  const tokens = await getTokenList();
  const inValidAddress = inAddress === publicKey ? SOL_ADDRESS : inAddress;
  const outValidAddress = outAddress === publicKey ? SOL_ADDRESS : outAddress;
  const inToken = tokens.find(t => t.address === inValidAddress);
  const inputAmount = applyDecimals(amount, inToken.decimals);
  const url = `${SALMON_API_URL}/v1/${network.id}/ft/swap/order`;
  const params = {
    inputMint: inValidAddress,
    outputMint: outValidAddress,
    amount: inputAmount,
    publicKey,
  };
  const response = await axios.get(url, { params });
  return response.data;
};

const executeSwap = async (network, connection, keypair, order) => {
  const transaction = VersionedTransaction.deserialize(
    Buffer.from(order.custom.transaction, 'base64'),
  );
  transaction.sign([keypair]);

  const url = `${SALMON_API_URL}/v1/${network.id}/ft/swap/execute`;
  const response = await axios.post(url, {
    signedTransaction: Buffer.from(transaction.serialize()).toString('base64'),
    requestId: order.custom.requestId,
  });

  if (response.data.status === 'Success') {
    const confirmation = await connection.confirmTransaction(
      response.data.signature,
      'confirmed',
    );
    const status = confirmation?.value?.err ? 'fail' : 'success';
    return [{ id: response.data.signature, name: 'swap', status }];
  }

  return [{ id: null, name: 'swap', status: 'fail', error: response.data.error }];
};

module.exports = {
  createOrder,
  executeSwap,
};
