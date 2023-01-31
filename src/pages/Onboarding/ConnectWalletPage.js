import React, { useContext, useState } from 'react';
import { getTopTokensByPlatform } from '4m-wallet-adapter/services/price-service';

import { AppContext } from '../../AppProvider';
import { useNavigation, withParams } from '../../routes/hooks';
import { withTranslation } from '../../hooks/useTranslations';
import { ROUTES_MAP } from '../../routes/app-routes';
import { ROUTES_MAP as ROUTES_ONBOARDING } from './routes';
import GlobalLayout from '../../component-library/Global/GlobalLayout';
import useAnalyticsEventTracker from '../../hooks/useAnalyticsEventTracker';
import { SECTIONS_MAP, EVENTS_MAP } from '../../utils/tracking';

import Password from './components/Password';
import Success from './components/Success';
import PLATFORMS from '../../config/platforms';

const ConnectWalletPage = ({ params, t }) => {
  const { trackEvent } = useAnalyticsEventTracker(SECTIONS_MAP.RECOVER_WALLET);
  const navigate = useNavigation();
  const [
    { activeWallet, requiredLock, isAdapter },
    { addWallet, checkPassword, importTokens },
  ] = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [waiting, setWaiting] = useState(false);
  const { chainCode } = params;

  const handleOnPasswordComplete = async password => {
    setWaiting(true);
    await addWallet(activeWallet, password, chainCode);
    setWaiting(false);
    trackEvent(EVENTS_MAP.PASSWORD_COMPLETED);
    setStep(2);

    try {
      if (activeWallet.useExplicitTokens()) {
        const tokens = await getTopTokensByPlatform(PLATFORMS[chainCode]);
        await importTokens(activeWallet.getReceiveAddress(), tokens);
      }
    } catch (e) {
      console.error('Could not import tokens', e);
    }
  };
  const goToWallet = () => {
    trackEvent(EVENTS_MAP.RECOVER_COMPLETED);
    navigate(ROUTES_MAP.WALLET);
  };
  const goToAdapter = () => {
    trackEvent(EVENTS_MAP.RECOVER_COMPLETED);
    navigate(ROUTES_MAP.ADAPTER);
  };
  const goToDerived = () => navigate(ROUTES_ONBOARDING.ONBOARDING_DERIVED);
  const goBack = () => navigate(ROUTES_MAP.ONBOARDING);

  return (
    <GlobalLayout fullscreen>
      {step === 1 && (
        <Password
          type="connect"
          onComplete={handleOnPasswordComplete}
          onBack={goBack}
          requiredLock={requiredLock}
          checkPassword={checkPassword}
          waiting={waiting}
          t={t}
        />
      )}
      {step === 2 && (
        <Success
          goToWallet={!isAdapter ? goToWallet : undefined}
          goToAdapter={isAdapter ? goToAdapter : undefined}
          goToDerived={goToDerived}
          onBack={() => setStep(1)}
          t={t}
        />
      )}
    </GlobalLayout>
  );
};

export default withParams(withTranslation()(ConnectWalletPage));
