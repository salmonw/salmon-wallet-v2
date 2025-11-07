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

// PRIMEROS AJUSTES - Roadmap: Dejar únicamente Solana y BTC
// Fecha: 2025-10-31
const EXPLORERS = {
  SOLANA: {
    mainnet: SOLANA_EXPLORERS,
    'mainnet-beta': SOLANA_EXPLORERS,
    testnet: SOLANA_EXPLORERS,
    devnet: SOLANA_EXPLORERS,
  },
  // ETHEREUM: { // Comentado - No se usa en esta versión
  //   mainnet: {
  //     ETHERSCAN: {
  //       name: 'Etherscan',
  //       url: 'https://etherscan.io/tx/{txId}',
  //     },
  //   },
  //   goerli: {
  //     ETHERSCAN: {
  //       name: 'Etherscan',
  //       url: 'https://goerli.etherscan.io/tx/{txId}',
  //     },
  //   },
  // },
  // NEAR: { // Comentado - No se usa en esta versión
  //   mainnet: {
  //     NEAR_EXPLORER: {
  //       name: 'Near Explorer',
  //       url: 'https://explorer.near.org/transactions/{txId}',
  //     },
  //   },
  //   testnet: {
  //     NEAR_EXPLORER: {
  //       name: 'Near Explorer',
  //       url: 'https://explorer.testnet.near.org/transactions/{txId}',
  //     },
  //   },
  // },
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
  // ECLIPSE: { // Comentado - No se usa en esta versión
  //   mainnet: {
  //     ECLIPSE_SCAN: {
  //       name: 'Eclipsescan',
  //       url: 'https://eclipsescan.xyz/tx/{txId}',
  //     },
  //     ECLIPSE_EXPLORER: {
  //       name: 'Eclipse Explorer',
  //       url: 'https://explorer.dev.eclipsenetwork.xyz/tx/{txId}',
  //     },
  //   },
  //   testnet: {
  //     ECLIPSE_SCAN: {
  //       name: 'Eclipsescan',
  //       url: 'https://eclipsescan.xyz/tx/{txId}?cluster=testnet',
  //     },
  //     ECLIPSE_EXPLORER: {
  //       name: 'Eclipse Explorer',
  //       url: 'https://explorer.dev.eclipsenetwork.xyz/tx/{txId}?cluster=testnet',
  //     },
  //   },
  //   devnet: {
  //     ECLIPSE_SCAN: {
  //       name: 'Eclipsescan',
  //       url: 'https://eclipsescan.xyz/tx/{txId}?cluster=devnet',
  //     },
  //     ECLIPSE_EXPLORER: {
  //       name: 'Eclipse Explorer',
  //       url: 'https://explorer.dev.eclipsenetwork.xyz/tx/{txId}?cluster=devnet',
  //     },
  //   },
  // },
};

const DEFAULT_EXPLORERS = {
  SOLANA: 'SOLSCAN',
  // NEAR: 'NEAR_EXPLORER', // Comentado - No se usa en esta versión
  // ETHEREUM: 'ETHERSCAN', // Comentado - No se usa en esta versión
  BITCOIN: 'BLOCKCYPHER',
  // ECLIPSE: 'ECLIPSE_SCAN', // Comentado - No se usa en esta versión
};

export { EXPLORERS, DEFAULT_EXPLORERS };
