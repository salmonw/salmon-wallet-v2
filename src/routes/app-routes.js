import { lazy } from 'react';
import OnboardingSection from '../pages/Onboarding';
// PRIMEROS AJUSTES - No usado (ruta comentada)
// import WelcomePage from '../pages/Welcome/WelcomePage';
import { getRoutesWithParent } from './utils';

// Lazy loading de rutas principales (excepto Onboarding que es la ruta por defecto)
const WalletPage = lazy(() => import('../pages/Wallet/WalletPage'));
const TokenSection = lazy(() => import('../pages/Token'));
const AdapterPage = lazy(() => import('../pages/Adapter/AdapterPage'));

export const ROUTES_MAP = {
  WELCOME: 'WELCOME',
  ONBOARDING: 'ONBOARDING',
  WALLET: 'WALLET',
  TOKEN: 'TOKEN',
  ADAPTER: 'ADAPTER',
};

// PRIMEROS AJUSTES - Roadmap: Eliminar páginas de bienvenida
// Fecha: 2025-10-31
const routes = [
  {
    key: ROUTES_MAP.WALLET,
    name: 'wallet',
    path: 'wallet/*',
    route: '/wallet',
    Component: WalletPage,
  },
  // WELCOME PAGE - Comentada - Se va directamente a ONBOARDING
  // {
  //   key: ROUTES_MAP.WELCOME,
  //   name: 'welcome',
  //   path: 'welcome',
  //   route: '/welcome',
  //   Component: WelcomePage,
  //   default: true,
  // },
  {
    key: ROUTES_MAP.ONBOARDING,
    name: 'onboarding',
    path: 'onboarding/*',
    route: '/onboarding',
    Component: OnboardingSection,
    default: true, // Ahora ONBOARDING es la ruta por defecto
  },
  {
    key: ROUTES_MAP.TOKEN,
    name: 'token',
    path: 'token/*',
    route: '/token',
    Component: TokenSection,
  },
  {
    key: ROUTES_MAP.ADAPTER,
    name: 'adapter',
    path: 'adapter',
    route: '/adapter',
    Component: AdapterPage,
  },
];

// Sub-routes cargadas de forma síncrona (se cargarán con las rutas principales)
// Nota: Estas se cargan eager porque son parte de la configuración inicial de rutas
export const globalRoutes = [
  ...routes,
  ...getRoutesWithParent(
    require('../pages/Onboarding/routes').default,
    ROUTES_MAP.ONBOARDING,
  ),
  ...getRoutesWithParent(
    require('../pages/Token/routes').default,
    ROUTES_MAP.TOKEN,
  ),
  ...require('../pages/Wallet/routes').default,
  ...require('../pages/Transactions/routes').default,
];

export default routes;
