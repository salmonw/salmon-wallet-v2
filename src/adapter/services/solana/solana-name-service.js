const { TldParser } = require('@onsol/tldparser');

const getDomainName = async (connection, publicKey) => {
  const parser = new TldParser(connection);
  const mainDomain = await parser.getMainDomain(publicKey);
  return mainDomain.domain + mainDomain.tld;
};

const getPublicKey = async (connection, domain) => {
  const parser = new TldParser(connection);
  const owner = await parser.getOwnerFromDomainTld(domain);
  if (!owner) {
    throw Error('Owner not found for this domain.');
  }
  return owner.toString();
};

module.exports = {
  getDomainName,
  getPublicKey,
};
