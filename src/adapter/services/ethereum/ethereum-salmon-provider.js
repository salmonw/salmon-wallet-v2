'use strict';

const { JsonRpcProvider, Network } = require('ethers');
const { SALMON_API_URL } = require('../../constants/environment');

class EthereumSalmonProvider extends JsonRpcProvider {
  constructor(network) {
    const url = `${SALMON_API_URL}/v1/${network.id}/rpc`;
    const staticNetwork = Network.from(network.chainId);
    super(url, staticNetwork, { staticNetwork });
  }
}

module.exports = EthereumSalmonProvider;
