const { TOKEN_2022_PROGRAM_ID } = require('@solana/spl-token');
const { TOKEN_PROGRAM_ID } = require('../../constants/token-constants');
const http = require('../axios-wrapper').default;

const TOKEN_LIST_URL_JUP = 'https://cache.jup.ag/tokens';

const TOKEN_LIST_URL_CDN =
  'https://cdn.jsdelivr.net/gh/solana-labs/token-list@latest/src/tokens/solana.tokenlist.json';

let tokenList = [];

// Helper function to fix problematic IPFS URLs
const fixIPFSUrl = (url) => {
  if (!url) return url;

  // Fix cf-ipfs.com URLs (DNS issues)
  if (url.includes('cf-ipfs.com/ipfs/')) {
    const hash = url.split('/ipfs/')[1];
    return `https://ipfs.io/ipfs/${hash}`;
  }

  // Fix ipfs.nftstorage.link URLs (SSL issues)
  if (url.includes('.ipfs.nftstorage.link')) {
    const hash = url.split('://')[1].split('.ipfs')[0];
    return `https://ipfs.io/ipfs/${hash}`;
  }

  return url;
};

const retrieveTokenList = async () => {
  if (Array.isArray(tokenList) && tokenList.length > 0) {
    return tokenList;
  }

  let response;

  try {
    response = await http.get(TOKEN_LIST_URL_JUP);
    tokenList = response.data;
  } catch (error) {
    console.error(
      `Cannot retrieve token list from ${TOKEN_LIST_URL_JUP}, using fallback ${TOKEN_LIST_URL_CDN}`,
    );
    response = await http.get(TOKEN_LIST_URL_CDN);
    tokenList = response.data.tokens;
  }

  return tokenList;
};

async function getTokenList() {
  const allTokens = await retrieveTokenList();

  const tokens = allTokens.map(token => ({
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    logo: fixIPFSUrl(token.logoURI),
    address: token.address,
    chainId: token.chainId,
    coingeckoId: token.extensions?.coingeckoId,
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

async function getTokenBySymbol(symbol) {
  const tokens = await getTokenList();
  return tokens.filter(t => t.symbol == symbol);
}

async function getTokenByAddress(address) {
  const tokens = await getTokenList();
  return tokens.filter(t => t.address == address);
}

async function getFeaturedTokenList() {
  const tokens = await getTokenList();
  const featuredList = [
    { symbol: 'SOL', name: 'Wrapped SOL' },
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'SRM', name: 'Serum' },
    { symbol: 'FIDA', name: 'Bonfida' },
    { symbol: 'RAY', name: 'Raydium' },
  ];
  return tokens.filter(
    t =>
      featuredList.some(el => el.symbol === t.symbol && el.name === t.name) &&
      t.chainId === 101,
  );
}

module.exports = {
  getTokenList,
  getTokensByOwner,
  getTokenBySymbol,
  getTokenByAddress,
  getFeaturedTokenList,
};
