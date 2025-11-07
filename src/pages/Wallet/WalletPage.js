import React, { useState, useContext, useEffect } from 'react';
import { getSwitches } from '../../adapter';

import { AppContext } from '../../AppProvider';
import { useNavigation } from '../../routes/hooks';
import RoutesBuilder from '../../routes/RoutesBuilder';
import routes from './routes';
import { ROUTES_TYPES } from '../../routes/constants';
import SwapPage from './SwapPage';
import NftsSection from '../Nfts';
import ExchangeSection from './ExchangeSection';
import UnavailablePage from './UnavailablePage';

import GlobalTabBarLayout from '../../component-library/Global/GlobalTabBarLayout';

const WalletPage = () => {
  const navigate = useNavigation();
  const [{ networkId }] = useContext(AppContext);
  const [switches, setSwitches] = useState(null);

  useEffect(() => {
    getSwitches().then(allSwitches => {
      setSwitches(allSwitches[networkId].sections);
    });
  }, [networkId]);

  useEffect(() => {
    if (switches) {
      const nftsRoute = routes.find(r => r.name === 'NFT');
      const swapRoute = routes.find(r => r.name === 'Swap');
      const exchangeRoute = routes.find(r => r.name === 'Exchange');

      if (!switches.nfts?.active) {
        nftsRoute.Component = UnavailablePage;
      } else {
        nftsRoute.Component = NftsSection;
      }
      if (!switches.swap?.active) {
        swapRoute.Component = UnavailablePage;
      } else {
        swapRoute.Component = SwapPage;
      }
      if (!switches.exchange?.active) {
        exchangeRoute.Component = UnavailablePage;
      } else {
        exchangeRoute.Component = ExchangeSection;
      }
    }
  }, [switches]);

  return (
    <GlobalTabBarLayout
      tabs={routes
        .filter(r => !!r.icon)
        .map(r => ({
          title: r.name,
          onClick: () => navigate(r.key),
          icon: r.icon,
          route: r.route,
        }))}>
      <RoutesBuilder routes={routes} type={ROUTES_TYPES.TABS} />
    </GlobalTabBarLayout>
  );
};

export default WalletPage;
