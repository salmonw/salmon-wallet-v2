const {
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  PublicKey,
} = require('@solana/web3.js');
const {
  TOKEN_2022_PROGRAM_ID,
  createTransferInstruction,
  createTransferCheckedWithFeeInstruction,
  getMemoTransfer,
  getMint,
  unpackAccount,
  getTransferFeeConfig,
  calculateFee,
  getExtensionTypes,
  ExtensionType,
} = require('@solana/spl-token');
const {
  getAssociatedTokenAddress,
  getTokenAccount,
  getOrCreateTokenAccount,
} = require('./eclipse-token-service');
const { applyDecimals } = require('./eclipse-token-service');
const { ETH_ADDRESS } = require('../../constants/token-constants');
const { createMemoInstruction } = require('@solana/spl-memo');

const createTransaction = async (
  connection,
  fromKeyPair,
  toPublicKey,
  token,
  amount,
  opts = {},
) => {
  const { simulate } = opts;
  let transaction = null;
  if (token == ETH_ADDRESS) {
    transaction = await transactionSol(
      connection,
      fromKeyPair,
      toPublicKey,
      amount,
    );
  } else {
    transaction = await transactionSpl(
      connection,
      fromKeyPair,
      toPublicKey,
      token,
      amount,
      opts,
    );
  }
  const result = await execute(connection, transaction, fromKeyPair, simulate);
  return { txId: result };
};

const requiresMemo = async (connection, toPublicKey, tokenAddress) => {
  if (!tokenAddress || tokenAddress == ETH_ADDRESS) {
    return false;
  }

  const tokenAddressPublicKey = new PublicKey(tokenAddress);
  const tokenInfo = await connection.getAccountInfo(tokenAddressPublicKey);
  const programId = tokenInfo.owner;
  if (programId.equals(TOKEN_2022_PROGRAM_ID)) {
    const toTokenAddress = await getAssociatedTokenAddress(
      tokenAddressPublicKey,
      toPublicKey,
      false,
      programId,
    );

    const accountInfo = await connection.getAccountInfo(toTokenAddress);
    if (accountInfo) {
      const account = unpackAccount(
        toTokenAddress,
        accountInfo,
        TOKEN_2022_PROGRAM_ID,
      );
      const memoDetails = getMemoTransfer(account);
      if (memoDetails) {
        return memoDetails.requireIncomingTransferMemos;
      }
    }
  }
  return false;
};

const transactionSol = async (
  connection,
  fromKeyPair,
  toPublicKey,
  amount,
  opts = {},
) => {
  const { simulate } = opts;
  const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  const transaction = new Transaction({
    feePayer: fromKeyPair.publicKey,
    recentBlockhash,
  }).add(
    SystemProgram.transfer({
      fromPubkey: fromKeyPair.publicKey,
      toPubkey: toPublicKey,
      lamports: LAMPORTS_PER_SOL * amount,
    }),
  );
  return transaction;
};

const transactionSpl = async (
  connection,
  fromKeyPair,
  toPublicKey,
  tokenAddress,
  amount,
  opts = {},
) => {
  const { simulate, memo } = opts;
  const tokenAddressPublicKey = new PublicKey(tokenAddress);
  const tokenInfo = await connection.getAccountInfo(tokenAddressPublicKey);
  const programId = tokenInfo.owner;
  const fromTokenAddress = await getAssociatedTokenAddress(
    new PublicKey(tokenAddress),
    fromKeyPair.publicKey,
    false,
    programId,
  );
  const toTokenAddress = await getAssociatedTokenAddress(
    tokenAddressPublicKey,
    toPublicKey,
    false,
    programId,
  );
  const mint = await getMint(
    connection,
    tokenAddressPublicKey,
    'confirmed',
    programId,
  );
  const decimals = mint?.decimals || opts?.decimals || 0;
  const transferAmount = applyDecimals(amount, mint.decimals);
  const destTokenAccount = await getTokenAccount(
    connection,
    toPublicKey,
    tokenAddress,
    programId,
  );
  if (!destTokenAccount) {
    console.log('creating token account');
    const ta = await getOrCreateTokenAccount(
      connection,
      fromKeyPair,
      tokenAddress,
      toPublicKey,
      programId,
    );
    console.log(`Token account: ${ta}`);
  }

  const transaction = new Transaction();
  if (memo) {
    transaction.add(createMemoInstruction(memo, [fromKeyPair.publicKey]));
  }

  const hasTransferFee =
    programId.equals(TOKEN_2022_PROGRAM_ID) &&
    getExtensionTypes(mint.tlvData).includes(ExtensionType.TransferFeeConfig);

  if (hasTransferFee) {
    const fee = await calculateTransferFee(connection, tokenAddress, amount);

    transaction.add(
      createTransferCheckedWithFeeInstruction(
        fromTokenAddress,
        tokenAddressPublicKey,
        toTokenAddress,
        fromKeyPair.publicKey,
        BigInt(transferAmount),
        decimals,
        fee,
        [],
        programId,
      ),
    );
  } else {
    transaction.add(
      createTransferInstruction(
        fromTokenAddress,
        toTokenAddress,
        fromKeyPair.publicKey,
        transferAmount,
        [],
        programId,
      ),
    );
  }

  const latestBlockHash = await connection.getLatestBlockhash();
  transaction.recentBlockhash = latestBlockHash.blockhash;
  transaction.feePayer = fromKeyPair.publicKey;
  return transaction;
};

const execute = async (connection, transaction, keyPair, simulate) => {
  if (simulate) {
    result = await connection.simulateTransaction(transaction, [keyPair]);
  } else {
    result = await sendTransaction(connection, transaction, keyPair);
  }
  return result;
};

const sendTransaction = async (connection, transaction, keyPair) => {
  const txid = await connection.sendTransaction(transaction, [keyPair], {
    skipPreflight: true,
  });
  return txid;
};

const estimateFee = async (
  connection,
  fromKeyPair,
  toPublicKey,
  token,
  amount,
  opts,
) => {
  let transaction;
  if (token == ETH_ADDRESS) {
    transaction = await transactionSol(
      connection,
      fromKeyPair,
      toPublicKey,
      amount,
    );
  } else {
    transaction = await transactionSpl(
      connection,
      fromKeyPair,
      toPublicKey,
      token,
      amount,
      opts,
    );
  }
  return await transaction.getEstimatedFee(connection);
};

const confirmTransaction = async (connection, txId) => {
  return await connection.confirmTransaction(txId);
};

const airdrop = async (connection, publicKey, amount) => {
  const airdropSignature = await connection.requestAirdrop(
    publicKey,
    amount * LAMPORTS_PER_SOL,
  );
  return await connection.confirmTransaction(airdropSignature);
};

const calculateTransferFee = async (connection, mint, amount) => {
  if (!mint || mint == ETH_ADDRESS) {
    return null;
  }

  const mintAddress = new PublicKey(mint);
  const accountInfo = await connection.getAccountInfo(mintAddress);
  if (accountInfo?.owner?.equals(TOKEN_2022_PROGRAM_ID)) {
    const mintInfo = await getMint(
      connection,
      mintAddress,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );
    const transferAmount = BigInt(amount * 10 ** mintInfo.decimals);
    const transferFeeAmount = getTransferFeeConfig(mintInfo);
    if (transferFeeAmount) {
      return calculateFee(transferFeeAmount.newerTransferFee, transferAmount);
    }
  }
  return null;
};

module.exports = {
  estimateFee,
  requiresMemo,
  createTransaction,
  confirmTransaction,
  airdrop,
  calculateTransferFee,
};
