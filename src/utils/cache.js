/* BASIC MEMORY CACHE */
// Needs improvement

const EXPIRES = 60 * 1000;

export const CACHE_TYPES = {
  BALANCE: 'BALANCE',
  NFTS: 'NFTS',
  NFTS_ALL: 'NFTS_ALL',
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

export const cache = async (key, type, callback) => {
  if (
    !(
      CACHE[type].expires &&
      CACHE[type].expires > new Date().getTime() &&
      key === CACHE[type].key
    )
  ) {
    CACHE[type].value = await callback();
    CACHE[type].key = key;
    CACHE[type].expires = new Date().getTime() + EXPIRES;
  }
  return CACHE[type].value;
};

export const invalidate = async type => {
  CACHE[type].expires = null;
};
