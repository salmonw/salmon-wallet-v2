'use strict';

const bip39 = require('bip39');
const ecc = require('@bitcoinerlab/secp256k1');
const { BIP32Factory } = require('./bip32-wrapper');
const bip32 = BIP32Factory(ecc);
const { Keypair } = require('@solana/web3.js');
const { derivePath } = require('ed25519-hd-key');

function generateMnemonic(strength = 128) {
  return bip39.generateMnemonic(strength);
}

async function mnemonicToSeed(mnemonic) {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid seed words');
  }
  return bip39.mnemonicToSeed(mnemonic);
}

async function generateKeyPair(mnemonic, path) {
  const seed = await mnemonicToSeed(mnemonic);
  return Keypair.fromSeed(derivePath(path, seed.toString('hex')).key);
}

async function generateChild(mnemonic, path) {
  const seed = await mnemonicToSeed(mnemonic);
  const root = bip32.fromSeed(seed);
  return root.derivePath(path);
}

module.exports = {
  generateMnemonic,
  generateKeyPair,
  generateChild,
};
