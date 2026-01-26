const { TOKEN_2022_PROGRAM_ID } = require('@solana/spl-token');
const { TOKEN_PROGRAM_ID } = require('../../constants/token-constants');
const http = require('../axios-wrapper').default;
const { SALMON_STATIC_API_URL, SALMON_API_URL } = require('../../constants/environment');

const TOKEN_LIST_URL_JUP = 'https://cache.jup.ag/tokens';

const TOKEN_LIST_URL_CDN =
  'https://cdn.jsdelivr.net/gh/solana-labs/token-list@latest/src/tokens/solana.tokenlist.json';

let tokenList = [];
let tokenListSource = null;

const BATCH_CHUNK_SIZE = 100;

// List of known problematic/dead domains that should be skipped
const DEAD_DOMAINS = [
  'shdw-drive.genesysgo.net',
  'chexbacca.com',
  'cdn.bridgesplit.com',
];

/**
 * Fix problematic IPFS URLs by redirecting to reliable gateways
 * Handles multiple broken IPFS gateway patterns (2025)
 *
 * @param {string} url - The original logo URL
 * @returns {string|null} Fixed URL or null if domain is known to be dead
 */
const fixIPFSUrl = (url) => {
  if (!url) return url;

  // Skip known dead domains to avoid unnecessary network requests
  if (DEAD_DOMAINS.some(domain => url.includes(domain))) {
    return null;
  }

  // Extract IPFS hash from various gateway patterns
  let ipfsHash = null;

  // Pattern 1: cf-ipfs.com URLs (DNS issues)
  if (url.includes('cf-ipfs.com/ipfs/')) {
    ipfsHash = url.split('/ipfs/')[1];
  }

  // Pattern 2: cloudflare-ipfs.com URLs (DNS issues)
  else if (url.includes('cloudflare-ipfs.com/ipfs/')) {
    ipfsHash = url.split('/ipfs/')[1];
  }

  // Pattern 3: *.ipfs.cf-ipfs.com subdomain format
  else if (url.includes('.ipfs.cf-ipfs.com')) {
    ipfsHash = url.split('://')[1]?.split('.ipfs.cf-ipfs.com')[0];
  }

  // Pattern 4: ipfs.nftstorage.link URLs (SSL issues)
  else if (url.includes('.ipfs.nftstorage.link')) {
    ipfsHash = url.split('://')[1]?.split('.ipfs')[0];
  }

  // Pattern 5: *.ipfs.dweb.link subdomain format
  else if (url.includes('.ipfs.dweb.link')) {
    ipfsHash = url.split('://')[1]?.split('.ipfs.dweb.link')[0];
  }

  // Pattern 6: gateway.pinata.cloud (sometimes slow/unreliable)
  else if (url.includes('gateway.pinata.cloud/ipfs/')) {
    ipfsHash = url.split('/ipfs/')[1];
  }

  // Pattern 7: ipfs.infura.io (deprecated)
  else if (url.includes('ipfs.infura.io/ipfs/')) {
    ipfsHash = url.split('/ipfs/')[1];
  }

  // If we extracted an IPFS hash, redirect to ipfs.io (most reliable gateway)
  if (ipfsHash) {
    // Clean up hash (remove query params, trailing slashes)
    const cleanHash = ipfsHash.split('?')[0].split('#')[0];
    return `https://ipfs.io/ipfs/${cleanHash}`;
  }

  return url;
};

const retrieveTokenList = async (networkId = 'solana-mainnet') => {
  if (Array.isArray(tokenList) && tokenList.length > 0) {
    return { tokens: tokenList, source: tokenListSource };
  }

  // Try backend first (fastest, with cache)
  try {
    const response = await http.get(`${SALMON_API_URL}/v1/${networkId}/ft/verified`);
    tokenList = response.data;
    tokenListSource = 'backend';
    return { tokens: tokenList, source: tokenListSource };
  } catch {
    console.warn('Token list: backend unavailable, trying Jupiter...');
  }

  // Fallback to Jupiter
  try {
    const response = await http.get(TOKEN_LIST_URL_JUP);
    tokenList = response.data;
    tokenListSource = 'jupiter';
    return { tokens: tokenList, source: tokenListSource };
  } catch {
    console.warn('Token list: Jupiter unavailable, using CDN fallback...');
  }

  // Last resort: CDN
  const response = await http.get(TOKEN_LIST_URL_CDN);
  tokenList = response.data.tokens;
  tokenListSource = 'cdn';
  return { tokens: tokenList, source: tokenListSource };
};

async function getTokenList() {
  const { tokens: allTokens, source } = await retrieveTokenList();

  // Normalize tokens based on source
  // Backend returns: logo, tags, coingeckoId
  // Jupiter returns: logoURI, tags, extensions.coingeckoId
  // CDN returns: logoURI, no tags, no extensions
  const tokens = allTokens.map(token => ({
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    logo: fixIPFSUrl(source === 'backend' ? token.logo : token.logoURI),
    address: token.address,
    chainId: token.chainId,
    coingeckoId: source === 'backend' ? token.coingeckoId : token.extensions?.coingeckoId,
    tags: token.tags || [],
  }));

  // Deduplicate tokens by symbol, prioritizing verified/community tokens
  const seenSymbols = new Map();
  const deduplicatedTokens = [];

  tokens.forEach(token => {
    const key = token.symbol;
    const existing = seenSymbols.get(key);

    // Priority: verified > community > unknown
    const isVerified = token.tags.includes('verified') || token.tags.includes('strict');
    const isCommunity = token.tags.includes('community');
    const existingIsVerified = existing?.tags.includes('verified') || existing?.tags.includes('strict');
    const existingIsCommunity = existing?.tags.includes('community');

    if (!existing) {
      seenSymbols.set(key, token);
      deduplicatedTokens.push(token);
    } else if (isVerified && !existingIsVerified) {
      // Replace with verified version
      const index = deduplicatedTokens.findIndex(t => t.symbol === key);
      if (index !== -1) {
        deduplicatedTokens[index] = token;
        seenSymbols.set(key, token);
      }
    } else if (isCommunity && !existingIsVerified && !existingIsCommunity) {
      // Replace with community version if current is unknown
      const index = deduplicatedTokens.findIndex(t => t.symbol === key);
      if (index !== -1) {
        deduplicatedTokens[index] = token;
        seenSymbols.set(key, token);
      }
    }
  });

  return deduplicatedTokens;
}

async function getTokensByOwner(connection, publicKey) {
  const { value: tokensLegacy } =
    await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });

  const { value: tokens2022 } = await connection.getParsedTokenAccountsByOwner(
    publicKey,
    {
      programId: TOKEN_2022_PROGRAM_ID,
    },
  );

  const values = [...tokensLegacy, ...tokens2022];

  return values.map(item => {
    const account = item.account.data.parsed.info;
    const { program } = item.account.data;
    const { mint, owner, tokenAmount, extensions } = account;
    const { amount, decimals, uiAmount } = tokenAmount;
    return { mint, owner, amount, decimals, uiAmount, program, extensions };
  });
}

async function getFeaturedTokenList(networkId = 'solana-mainnet') {
  try {
    const response = await http.get(
      `${SALMON_API_URL}/v1/${networkId}/ft/top?interval=24h&limit=5`
    );

    if (response.data && Array.isArray(response.data)) {
      return response.data.map(token => ({
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logo: fixIPFSUrl(token.logo || token.icon),
        address: token.address || token.id,
        coingeckoId: token.coingeckoId || null,
        tags: token.tags || [],
      }));
    }
    return [];
  } catch (error) {
    console.log('Failed to get featured tokens from backend:', error.message);
    return [];
  }
}

/**
 * Fetch token metadata only for specific mint addresses
 * Uses the batch endpoint which is more efficient than fetching all tokens
 *
 * @param {string[]} mintAddresses - Array of mint addresses to fetch metadata for
 * @param {string} networkId - Network identifier (default: 'solana-mainnet')
 * @returns {Promise<Array>} Array of normalized token metadata
 */
async function getTokenMetadataByMints(mintAddresses, networkId = 'solana-mainnet') {
  if (!mintAddresses || mintAddresses.length === 0) {
    return [];
  }

  // Remove duplicates
  const uniqueMints = [...new Set(mintAddresses)];

  // Split into chunks if more than BATCH_CHUNK_SIZE mints
  const chunks = [];
  for (let i = 0; i < uniqueMints.length; i += BATCH_CHUNK_SIZE) {
    chunks.push(uniqueMints.slice(i, i + BATCH_CHUNK_SIZE));
  }

  let allTokens = [];

  for (const chunk of chunks) {
    const mintsParam = chunk.join(',');

    // Try backend batch endpoint first
    try {
      const response = await http.get(
        `${SALMON_STATIC_API_URL}/v1/${networkId}/ft/batch?mints=${mintsParam}`
      );
      const tokens = response.data.map(token => ({
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logo: fixIPFSUrl(token.logo),
        address: token.address,
        chainId: token.chainId,
        coingeckoId: token.coingeckoId,
        tags: token.tags || [],
      }));
      allTokens = allTokens.concat(tokens);
    } catch {
      console.warn('Token batch: backend unavailable, trying Jupiter fallback...');

      // Fallback: fetch from Jupiter and filter locally
      try {
        const response = await http.get(TOKEN_LIST_URL_JUP);
        const jupiterTokens = response.data;
        const chunkSet = new Set(chunk);
        const filteredTokens = jupiterTokens
          .filter(token => chunkSet.has(token.address))
          .map(token => ({
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            logo: fixIPFSUrl(token.logoURI),
            address: token.address,
            chainId: token.chainId,
            coingeckoId: token.extensions?.coingeckoId,
            tags: token.tags || [],
          }));
        allTokens = allTokens.concat(filteredTokens);
      } catch {
        console.warn('Token batch: Jupiter fallback also failed for chunk');
        // Continue with next chunk, some tokens may not have metadata
      }
    }
  }

  return allTokens;
}

/**
 * Get verified tokens from backend
 * Uses the verified endpoint which returns a curated list instead of the full 71MB list
 *
 * @param {string} networkId - Network identifier (default: 'solana-mainnet')
 * @returns {Promise<Array>} Array of verified token metadata
 */
async function getVerifiedTokens(networkId = 'solana-mainnet') {
  try {
    // Try backend verified endpoint first
    const response = await http.get(`${SALMON_API_URL}/v1/${networkId}/ft/verified`);
    const tokens = response.data.map(token => ({
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      logo: fixIPFSUrl(token.logo),
      address: token.address,
      chainId: token.chainId,
      coingeckoId: token.coingeckoId,
      tags: token.tags || [],
    }));
    return tokens;
  } catch (error) {
    console.warn('Verified tokens: backend unavailable, using fallback...');

    // Fallback: use featured tokens or filter from main list
    try {
      const featuredList = await getFeaturedTokenList();
      return featuredList;
    } catch {
      console.warn('Verified tokens: fallback failed, returning empty list');
      return [];
    }
  }
}

/**
 * Search tokens by query string
 * Searches token name, symbol, or address
 *
 * @param {string} query - Search query (name, symbol, or address)
 * @param {string} networkId - Network identifier (default: 'solana-mainnet')
 * @returns {Promise<Array>} Array of matching token metadata
 */
async function searchTokens(query, networkId = 'solana-mainnet') {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    // Try backend search endpoint first
    const response = await http.get(
      `${SALMON_API_URL}/v1/${networkId}/ft/search?query=${encodeURIComponent(query)}`
    );
    const tokens = response.data.map(token => ({
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      logo: fixIPFSUrl(token.logo),
      address: token.address,
      chainId: token.chainId,
      coingeckoId: token.coingeckoId,
      tags: token.tags || [],
    }));
    return tokens;
  } catch (error) {
    console.warn('Token search: backend unavailable, using local search...');

    // Fallback: search locally in full token list
    try {
      const allTokens = await getTokenList();
      const lowerQuery = query.toLowerCase();
      return allTokens.filter(token =>
        token.name?.toLowerCase().includes(lowerQuery) ||
        token.symbol?.toLowerCase().includes(lowerQuery) ||
        token.address?.toLowerCase().includes(lowerQuery)
      ).slice(0, 50); // Limit results to avoid performance issues
    } catch {
      console.warn('Token search: local search failed');
      return [];
    }
  }
}

module.exports = {
  getTokenList,
  getTokensByOwner,
  getFeaturedTokenList,
  getTokenMetadataByMints,
  getVerifiedTokens,
  searchTokens,
};
