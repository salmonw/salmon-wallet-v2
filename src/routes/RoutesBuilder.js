import React, { useContext, useEffect, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AppContext } from '../AppProvider';
import { getRoute } from './utils';
import { ROUTES_MAP } from './app-routes';
import { useNavigation } from './hooks';
import GlobalSkeleton from '../component-library/Global/GlobalSkeleton';

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
    <Suspense fallback={<GlobalSkeleton type="Generic" />}>
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
    </Suspense>
  ) : null;
};

export default RoutesBuilder;
