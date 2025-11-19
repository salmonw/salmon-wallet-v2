import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../AppProvider';

// Cache to avoid repeated lookups
const domainCache = new Map();

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

    // Check cache first
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
        // Cache the result (null if no domain)
        domainCache.set(address, result);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching domain:', err);
        setError(err);
        setDomain(null);
        // Cache null to avoid repeated failed lookups
        domainCache.set(address, null);
        setIsLoading(false);
      });
  }, [activeBlockchainAccount]);

  return { domain, isLoading, error };
};

export default useDomain;
