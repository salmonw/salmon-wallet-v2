const axios = require('../axios-wrapper').default;
const {
  Transaction,
  PublicKey,
  VersionedMessage,
  VersionedTransaction,
  Connection,
} = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID } = require('@solana/spl-token');
const TransactionError = require('../../errors/TransactionError');
const { ME_PROGRAM_ID } = require('../../constants/token-constants');
const { SALMON_API_URL } = require('../../constants/environment');
const { normalizeIpfsUrl } = require('../../lib/url-utils');

/**
 * Transforms Helius DAS API asset to the format expected by the wallet
 * @param {object} asset - The Helius DAS API asset
 * @param {string} owner - The owner's public key
 * @returns {object} - Transformed NFT object
 */
const transformDasAsset = (asset, owner) => {
  const metadata = asset.content?.metadata || {};
  const links = asset.content?.links || {};
  const files = asset.content?.files || [];
  const collection = asset.grouping?.find(g => g.group_key === 'collection');

  return {
    mint: { address: asset.id },
    owner,
    name: metadata.name || '',
    symbol: metadata.symbol || '',
    uri: normalizeIpfsUrl(asset.content?.json_uri) || '',
    json: metadata,
    updateAuthorityAddress:
      asset.authorities?.find(a => a.scopes?.includes('full'))?.address || null,
    sellerFeeBasisPoints: asset.royalty?.basis_points || 0,
    collection: collection
      ? { key: collection.group_value, verified: true }
      : null,
    edition:
      asset.supply?.edition_nonce != null
        ? { isOriginal: asset.supply.edition_nonce === 0 }
        : null,
    tokenStandard: asset.interface || null,
    media: normalizeIpfsUrl(metadata.image) || normalizeIpfsUrl(links.image) || normalizeIpfsUrl(files[0]?.uri) || null,
    description: metadata.description || '',
    compressed: asset.compression?.compressed || false,
    extras: {
      attributes: metadata.attributes || [],
      properties: metadata.properties || {},
      creators: asset.creators || [],
    },
  };
};

/**
 * Fetches NFTs directly from Helius DAS API, bypassing the backend
 * This is used when the backend endpoint fails due to IP restrictions
 * @param {object} network - The network configuration object
 * @param {string} publicKey - The owner's public key
 * @param {object} options - Pagination options (limit, offset)
 * @returns {Promise<object>} - NFTs with pagination info
 */
const getAllFromHeliusDirect = async (network, publicKey, options = {}) => {
  const { nodeUrl } = network.config;

  const limit = Math.min(Math.max(1, parseInt(options.limit, 10) || 50), 100);
  const offset = Math.max(0, parseInt(options.offset, 10) || 0);

  console.log(
    `[getAllFromHeliusDirect] Fetching NFTs directly from Helius for: ${publicKey} (limit: ${limit}, offset: ${offset})`,
  );

  try {
    const response = await axios.post(
      nodeUrl,
      {
        jsonrpc: '2.0',
        id: 'get-nfts-by-owner',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: publicKey,
          page: 1,
          limit: 1000, // Fetch all NFTs, then paginate locally
          displayOptions: {
            showFungible: false,
            showNativeBalance: false,
          },
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      },
    );

    const assets = response.data?.result?.items || [];
    console.log(
      `[getAllFromHeliusDirect] Helius DAS API returned ${assets.length} assets for: ${publicKey}`,
    );

    // Filter out burnt NFTs
    const filteredAssets = assets.filter(asset => !asset.burnt);
    console.log(
      `[getAllFromHeliusDirect] Filtered out ${assets.length - filteredAssets.length} burnt NFTs`,
    );

    // Fetch Token2022 extensions for enrichment
    const connection = new Connection(nodeUrl);
    let extensionsMap = {};
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        new PublicKey(publicKey),
        { programId: TOKEN_2022_PROGRAM_ID }
      );

      for (const account of tokenAccounts.value || []) {
        const tokenInfo = account.account.data.parsed.info;
        const { mint, extensions } = tokenInfo;
        if (extensions) {
          extensionsMap[mint] = extensions;
        }
      }
      console.log(
        `[getAllFromHeliusDirect] Fetched Token2022 extensions for ${Object.keys(extensionsMap).length} tokens`,
      );
    } catch (err) {
      console.warn('[getAllFromHeliusDirect] Failed to fetch Token2022 extensions:', err.message);
    }

    const allNfts = filteredAssets.map(asset => {
      const nft = transformDasAsset(asset, publicKey);
      // Enrich with Token2022 extensions if available
      nft.extensions = extensionsMap[asset.id] || [];
      return nft;
    });
    const total = allNfts.length;
    const paginatedNfts = allNfts.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      data: paginatedNfts,
      pagination: {
        total,
        limit,
        offset,
        hasMore,
        nextOffset: hasMore ? offset + limit : null,
      },
    };
  } catch (error) {
    console.error(
      `[getAllFromHeliusDirect] Helius DAS API error: ${error.message}`,
    );
    throw error;
  }
};

/**
 * Fetches all NFTs for a given public key
 * Tries direct Helius API call first, falls back to backend endpoint if it fails
 * @param {object} network - The network configuration object
 * @param {string} publicKey - The owner's public key
 * @param {boolean} noCache - Whether to bypass cache
 * @returns {Promise<Array>} - Array of NFTs
 */
const getAll = async (network, publicKey, noCache = false) => {
  // PRIMARY: Try direct Helius API first
  try {
    const result = await getAllFromHeliusDirect(network, publicKey);
    return result.data;
  } catch (heliusError) {
    console.warn(
      `[getAll] Direct Helius API call failed (${heliusError.message}), falling back to backend endpoint`,
    );

    // FALLBACK: Try backend endpoint if Helius fails
    try {
      const params = { publicKey, noCache };
      const { data } = await axios.get(`${SALMON_API_URL}/v1/${network.id}/nft`, {
        params,
        timeout: 15000,
      });
      return data;
    } catch (backendError) {
      console.error(
        `[getAll] Both direct Helius API and backend endpoint failed: ${backendError.message}`,
      );
      throw backendError;
    }
  }
};

const getAllGroupedByCollection = async (network, owner) => {
  const nfts = await getAll(network, owner);
  const nftsByCollection = getNftsByCollection(nfts);
  const nftsWithoutCollection = getNftsWithoutCollection(nfts);
  return [...nftsByCollection, ...nftsWithoutCollection];
};

const getCollections = nfts => {
  const collections = nfts
    .map(nft => nft.collection?.name)
    .filter(e => e);
  return Array.from(new Set(collections));
};

const getNftsByCollection = nfts => {
  const collections = getCollections(nfts);
  return collections
    .map(collection => {
      const items = nfts.filter(nft => nft.collection?.name === collection);
      const length = items.length;
      return {
        collection,
        length,
        items,
        thumb: items[0].media,
      };
    })
    .sort((a, b) => b.length - a.length);
};

const getNftsWithoutCollection = nfts => {
  return nfts.filter(nft => !nft.collection?.name);
};

const getNftByAddress = async (network, mintAddress) => {
  try {
    const response = await axios.get(
      `${SALMON_API_URL}/v1/${network.id}/nft/${mintAddress}`,
    );
    if (response?.data?.collection) {
      return response.data;
    }
    return null;
  } catch (e) {
    return null;
  }
};

const getCollectionGroupByFilter = async (network, filterType) => {
  try {
    const response = await axios.get(
      `${SALMON_API_URL}/v1/${network.id}/nft/hyperspace/collections/${filterType}`,
    );
    if (response) {
      return response.data;
    }
    return null;
  } catch (e) {
    return null;
  }
};

const getCollectionById = async (network, collectionId) => {
  try {
    const response = await axios.get(
      `${SALMON_API_URL}/v1/${network.id}/nft/hyperspace/collection/${collectionId}`,
    );
    if (response) {
      return response.data;
    }
    return null;
  } catch (e) {
    return null;
  }
};

const getCollectionItemsById = async (network, collectionId, pageNumber) => {
  try {
    const response = await axios.get(
      `${SALMON_API_URL}/v1/${network.id}/nft/hyperspace/collection/${collectionId}/items/${pageNumber}`,
    );
    if (response) {
      return response.data;
    }
    return null;
  } catch (e) {
    return null;
  }
};

const burnNft = async (connection, transaction, signer) => {
  const txid = await connection.sendTransaction(transaction, [signer], {
    skipPreflight: true,
  });

  console.log(`Send transaction with id ${txid}.`);

  const confirmation = await connection.confirmTransaction(txid, 'confirmed');
  if (confirmation?.value?.err) {
    console.error(confirmation);
    throw new TransactionError(
      `The transaction with id ${txid} cannot be confirmed.`,
      txid,
    );
  }

  return txid;
};

const createNftBurnTx = async (network, mint, signer) => {
  const url = `${SALMON_API_URL}/v1/${network.id}/nft/${mint}?owner=${signer}`;
  const { data } = await axios.post(url, null);

  // for some reason serialize/deserialize transaction from api to the adapter
  // doesn't work properly, so, I rebuild the transaction from the response data
  // (transaction in JSON format)
  const transaction = new Transaction();

  transaction.recentBlockhash = data.recentBlockhash;
  transaction.feePayer = signer;

  const instructions = data.instructions;

  const keys = instructions[0].keys.map(k => {
    const { pubkey, ...rest } = k;

    return { pubkey: new PublicKey(pubkey), ...rest };
  });

  instructions[0].keys = keys;
  instructions[0].programId = new PublicKey(instructions[0].programId);
  transaction.instructions = instructions;

  return transaction;
};

const getListedByOwner = async (network, ownerAddress) => {
  try {
    const response = await axios.get(
      `${SALMON_API_URL}/v1/${network.id}/nft/listed/${ownerAddress}`,
    );
    if (response) {
      return response.data;
    }
    return null;
  } catch (e) {
    return null;
  }
};

const getBidsByOwner = async (network, ownerAddress) => {
  try {
    const response = await axios.get(
      `${SALMON_API_URL}/v1/${network.id}/nft/bids/${ownerAddress}`,
    );
    if (response) {
      return response.data;
    }
    return null;
  } catch (e) {
    return null;
  }
};

const listNft = async (network, connection, keyPair, tokenAddress, price) => {
  const url = `${SALMON_API_URL}/v1/${network.id}/nft/list-tx`;
  const params = {
    sellerAddress: keyPair.publicKey.toBase58(),
    tokenAddress,
    price,
  };
  const response = await axios.get(url, { params });
  const { createListTx } = response.data;
  const data = createListTx.data;
  return sendSerializedTx(connection, data, keyPair);
};

const unlistNft = async (network, connection, keyPair, tokenAddress) => {
  const url = `${SALMON_API_URL}/v1/${network.id}/nft/unlist-tx`;
  const params = { sellerAddress: keyPair.publicKey.toBase58(), tokenAddress };
  const response = await axios.get(url, { params });
  const { createDelistTx } = response.data;
  const data = createDelistTx.data;
  return sendSerializedTx(connection, data, keyPair);
};

const buyNft = async (
  network,
  connection,
  keyPair,
  tokenAddress,
  price,
  marketplaceId,
) => {
  const url = `${SALMON_API_URL}/v1/${network.id}/nft/buy-tx`;
  const params = {
    buyerAddress: keyPair.publicKey.toBase58(),
    tokenAddress,
    price,
  };
  const response = await axios.get(url, { params });
  const { createBuyTx } = response.data;
  const data = createBuyTx.data;
  if (marketplaceId === ME_PROGRAM_ID) {
    return sendRawTx(connection, data, keyPair);
  } else {
    return sendSerializedTx(connection, data, keyPair);
  }
};

const bidNft = async (network, connection, keyPair, tokenAddress, price) => {
  const url = `${SALMON_API_URL}/v1/${network.id}/nft/bid-tx`;
  const params = {
    buyerAddress: keyPair.publicKey.toBase58(),
    tokenAddress,
    price,
  };
  const response = await axios.get(url, { params });
  const { createBidTx } = response.data;
  const data = createBidTx.data;
  return sendSerializedTx(connection, data, keyPair);
};

const cancelBidNft = async (network, connection, keyPair, tokenAddress) => {
  const url = `${SALMON_API_URL}/v1/${network.id}/nft/cancel-bid-tx`;
  const params = { buyerAddress: keyPair.publicKey.toBase58(), tokenAddress };
  const response = await axios.get(url, { params });
  const { createCancelBidTx } = response.data;
  const data = createCancelBidTx.data;
  return sendSerializedTx(connection, data, keyPair);
};

const sendSerializedTx = async (connection, txBuffer, keyPair) => {
  const message = VersionedMessage.deserialize(Buffer.from(txBuffer));
  const transaction = new VersionedTransaction(message);
  transaction.sign([keyPair]);
  const txId = await connection.sendTransaction(transaction, {
    skipPreflight: true,
  });
  return txId;
};

const sendRawTx = async (connection, txBuffer, keyPair) => {
  const transaction = Transaction.from(Buffer.from(txBuffer));
  transaction.partialSign(keyPair);
  const txId = await connection.sendRawTransaction(transaction.serialize());
  return txId;
};

module.exports = {
  getAll,
  getAllGroupedByCollection,
  getNftByAddress,
  getCollectionGroupByFilter,
  getCollectionById,
  getCollectionItemsById,
  createNftBurnTx,
  burnNft,
  getListedByOwner,
  getBidsByOwner,
  listNft,
  unlistNft,
  buyNft,
  bidNft,
  cancelBidNft,
};
