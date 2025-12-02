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

module.exports = {
  getPricesByPlatform,
  getPricesByIds,
  getTopTokensByPlatform,
  getSolanaTokenPrice,
};
