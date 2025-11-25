const SOLANA_EXPLORERS = {
  SOLSCAN: {
    name: 'Solscan',
    url: 'https://solscan.io/tx/{txId}',
  },
  SOLANA_FM: {
    name: 'Solana FM',
    url: 'https://solana.fm/tx/{txId}',
  },
  SOLANA_EXPLORER: {
    name: 'Solana Explorer',
    url: 'https://explorer.solana.com/tx/{txId}',
  },
  SOLANA_BEACH: {
    name: 'Solana Beach',
    url: 'https://solanabeach.io/transaction/{txId}',
  },
};

const EXPLORERS = {
  SOLANA: {
    mainnet: SOLANA_EXPLORERS,
    'mainnet-beta': SOLANA_EXPLORERS,
    testnet: SOLANA_EXPLORERS,
    devnet: SOLANA_EXPLORERS,
  },
  BITCOIN: {
    mainnet: {
      BLOCKCYPHER: {
        name: 'Blockcypher',
        url: 'https://live.blockcypher.com/btc/tx/{txId}',
      },
    },
    testnet: {
      BLOCKCYPHER: {
        name: 'Blockcypher',
        url: 'https://live.blockcypher.com/btc-testnet/tx/{txId}',
      },
    },
  },
};

const DEFAULT_EXPLORERS = {
  SOLANA: 'SOLSCAN',
  BITCOIN: 'BLOCKCYPHER',
};

export { EXPLORERS, DEFAULT_EXPLORERS };
