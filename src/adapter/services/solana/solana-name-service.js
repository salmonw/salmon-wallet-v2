const {
  resolve,
  getFavoriteDomain,
} = require('@bonfida/spl-name-service');

const getDomainName = async (connection, publicKey) => {
  const favorite = await getFavoriteDomain(connection, publicKey);
  if (!favorite?.domain) {
    throw Error('No favorite domain found for this public key.');
  }
  return favorite.domain + '.sol';
};

const getPublicKey = async (connection, domain) => {
  const domainName = domain.endsWith('.sol')
    ? domain.slice(0, -4)
    : domain;
  const owner = await resolve(connection, domainName);
  if (!owner) {
    throw Error('Owner not found for this domain.');
  }
  return owner.toBase58();
};

module.exports = {
  getDomainName,
  getPublicKey,
};
