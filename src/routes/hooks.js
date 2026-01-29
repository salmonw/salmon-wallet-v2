import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { globalRoutes } from './app-routes';
import { getRoute } from './utils';

const buildRouteWithParams = (route, params) =>
  Object.keys(params).reduce(
    (path, param) => path.replace(`:${param}`, params[param]),
    route,
  );

export const useNavigation = () => {
  const navigate = useNavigate();
  return (to, params = {}, state = null) => {
    const toRoute = getRoute(globalRoutes, to);
    if (toRoute) {
      navigate(buildRouteWithParams(toRoute.route, params), { state });
    } else {
      console.warn(`route not found ${to}`);
    }
  };
};

export const withParams = Component => props => {
  const params = useParams();
  return <Component {...props} params={params} />;
};

export const useCurrentTab = ({ tabs }) => {
  const [tab, setTab] = useState({});
  const location = useLocation();
  useEffect(() => {
    const selected = tabs.find(
      t =>
        (location.pathname.startsWith(t.route) && t.title !== 'Home') ||
        ((location.pathname === t.route || location.pathname === '/') &&
          t.title === 'Home'),
    );
    if (selected) {
      setTab(selected);
    }
  }, [location, tabs]);
  return tab;
};
