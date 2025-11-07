const {
  TOKEN_2022_PROGRAM_ID,
  getMint,
  ExtensionType,
  getExtensionData,
  getMetadataPointerState,
  getTokenMetadata,
} = require('@solana/spl-token');
const { unpack } = require('@solana/spl-token-metadata');
const { TOKEN_PROGRAM_ID } = require('../../constants/token-constants');
const { PublicKey } = require('@solana/web3.js');

const canonicalUrl = url => {
  return url?.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/');
};

const getMetadata = async (connection, info, programId) => {
  const mintInfo = await getMint(
    connection,
    new PublicKey(info.mint),
    'confirmed',
    programId,
  );

  // if it is an NFT
  if (mintInfo.supply == 1) {
    return null;
  }

  const {
    mint: address,
    tokenAmount: { amount, decimals, uiAmount },
    extensions,
  } = info;

  let metadata = {
    ...mintInfo,
    address,
    amount,
    decimals,
    uiAmount,
    extensions,
  };

  if (programId == TOKEN_2022_PROGRAM_ID) {
    const metadataPointer = getMetadataPointerState(mintInfo);

    if (metadataPointer?.metadataAddress) {
      let tokenMetadata;

      // this if is to avoid calling getMint twice if not neccessary
      if (metadataPointer.metadataAddress.equals(mintInfo.address)) {
        const data = getExtensionData(
          ExtensionType.TokenMetadata,
          mintInfo.tlvData,
        );
        if (data !== null) {
          tokenMetadata = unpack(data);
        }
      } else {
        tokenMetadata = await getTokenMetadata(
          connection,
          metadataPointer.metadataAddress,
          'confirmed',
          programId,
        );
      }

      metadata.name = tokenMetadata?.name;
      metadata.symbol = tokenMetadata?.symbol;
      metadata.mint = tokenMetadata?.mint;

      if (tokenMetadata?.uri) {
        try {
          const uri = canonicalUrl(tokenMetadata.uri);
          const response = await fetch(uri);
          const json = await response.json();

          metadata.logo = canonicalUrl(json?.image);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  return metadata;
};

async function getTokensByOwner(connection, publicKey) {
  const [tokensLegacy, tokens2022] = await Promise.all([
    connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    }),
    connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_2022_PROGRAM_ID,
    }),
  ]);

  const tokensInfos = [
    {
      infos: tokensLegacy.value.map(token => token.account.data.parsed.info),
      programId: TOKEN_PROGRAM_ID,
    },
    {
      infos: tokens2022.value.map(token => token.account.data.parsed.info),
      programId: TOKEN_2022_PROGRAM_ID,
    },
  ];

  const tokens = await Promise.all(
    tokensInfos.flatMap(({ infos, programId }) =>
      infos.map(info => getMetadata(connection, info, programId)),
    ),
  );

  return tokens.filter(Boolean);
}

module.exports = { getTokensByOwner };
