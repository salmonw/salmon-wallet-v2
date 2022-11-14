import { useState, useEffect } from 'react';
import axios from 'axios';

const SALMON_API_URL = 'http://localhost:3000/local';
const PHASES_PATH = '/v1/launchpad/phases';

const useWhitelist = launchpad => {
  const [launchpadPhases, setLaunchpadPhases] = useState(null);
  useEffect(() => {
    axios
      .get(`${SALMON_API_URL}${PHASES_PATH}?launchpad_code=${launchpad}`)
      .then(result => setLaunchpadPhases(result.data));
  }, [launchpad]);

  return { launchpadPhases };
};

export default useWhitelist;
