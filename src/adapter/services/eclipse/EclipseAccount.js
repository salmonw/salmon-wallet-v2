'use strict';

const bs58 = require('../bs58-wrapper').default;
const { Connection, PublicKey } = require('@solana/web3.js');
const nftService = require('./eclipse-nft-service');
const balanceService = require('./eclipse-balance-service');
const tokenListService = require('./eclipse-token-list-service');
const transferService = require('./eclipse-transfer-service');
const tokenService = require('./eclipse-token-service');
const nameService = require('./eclipse-name-service');
const validationService = require('./eclipse-validation-service');
const transactionService = require('./eclipse-transaction-service');

class EclipseAccount {
  constructor({ network, index, path, keyPair }) {
    this.network = network;
    this.index = index;
    this.path = path;
    this.keyPair = keyPair;
    this.publicKey = keyPair.publicKey;
  }

  retrieveSecurePrivateKey() {
    return bs58.encode(this.keyPair.secretKey);
  }

  async getConnection() {
    if (!this.connection) {
      const { nodeUrl } = this.network.config;
      this.connection = new Connection(nodeUrl, 'confirmed');
    }
    return this.connection;
  }

  async getCredit() {
    const connection = await this.getConnection();
    return connection.getBalance(this.publicKey);
  }

  async getTokens() {
    const connection = await this.getConnection();
    return tokenListService.getTokensByOwner(connection, this.publicKey);
  }

  async getBalance() {
    const connection = await this.getConnection();
    return balanceService.getBalance(connection, this.publicKey);
  }

  getReceiveAddress() {
    return this.publicKey.toBase58();
  }

  async getOrCreateTokenAccount(toPublicKey, token) {
    const connection = await this.getConnection();
    return tokenService.getOrCreateTokenAccount(
      connection,
      this.keyPair,
      token,
      toPublicKey,
    );
  }

  async validateDestinationAccount(address) {
    const connection = await this.getConnection();
    return validationService.validateDestinationAccount(connection, address);
  }

  async airdrop(amount) {
    const connection = await this.getConnection();
    return transferService.airdrop(connection, this.publicKey, amount);
  }

  async getAllNfts() {
    return nftService.getAll(this.network, this.publicKey.toBase58());
  }

  async getNft(mint) {
    return nftService.getNftByAddress(this.network, mint);
  }

  async getAllNftsGrouped() {
    return nftService.getAllGroupedByCollection(
      this.network,
      this.publicKey.toBase58(),
    );
  }

  async getCollectionGroup(filterType) {
    throw new Error('Not supported by Eclipse');
  }

  async getCollection(collectionId) {
    throw new Error('Not supported by Eclipse');
  }

  async getCollectionItems(collectionId, pageNumber = 1) {
    throw new Error('Not supported by Eclipse');
  }

  async getListedNfts(ownerAddress) {
    throw new Error('Not supported by Eclipse');
  }

  async getNftsBids(ownerAddress) {
    throw new Error('Not supported by Eclipse');
  }

  async createNftBurnTx(nft) {
    return nftService.createNftBurnTx(this.network, nft.mint, this.publicKey);
  }

  async confirmNftBurn(transaction) {
    const connection = await this.getConnection();
    return nftService.burnNft(connection, transaction, this.keyPair);
  }

  async getBestSwapQuote(inToken, outToken, amount, slippage = 0.5) {
    throw new Error('Not supported by Eclipse');
  }

  async expireSwapQuote(quote) {}

  async estimateTransactionsFee(messages, commitment = 'confirmed') {
    const connection = await this.getConnection();
    const values = await Promise.all(
      messages.map(message => connection.getFeeForMessage(message, commitment)),
    );
    return values
      .map(({ value }) => value)
      .reduce((sum, value) => sum + value, 0);
  }

  async estimateTransferFee(destination, token, amount, opts = {}) {
    const connection = await this.getConnection();
    return transferService.estimateFee(
      connection,
      this.keyPair,
      new PublicKey(destination),
      token,
      amount,
      opts,
    );
  }

  async requiresMemo(destination, token) {
    const connection = await this.getConnection();
    return transferService.requiresMemo(
      connection,
      new PublicKey(destination),
      token,
    );
  }

  async createTransferTransaction(destination, token, amount, opts = {}) {
    const connection = await this.getConnection();
    return transferService.createTransaction(
      connection,
      this.keyPair,
      new PublicKey(destination),
      token,
      amount,
      opts,
    );
  }

  async confirmTransferTransaction(txId) {
    const connection = await this.getConnection();
    return transferService.confirmTransaction(connection, txId);
  }

  async createSwapTransaction(quote) {
    throw new Error('Not supported by Eclipse');
  }

  async listNft(tokenAddress, price) {
    throw new Error('Not supported by Eclipse');
  }

  async unlistNft(tokenAddress) {
    throw new Error('Not supported by Eclipse');
  }

  async buyNft(tokenAddress, price, marketplaceId) {
    throw new Error('Not supported by Eclipse');
  }

  async bidNft(tokenAddress, price) {
    throw new Error('Not supported by Eclipse');
  }

  async cancelBidNft(tokenAddress) {
    throw new Error('Not supported by Eclipse');
  }

  async getTransaction(id) {
    return transactionService.find(this.network, this.publicKey.toBase58(), id);
  }

  async getRecentTransactions(paging) {
    return transactionService.list(
      this.network,
      this.publicKey.toBase58(),
      paging,
    );
  }

  async getDomain() {
    const connection = await this.getConnection();
    try {
      return await nameService.getDomainName(connection, this.publicKey);
    } catch (error) {
      // No domain registered for this account
      return null;
    }
  }

  async getDomainFromPublicKey(publicKey) {
    const connection = await this.getConnection();
    try {
      return await nameService.getDomainName(connection, publicKey);
    } catch (error) {
      // No domain registered for this account
      return null;
    }
  }

  async getPublicKeyFromDomain(domain) {
    const connection = await this.getConnection();
    return nameService.getPublicKey(connection, domain);
  }


  async getAvailableTokens() {
    throw new Error('Not supported by Eclipse');
  }

  async getFeaturedTokens() {
    throw new Error('Not supported by Eclipse');
  }

  async calculateTransferFee(mint, amount) {
    const connection = await this.getConnection();
    return transferService.calculateTransferFee(connection, mint, amount);
  }
}

module.exports = EclipseAccount;
