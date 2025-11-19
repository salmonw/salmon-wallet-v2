import { lazy } from 'react';

// Lazy loading de sub-rutas de Transactions
const TransactionsListPage = lazy(() => import('./TransactionsListPage'));
const TransactionsDetailPage = lazy(() => import('./TransactionsDetailPage'));

export const ROUTES_MAP = {
  TRANSACTIONS_LIST: 'TRANSACTIONS_LIST',
  TRANSACTIONS_DETAIL: 'TRANSACTIONS_DETAIL',
};

const routes = [
  {
    key: ROUTES_MAP.TRANSACTIONS_LIST,
    name: 'transactionsList',
    path: '',
    route: '/wallet/transactions',
    Component: TransactionsListPage,
    default: true,
  },
  {
    key: ROUTES_MAP.TRANSACTIONS_DETAIL,
    name: 'transactionsDetail',
    path: ':id',
    route: '/wallet/transactions/:id',
    Component: TransactionsDetailPage,
    default: false,
  },
];

export default routes;
