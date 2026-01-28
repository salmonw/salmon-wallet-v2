'use strict';

/**
 * List of known dead/problematic domains that should be skipped entirely
 */
const DEAD_DOMAINS = [
  'shdw-drive.genesysgo.net',
  'chexbacca.com',
  'cdn.bridgesplit.com',
];

/**
 * Normalizes IPFS, Arweave, and other decentralized storage URLs to reliable HTTP gateways.
 * Combines functionality from fixIPFSUrl (token service) and normalizeIpfsUrl (NFT service).
 *
 * @param {string} url - The URL to normalize
 * @returns {string|null} - Normalized HTTP URL, original URL if no transformation needed, or null for dead domains
 */
const normalizeIpfsUrl = (url) => {
  if (!url) return null;

  // Check for known dead domains - return null to skip these entirely
  for (const domain of DEAD_DOMAINS) {
    if (url.includes(domain)) {
      return null;
    }
  }

  // Handle ipfs:// protocol
  if (url.startsWith('ipfs://')) {
    return url.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/');
  }

  // Handle ar:// protocol (Arweave)
  if (url.startsWith('ar://')) {
    return url.replace(/^ar:\/\//, 'https://arweave.net/');
  }

  // Fix common typo: arweeve.net -> arweave.net
  if (url.includes('arweeve.net')) {
    return url.replace('arweeve.net', 'arweave.net');
  }

  // Handle private Pinata gateways (*.mypinata.cloud)
  const pinataPrivatePattern = /https?:\/\/[^/]+\.mypinata\.cloud\/ipfs\/(.+)/;
  const pinataMatch = url.match(pinataPrivatePattern);
  if (pinataMatch) {
    const hash = cleanIpfsHash(pinataMatch[1]);
    return `https://ipfs.io/ipfs/${hash}`;
  }

  // Handle broken/unreliable IPFS gateways - redirect to ipfs.io
  const brokenGateways = [
    /https?:\/\/(?:www\.)?cf-ipfs\.com\/ipfs\/(.+)/,
    /https?:\/\/(?:www\.)?cloudflare-ipfs\.com\/ipfs\/(.+)/,
    /https?:\/\/(?:www\.)?ipfs\.infura\.io\/ipfs\/(.+)/,
    /https?:\/\/gateway\.pinata\.cloud\/ipfs\/(.+)/,
    /https?:\/\/(?:www\.)?nftstorage\.link\/ipfs\/(.+)/,
  ];

  for (const pattern of brokenGateways) {
    const match = url.match(pattern);
    if (match) {
      const hash = cleanIpfsHash(match[1]);
      return `https://ipfs.io/ipfs/${hash}`;
    }
  }

  // Handle subdomain-style IPFS URLs (e.g., QmXXX.ipfs.nftstorage.link, QmXXX.ipfs.dweb.link, QmXXX.ipfs.cf-ipfs.com)
  const subdomainPattern = /https?:\/\/([a-zA-Z0-9]+)\.ipfs\.([^/]+)\/?(.*)$/;
  const subdomainMatch = url.match(subdomainPattern);
  if (subdomainMatch) {
    const hash = subdomainMatch[1];
    const path = subdomainMatch[3] ? `/${subdomainMatch[3]}` : '';
    const cleanPath = path.split('?')[0].split('#')[0]; // Remove query params and fragments
    return `https://ipfs.io/ipfs/${hash}${cleanPath}`;
  }

  return url;
};

/**
 * Cleans an IPFS hash by removing query parameters and URL fragments
 * @param {string} hash - The IPFS hash to clean
 * @returns {string} - Cleaned hash
 */
const cleanIpfsHash = (hash) => {
  if (!hash) return hash;
  return hash.split('?')[0].split('#')[0];
};

module.exports = {
  normalizeIpfsUrl,
  DEAD_DOMAINS,
};
