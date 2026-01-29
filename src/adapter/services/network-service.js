'use strict';

const axios = require('./axios-wrapper').default;
const { SALMON_API_URL, SALMON_STATIC_API_URL } = require('../constants/environment');

let promise;

// En modo local, usar el backend dinámico para obtener la API key correcta del .env
const networksUrl = SALMON_API_URL.includes('localhost')
  ? `${SALMON_API_URL}/v1/networks`
  : `${SALMON_STATIC_API_URL}/v1/networks`;

const getNetworks = async () => {
  if (promise) {
    return promise;
  }

  promise = axios.get(networksUrl).then(({ data }) => data);

  try {
    return await promise;
  } catch (error) {
    promise = null;
    throw error;
  }
};

const getNetwork = async id => {
  const networks = await getNetworks();
  return networks?.find(network => network.id === id);
};

module.exports = { getNetwork, getNetworks };
