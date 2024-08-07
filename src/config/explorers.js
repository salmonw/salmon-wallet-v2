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
  ETHEREUM: {
    mainnet: {
      ETHERSCAN: {
        name: 'Etherscan',
        url: 'https://etherscan.io/tx/{txId}',
      },
    },
    goerli: {
      ETHERSCAN: {
        name: 'Etherscan',
        url: 'https://goerli.etherscan.io/tx/{txId}',
      },
    },
  },
  NEAR: {
    mainnet: {
      NEAR_EXPLORER: {
        name: 'Near Explorer',
        url: 'https://explorer.near.org/transactions/{txId}',
      },
    },
    testnet: {
      NEAR_EXPLORER: {
        name: 'Near Explorer',
        url: 'https://explorer.testnet.near.org/transactions/{txId}',
      },
    },
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
  ECLIPSE: {
    mainnet: {
      ECLIPSE_EXPLORER: {
        name: 'Eclipse Explorer',
        url: 'https://explorer.dev.eclipsenetwork.xyz/tx/{txId}',
      },
    },
    testnet: {
      ECLIPSE_EXPLORER: {
        name: 'Eclipse Explorer',
        url: 'https://explorer.dev.eclipsenetwork.xyz/tx/{txId}?cluster=testnet',
      },
      SOLSCAN: {
        name: 'Solscan',
        url: 'https://solscan.io/tx/{txId}?cluster=custom&customUrl=https://testnet.dev2.eclipsenetwork.xyz',
      },
      MODULAR_CLOUD: {
        name: 'Modular Cloud Testnet',
        url: 'https://explorer.modular.cloud/eclipse-testnet/transactions/{txId}',
      },
    },
    devnet: {
      ECLIPSE_EXPLORER: {
        name: 'Eclipse Explorer',
        url: 'https://explorer.dev.eclipsenetwork.xyz/tx/{txId}?cluster=devnet',
      },
      SOLSCAN: {
        name: 'Solscan',
        url: 'https://solscan.io/tx/{txId}?cluster=custom&customUrl=https://staging-rpc.dev2.eclipsenetwork.xyz',
      },
    },
  },
};

const DEFAULT_EXPLORERS = {
  SOLANA: 'SOLSCAN',
  NEAR: 'NEAR_EXPLORER',
  ETHEREUM: 'ETHERSCAN',
  BITCOIN: 'BLOCKCYPHER',
  ECLIPSE: 'ECLIPSE_EXPLORER',
};

export { EXPLORERS, DEFAULT_EXPLORERS };
