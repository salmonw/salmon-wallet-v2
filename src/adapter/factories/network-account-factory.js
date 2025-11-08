'use strict';

// PRIMEROS AJUSTES - Roadmap: Dejar únicamente Solana y BTC
// Fecha: 2025-10-31
const { create: createBitcoin } = require('./bitcoin-account-factory');
// const { create: createEthereum } = require('./ethereum-account-factory'); // Comentado
// const { create: createNear } = require('./near-account-factory'); // Comentado
const { create: createSolana } = require('./solana-account-factory');
// const { create: createEclipse } = require('./eclipse-account-factory'); // Comentado
const {
  BITCOIN,
  // ETHEREUM,
  // NEAR,
  SOLANA,
  // ECLIPSE,
} = require('../constants/blockchains');

const create = async ({ network, mnemonic, index = 0 }) => {
  switch (network.blockchain) {
    case BITCOIN:
      return createBitcoin({ network, mnemonic, index });
    // case ETHEREUM: // Comentado - No se usa en esta versión
    //   return createEthereum({ network, mnemonic, index });
    // case NEAR: // Comentado - No se usa en esta versión
    //   return createNear({ network, mnemonic, index });
    case SOLANA:
      return createSolana({ network, mnemonic, index });
    // case ECLIPSE: // Comentado - No se usa en esta versión
    //   return createEclipse({ network, mnemonic, index });
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
