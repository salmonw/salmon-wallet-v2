'use strict';

const EclipseAccount = require('../services/eclipse/EclipseAccount');
const { generateKeyPair } = require('../services/seed-service');
const { SOL } = require('../constants/coin-types');

const create = async ({ network, mnemonic, index = 0 }) => {
  const path = `m/44'/${SOL}'/${index}'/0'`;
  const keyPair = await generateKeyPair(mnemonic, path);
  return new EclipseAccount({ network, index, path, keyPair });
};

module.exports = { create };
