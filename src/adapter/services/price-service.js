'use strict';

const axios = require('./axios-wrapper').default;
const { SALMON_STATIC_API_URL, SALMON_API_URL } = require('../constants/environment');

const getPricesByPlatform = async platform => getPrices({ platform });

const getPricesByIds = async ids => getPrices({ ids: ids.join(',') });

const getPrices = async params => {
  const url = `${SALMON_STATIC_API_URL}/v1/coins/${params.platform}`;
  const { data } = await axios.get(url);
  return Array.isArray(data) ? data : null;
};

const getTopTokensByPlatform = async platform => getTopTokens({ platform });

const getTopTokens = async params => {
  const { data } = await axios.get(`${SALMON_API_URL}/v1/top-tokens`, {
    params,
  });
  return data;
};

/**
 * Get price for a specific Solana token from Jupiter Price API v3
 * Uses backend endpoint with caching and rate limiting
 * @param {string} mintAddress - Solana token mint address
 * @param {string} networkId - Network ID (e.g., 'solana-mainnet', 'solana-devnet')
 * @returns {Promise<number|null>} USD price or null if not found
 */
const getSolanaTokenPrice = async (mintAddress, networkId) => {
  try {
    const { data } = await axios.get(
      `${SALMON_API_URL}/v1/${networkId}/ft/price/${mintAddress}`,
    );
    return data?.usdPrice || null;
  } catch (error) {
    console.error(`Failed to fetch price for ${mintAddress}:`, error);
    return null;
  }
};

/**
 * Get market chart data for a coin (price history)
 * @param {string} coinId - CoinGecko coin ID (e.g., 'bitcoin', 'solana')
 * @param {number} days - Number of days (1, 7, 30, 90, 365)
 * @param {string} currency - Currency for prices (default: 'usd')
 * @returns {Promise<Object|null>} Chart data with prices, marketCaps, totalVolumes
 */
const getMarketChart = async (coinId, days = 7, currency = 'usd') => {
  try {
    const { data } = await axios.get(`${SALMON_API_URL}/v1/chart/${coinId}`, {
      params: { days, currency },
    });
    return data;
  } catch (error) {
    console.error(`Failed to fetch chart for ${coinId}:`, error);
    return null;
  }
};

/**
 * Get coin info (price, market cap, supply, description)
 * @param {string} coinId - CoinGecko coin ID (e.g., 'bitcoin', 'solana')
 * @param {string} currency - Currency for prices (default: 'usd')
 * @returns {Promise<Object|null>} Coin info with marketData
 */
const getCoinInfo = async (coinId, currency = 'usd') => {
  try {
    const { data } = await axios.get(`${SALMON_API_URL}/v1/coin/${coinId}`, {
      params: { currency },
    });
    return data;
  } catch (error) {
    console.error(`Failed to fetch coin info for ${coinId}:`, error);
    return null;
  }
};

module.exports = {
  getPricesByPlatform,
  getPricesByIds,
  getTopTokensByPlatform,
  getSolanaTokenPrice,
  getMarketChart,
  getCoinInfo,
};
