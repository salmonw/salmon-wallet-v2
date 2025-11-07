const { LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { decorateBalancePrices } = require('../token-decorator');
const { getTokensByOwner } = require('./eclipse-token-list-service');
const {
  ETH_DECIMALS,
  ETH_SYMBOL,
  ETH_NAME,
  ETH_LOGO,
  ETH_ADDRESS,
} = require('../../constants/token-constants');
const { getLast24HoursChange } = require('../common-balance-service');
const { getPricesByPlatform } = require('../price-service');
const { ECLIPSE } = require('../../constants/platforms');

const getEclipseBalance = async (connection, publicKey) => {
  const balance = await connection.getBalance(publicKey);
  const uiAmount = balance / LAMPORTS_PER_SOL;
  return {
    mint: ETH_ADDRESS,
    owner: publicKey.toBase58(),
    amount: balance,
    decimals: ETH_DECIMALS,
    uiAmount: uiAmount,
    symbol: ETH_SYMBOL,
    name: ETH_NAME,
    logo: ETH_LOGO,
    address: ETH_ADDRESS,
  };
};

const getTokensBalance = async (connection, publicKey) => {
  const ownerTokens = await getTokensByOwner(connection, publicKey);
  return ownerTokens.filter(t => t.amount && t.amount > 0);
};

const getPrices = async () => {
  try {
    return await getPricesByPlatform(ECLIPSE);
  } catch (e) {
    console.log('Could not get prices', e.message);
    return null;
  }
};

const getBalance = async (connection, publicKey) => {
  const tokensBalance = await getTokensBalance(connection, publicKey);
  const eclipseBalance = await getEclipseBalance(connection, publicKey);
  const prices = await getPrices();
  const balances = await decorateBalancePrices(
    [eclipseBalance, ...tokensBalance],
    prices,
  );
  if (prices) {
    const sortedBalances = balances.sort((a, b) => a.usdBalance < b.usdBalance);
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
  getEclipseBalance,
};
