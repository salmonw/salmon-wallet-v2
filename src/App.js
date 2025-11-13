import React from 'react';

import AppProvider from './AppProvider';
import AppRoutes from './AppRoutes';
// LINT FIX - No usado
// import { isExtension } from './utils/platform';

const App = () => {
  // Disallow rendering inside an iframe to prevent clickjacking.
  if (window.self !== window.top) {
    return null;
  }

  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
};

export default App;
