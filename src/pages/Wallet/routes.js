import { lazy } from 'react';
import WalletOverview from './WalletOverviewPage';
// PRIMEROS AJUSTES - No usado (ruta comentada)
// import BridgePage from './BridgePage';
// PRIMEROS AJUSTES - No usado (ruta comentada)
// import ExchangeSection from './ExchangeSection';

// Lazy loading de sub-secciones (se cargan solo cuando el usuario navega a ellas)
const SwapPage = lazy(() => import('./SwapPage'));
const TransactionsPage = lazy(() => import('../Transactions/TransactionsPage'));
const SettingsSection = lazy(() => import('../Settings'));
const NftsSection = lazy(() => import('../Nfts'));

import IconHome from '../../assets/images/IconHome.png';
import IconNFT from '../../assets/images/IconNFT.png';
import IconSwap from '../../assets/images/IconSwap.png';
// IconBalance e IconSettings ya no se usan en el footer (solo 3 tabs)
import { getDefaultRouteKey, getRoutesWithParent } from '../../routes/utils';
import ChangePathIndexPage from './ChangePathIndexPage';

export const ROUTES_MAP = {
  WALLET_OVERVIEW: 'WALLET_OVERVIEW',
  WALLET_INDEX_PATH: 'WALLET_INDEX_PATH',
  WALLET_NFTS: 'WALLET_NFTS',
  WALLET_SWAP: 'WALLET_SWAP',
  WALLET_TRANSACTIONS: 'WALLET_TRANSACTIONS',
  WALLET_SETTINGS: 'WALLET_SETTINGS',
  WALLET_BRIDGE: 'WALLET_BRIDGE',
  WALLET_EXCHANGE: 'WALLET_EXCHANGE',
};

const NFTS_ROUTES = require('../Nfts/routes').default;
const SETTINGS_ROUTES = require('../Settings/routes').default;

const routes = [
  {
    key: ROUTES_MAP.WALLET_OVERVIEW,
    name: 'Home',
    path: '',
    route: '/wallet',
    Component: WalletOverview,
    default: true,
    icon: IconHome,
  },
  {
    key: ROUTES_MAP.WALLET_INDEX_PATH,
    name: 'ChangePathIndex',
    path: 'pathindex',
    route: '/wallet/pathindex',
    Component: ChangePathIndexPage,
    default: false,
  },
  // PRIMEROS AJUSTES - Roadmap: Cambiar NFTs por Collectibles
  // Fecha: 2025-10-31
  {
    key: ROUTES_MAP.WALLET_NFTS,
    defaultScreen: getDefaultRouteKey(NFTS_ROUTES),
    name: 'Collectibles', // Cambiado de 'NFT' a 'Collectibles'
    path: 'nfts/*',
    route: '/wallet/nfts',
    Component: NftsSection,
    default: false,
    icon: IconNFT,
  },
  {
    key: ROUTES_MAP.WALLET_SWAP,
    name: 'Swap',
    path: 'swap',
    route: '/wallet/swap',
    Component: SwapPage,
    default: false,
    icon: IconSwap,
  },
  // EXCHANGE (con Bridge) - Comentado para ocultarlo del footer
  // {
  //   key: ROUTES_MAP.WALLET_EXCHANGE,
  //   name: 'Exchange',
  //   path: 'exchange',
  //   route: '/wallet/exchange',
  //   Component: ExchangeSection,
  //   default: false,
  //   icon: IconSwap, // Al tener icon, aparecía en el footer
  // },
  // Transactions y Settings NO aparecen en el footer (sin icon)
  // Solo se acceden desde otras pantallas
  {
    key: ROUTES_MAP.WALLET_TRANSACTIONS,
    name: 'Transactions',
    path: 'transactions/*',
    route: '/wallet/transactions',
    Component: TransactionsPage,
    default: false,
    // icon removido - no aparece en footer
  },
  {
    key: ROUTES_MAP.WALLET_SETTINGS,
    defaultScreen: getDefaultRouteKey(SETTINGS_ROUTES),
    name: 'Settings',
    path: 'settings/*',
    route: '/wallet/settings',
    Component: SettingsSection,
    default: false,
    // icon removido - no aparece en footer
  },
  // BRIDGE - Comentado
  // {
  //   key: ROUTES_MAP.WALLET_BRIDGE,
  //   name: 'Bridge',
  //   path: 'bridge',
  //   route: '/wallet/bridge',
  //   Component: BridgePage,
  //   default: false,
  // },
  ...getRoutesWithParent(NFTS_ROUTES, ROUTES_MAP.WALLET_NFTS),
  ...getRoutesWithParent(SETTINGS_ROUTES, ROUTES_MAP.WALLET_SETTINGS),
];

export default routes;
