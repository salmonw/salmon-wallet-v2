import React, { useContext, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AppContext } from '../AppProvider';
import { getRoute } from './utils';
import { ROUTES_MAP } from './app-routes';
import { useNavigation } from './hooks';

const RoutesBuilder = ({
  routes,
  configs,
  entry,
  requireOnboarding = true,
  ..._
}) => {
  const navigate = useNavigation();
  const [{ accounts }] = useContext(AppContext);
  useEffect(() => {
    if (requireOnboarding && !accounts.length) {
      navigate(ROUTES_MAP.ONBOARDING);
    }
  }, [requireOnboarding, navigate, accounts]);

  const entryRoute = entry ? getRoute(routes, entry) : null;

  return !requireOnboarding || (requireOnboarding && accounts.length > 0) ? (
    <Routes>
      {entryRoute && (
        <Route path="/" element={<Navigate to={entryRoute.route} replace />} />
      )}
      {routes.map(({ key, name, path, Component }) => (
        <Route
          key={`route-${key}`}
          path={path}
          element={<Component cfgs={configs} />}
        />
      ))}
    </Routes>
  ) : null;
};

export default RoutesBuilder;
