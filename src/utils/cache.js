/* MEMORY CACHE WITH REQUEST DEDUPLICATION */
// Implements promise deduplication to prevent duplicate concurrent requests
// Following best practices for React client-side caching (2025)

const EXPIRES = 60 * 1000;

export const CACHE_TYPES = {
  BALANCE: 'BALANCE',
  NFTS: 'NFTS',
  NFTS_ALL: 'NFTS_ALL',
  NFTS_COLLECTION_DETAIL: 'NFTS_COLLECTION_DETAIL',
  NFTS_COLLECTION_ITEMS: 'NFTS_COLLECTION_ITEMS',
  NFTS_BUY_DETAIL: 'NFTS_BUY_DETAIL',
  SINGLE_NFT: 'SINGLE_NFT',
  TRANSACTIONS: 'TRANSACTIONS',
  TOKENS: 'TOKENS',
  AVAILABLE_TOKENS: 'AVAILABLE_TOKENS',
  FEATURED_TOKENS: 'FEATURED_TOKENS',
  BRIDGE_SUPPORTED: 'BRIDGE_SUPPORTED',
};

var CACHE = {
  [CACHE_TYPES.BALANCE]: {
    expires: null,
    key: '',
    value: {},
  },
  [CACHE_TYPES.NFTS]: {
    expires: null,
    key: '',
    value: [],
  },
  [CACHE_TYPES.NFTS_ALL]: {
    expires: null,
    key: '',
    value: [],
  },
  [CACHE_TYPES.NFTS_COLLECTION_DETAIL]: {
    expires: null,
    key: '',
    value: [],
  },
  [CACHE_TYPES.NFTS_COLLECTION_ITEMS]: {
    expires: null,
    key: '',
    value: [],
  },
  [CACHE_TYPES.NFTS_BUY_DETAIL]: {
    expires: null,
    key: '',
    value: [],
  },
  [CACHE_TYPES.SINGLE_NFT]: {
    expires: null,
    key: '',
    value: [],
  },
  [CACHE_TYPES.TRANSACTIONS]: {
    expires: null,
    key: '',
    value: [],
  },
  [CACHE_TYPES.TOKENS]: {
    expires: null,
    key: '',
    value: [],
  },
  [CACHE_TYPES.AVAILABLE_TOKENS]: {
    expires: null,
    key: '',
    value: [],
  },
  [CACHE_TYPES.FEATURED_TOKENS]: {
    expires: null,
    key: '',
    value: [],
  },
  [CACHE_TYPES.BRIDGE_SUPPORTED]: {
    expires: null,
    key: '',
    value: [],
  },
};

// Map to store pending promises and prevent duplicate concurrent requests
// Key format: "CACHE_TYPE-key"
const pendingPromises = new Map();

/**
 * Cache with request deduplication
 *
 * When multiple components request the same data simultaneously:
 * 1. First request creates a promise and stores it in pendingPromises
 * 2. Subsequent requests reuse the same pending promise
 * 3. Once resolved, the result is cached and the promise is removed
 *
 * This prevents duplicate API calls when components mount at the same time
 *
 * @param {string} key - Unique identifier for the cached data (e.g., "solana-123abc")
 * @param {string} type - Cache type from CACHE_TYPES
 * @param {Function} callback - Async function that fetches the data
 * @returns {Promise} The cached or fetched data
 */
export const cache = async (key, type, callback) => {
  const cacheKey = `${type}-${key}`;

  // 1. Check if there's a pending promise for this exact request
  // This prevents duplicate concurrent calls
  if (pendingPromises.has(cacheKey)) {
    return pendingPromises.get(cacheKey);
  }

  // 2. Check if we have valid cached data
  const hasValidCache =
    CACHE[type].expires &&
    CACHE[type].expires > new Date().getTime() &&
    key === CACHE[type].key;

  if (hasValidCache) {
    return CACHE[type].value;
  }

  // 3. No cache and no pending promise - create a new request
  const promise = callback()
    .then(value => {
      // Store the result in cache
      CACHE[type].value = value;
      CACHE[type].key = key;
      CACHE[type].expires = new Date().getTime() + EXPIRES;

      // Remove from pending promises
      pendingPromises.delete(cacheKey);

      return value;
    })
    .catch(error => {
      // On error, remove from pending promises to allow retries
      pendingPromises.delete(cacheKey);
      throw error;
    });

  // Store the promise so other concurrent calls can reuse it
  pendingPromises.set(cacheKey, promise);

  return promise;
};

/**
 * Invalidate cached data for a specific type
 * Forces next cache() call to fetch fresh data
 *
 * @param {string} type - Cache type from CACHE_TYPES
 */
export const invalidate = async type => {
  CACHE[type].expires = null;

  // Also clear any pending promises for this type
  // to ensure fresh data on next request
  for (const [key] of pendingPromises) {
    if (key.startsWith(`${type}-`)) {
      pendingPromises.delete(key);
    }
  }
};
