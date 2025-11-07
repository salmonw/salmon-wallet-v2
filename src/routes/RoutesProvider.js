import React from 'react';
import { MemoryRouter, BrowserRouter } from 'react-router-dom';
import { isExtension } from '../utils/platform';

const RoutesProvider = ({ children }) =>
  isExtension() ? (
    <MemoryRouter>{children}</MemoryRouter>
  ) : (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}>
      {children}
    </BrowserRouter>
  );

export default RoutesProvider;
