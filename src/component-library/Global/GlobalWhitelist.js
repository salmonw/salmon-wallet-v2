import React, { useContext } from 'react';
import { withTranslation } from '../../hooks/useTranslations';
import CardButton from '../CardButton/CardButton';
import { View } from 'react-native';
import GlobalImage from './GlobalImage';
import { AppContext } from '../../AppProvider';
import IconSuccessGreen from '../../assets/images/IconSuccessGreen.png';
import useWhitelist from '../../hooks/useWhitelist';

const ALPHA = 'alpha';
const LAUNCHPAD_CODE = 'SOL-HYPE';

const GlobalWhitelist = ({ t }) => {
  const registeredPhase = null;
  const { launchpadPhases } = useWhitelist(LAUNCHPAD_CODE);
  console.log(launchpadPhases);
  return (
    <View>
      {launchpadPhases &&
        launchpadPhases.map(phase => (
          <WhitelistPhase
            t={t}
            registered={registeredPhase === ALPHA}
            phase={phase.code}
            status={phase.status}
          />
        ))}
    </View>
  );
};

const WhitelistPhase = ({ phase, registered, status, t }) => {
  const [{ activeWallet }] = useContext(AppContext);
  const register = () => {
    if (!registered && status === 'CURRENT') {
      console.log(activeWallet.publicKey);
    }
  };
  const getSubtitle = () => {
    if (registered) return t(`whitelist.registered`);
    if (status === 'COMPLETED') return t(`whitelist.closed`);
    if (status === 'NOT_OPENED')
      return t(`whitelist.not_opened_${phase.toLowerCase()}`);
    return t(`whitelist.click_to_register`);
  };

  return (
    <CardButton
      title={t(`whitelist.whitelist_${phase.toLowerCase()}`)}
      actionIcon={registered ? 'success' : null}
      onPress={register}
      subtitle={getSubtitle()}>
      {registered ? <GlobalImage source={IconSuccessGreen} size="xs" /> : <></>}
    </CardButton>
  );
};

export default withTranslation()(GlobalWhitelist);
