const axios = require('../axios-wrapper').default;
const { Transaction, PublicKey } = require('@solana/web3.js');
const TransactionError = require('../../errors/TransactionError');
const { SALMON_API_URL } = require('../../constants/environment');

const getAll = async (network, publicKey, noCache = false) => {
  const params = { publicKey, noCache };
  const { data } = await axios.get(`${SALMON_API_URL}/v1/${network.id}/nft`, {
    params,
  });
  return data;
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
    .filter(e => e !== undefined);
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
  return nfts.filter(nft => !nft.collection);
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

module.exports = {
  getAll,
  getAllGroupedByCollection,
  getNftByAddress,
  createNftBurnTx,
  burnNft,
};
