'use strict';

// PRIMEROS AJUSTES - Roadmap: Dejar únicamente Solana y BTC
// Fecha: 2025-10-31
// LAZY LOADING EXTREMO: Los adapters de blockchain se cargan dinámicamente solo cuando se usan
const {
  BITCOIN,
  // ETHEREUM,
  // NEAR,
  SOLANA,
  // ECLIPSE,
} = require('../constants/blockchains');

const create = async ({ network, mnemonic, index = 0 }) => {
  switch (network.blockchain) {
    case BITCOIN: {
      // Lazy load de Bitcoin adapter - solo se carga si el usuario usa Bitcoin
      const { create: createBitcoin } = await import(
        './bitcoin-account-factory'
      );
      return createBitcoin({ network, mnemonic, index });
    }
    // case ETHEREUM: { // Comentado - No se usa en esta versión
    //   const { create: createEthereum } = await import('./ethereum-account-factory');
    //   return createEthereum({ network, mnemonic, index });
    // }
    // case NEAR: { // Comentado - No se usa en esta versión
    //   const { create: createNear } = await import('./near-account-factory');
    //   return createNear({ network, mnemonic, index });
    // }
    case SOLANA: {
      // Lazy load de Solana adapter - solo se carga si el usuario usa Solana
      const { create: createSolana } = await import('./solana-account-factory');
      return createSolana({ network, mnemonic, index });
    }
    // case ECLIPSE: { // Comentado - No se usa en esta versión
    //   const { create: createEclipse } = await import('./eclipse-account-factory');
    //   return createEclipse({ network, mnemonic, index });
    // }
    default:
      return null;
  }
};

const createMany = async ({ network, mnemonic, indexes }) => {
  const accounts = await Promise.all(
    indexes.map(async index => create({ network, mnemonic, index })),
  );

  return accounts.reduce((result, account) => {
    if (account) {
      result[account.index] = account;
    }
    return result;
  }, []);
};

module.exports = { create, createMany };
