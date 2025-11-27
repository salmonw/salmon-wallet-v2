'use strict';

const { BITCOIN, SOLANA } = require('../constants/blockchains');

const create = async ({ network, mnemonic, index = 0 }) => {
  switch (network.blockchain) {
    case BITCOIN: {
      const { create: createBitcoin } = await import(
        './bitcoin-account-factory'
      );
      return createBitcoin({ network, mnemonic, index });
    }
    case SOLANA: {
      const { create: createSolana } = await import('./solana-account-factory');
      return createSolana({ network, mnemonic, index });
    }
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
