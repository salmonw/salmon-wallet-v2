const { PublicKey } = require('@solana/web3.js');
const {
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
} = require('@solana/spl-token');

const getTokenAccount = async (
  connection,
  destination,
  tokenAddress,
  programId,
) => {
  const assocTokenAddress = await getAssociatedTokenAddress(
    new PublicKey(tokenAddress),
    destination,
    false,
    programId,
  );
  return await connection.getAccountInfo(assocTokenAddress);
};

const getOrCreateTokenAccount = async (
  connection,
  fromKeyPair,
  token,
  toPublicKey,
  programId,
) => {
  return await getOrCreateAssociatedTokenAccount(
    connection,
    fromKeyPair,
    new PublicKey(token),
    toPublicKey,
    false,
    'confirmed',
    undefined,
    programId,
  );
};

const applyDecimals = (amount, decimals) => {
  return Math.round(parseFloat(amount) * 10 ** decimals);
};

const applyOutDecimals = (amount, decimals) => {
  return parseFloat(amount) / 10 ** decimals;
};

module.exports = {
  getTokenAccount,
  getOrCreateTokenAccount,
  getAssociatedTokenAddress,
  applyDecimals,
  applyOutDecimals,
};
