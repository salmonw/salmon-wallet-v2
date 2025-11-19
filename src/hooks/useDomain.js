import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../AppProvider';

class SmartCache {
  constructor(maxSize = 50, ttl = 10 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.cache = new Map();
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });

    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  has(key) {
    return this.get(key) !== undefined;
  }
}

const domainCache = new SmartCache(50, 10 * 60 * 1000);

const useDomain = () => {
  const [{ activeBlockchainAccount }] = useContext(AppContext);
  const [domain, setDomain] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activeBlockchainAccount) {
      setDomain(null);
      setIsLoading(false);
      return;
    }

    const address = activeBlockchainAccount.getReceiveAddress();

    if (domainCache.has(address)) {
      setDomain(domainCache.get(address));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    activeBlockchainAccount
      .getDomain()
      .then(result => {
        setDomain(result);
        domainCache.set(address, result);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching domain:', err);
        setError(err);
        setDomain(null);
        domainCache.set(address, null);
        setIsLoading(false);
      });
  }, [activeBlockchainAccount]);

  return { domain, isLoading, error };
};

export default useDomain;
