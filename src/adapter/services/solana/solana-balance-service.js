const { LAMPORTS_PER_SOL } = require('@solana/web3.js');
const {
  decorateBalanceList,
  decorateBalancePrices,
} = require('../token-decorator');
const {
  getTokensByOwner,
  getTokenMetadataByMints,
} = require('./solana-token-list-service');
const {
  SOL_DECIMALS,
  SOL_SYMBOL,
  SOL_NAME,
  SOL_LOGO,
  SOL_ADDRESS,
} = require('../../constants/token-constants');
const { getLast24HoursChange } = require('../common-balance-service');
const { getPricesByPlatform } = require('../price-service');
const { SOLANA } = require('../../constants/platforms');

const getSolanaBalance = async (connection, publicKey) => {
  const balance = await connection.getBalance(publicKey);
  const uiAmount = balance / LAMPORTS_PER_SOL;
  return {
    mint: SOL_ADDRESS,
    owner: publicKey.toBase58(),
    amount: balance,
    decimals: SOL_DECIMALS,
    uiAmount: uiAmount,
    symbol: SOL_SYMBOL,
    name: SOL_NAME,
    logo: SOL_LOGO,
    address: SOL_ADDRESS,
    coingeckoId: 'solana',
  };
};

const getTokensBalance = async (connection, publicKey) => {
  // 1. Get tokens owned by user
  const ownerTokens = await getTokensByOwner(connection, publicKey);
  const notEmptyTokens = ownerTokens.filter(t => t.amount && t.amount > 0);

  // 2. Extract mint addresses from user's tokens
  const mintAddresses = notEmptyTokens.map(t => t.mint);

  // 3. Fetch metadata only for those specific mints (efficient batch call)
  const tokenMetadata = await getTokenMetadataByMints(mintAddresses);

  // 4. Decorate balance with metadata
  return decorateBalanceList(notEmptyTokens, tokenMetadata);
};

const getPrices = async () => {
  try {
    return await getPricesByPlatform(SOLANA);
  } catch (e) {
    console.log('Could not get prices', e.message);
    return null;
  }
};

const getBalance = async (connection, publicKey) => {
  const tokensBalance = await getTokensBalance(connection, publicKey);
  const solanaBalance = await getSolanaBalance(connection, publicKey);
  const prices = await getPrices();
  const balances = await decorateBalancePrices(
    [solanaBalance, ...tokensBalance],
    prices,
  );
  if (prices) {
    const sortedBalances = balances.sort((a, b) => {
      // SOL always first
      if (a.address === SOL_ADDRESS) return -1;
      if (b.address === SOL_ADDRESS) return 1;
      // Then sort by USD balance descending
      return (b.usdBalance || 0) - (a.usdBalance || 0);
    });
    const usdTotal = balances.reduce(
      (currentValue, next) => (next.usdBalance || 0) + currentValue,
      0,
    );
    const last24HoursChange = getLast24HoursChange(balances, usdTotal);
    return { usdTotal, last24HoursChange, items: sortedBalances };
  } else {
    return { items: balances };
  }
};

module.exports = {
  getBalance,
  getSolanaBalance,
};
