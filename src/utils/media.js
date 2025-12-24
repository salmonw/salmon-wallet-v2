// Normalize HTTP to HTTPS for legacy avatar URLs stored in localStorage
const normalizeUrl = url => {
  if (!url) return url;
  if (url.startsWith('http://static.salmonwallet.io')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

export const getMediaRemoteUrl = (url, size = {}, alt = '') => normalizeUrl(url);
