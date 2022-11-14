import React, { useContext, useState } from 'react';
import { View } from 'react-native';

import { AppContext } from '../../AppProvider';
import { ROUTES_MAP as ROUTES_SETTINGS_MAP } from './routes';
import { useNavigation } from '../../routes/hooks';
import { withTranslation } from '../../hooks/useTranslations';

import GlobalLayout from '../../component-library/Global/GlobalLayout';
import GlobalBackTitle from '../../component-library/Global/GlobalBackTitle';
import GlobalButton from '../../component-library/Global/GlobalButton';
import GlobalPadding from '../../component-library/Global/GlobalPadding';
import { globalStyles } from '../../component-library/Global/theme';

const SecurityPage = ({ t }) => {
  const navigate = useNavigation();
  const [updating, setUpdating] = useState(false);
  const [{ biometricOptions, biometricEnabled }, { addBiometric }] =
    useContext(AppContext);
  const onBack = () => navigate(ROUTES_SETTINGS_MAP.SETTINGS_OPTIONS);
  const enableBiometric = async () => {
    try {
      setUpdating(true);
      await addBiometric();
      setUpdating(false);
    } catch (error) {
      console.error(error);
      setUpdating(false);
    }
  };
  return (
    <GlobalLayout>
      <GlobalLayout.Header>
        <GlobalBackTitle onBack={onBack} title={t(`settings.security`)} />
        {biometricOptions.isAvailable && (
          <View style={globalStyles.centered}>
            <GlobalButton
              onPress={enableBiometric}
              disabled={updating || biometricEnabled}
              title={biometricOptions.type}
            />
          </View>
        )}
        <GlobalPadding size="md" />
      </GlobalLayout.Header>
    </GlobalLayout>
  );
};

export default withTranslation()(SecurityPage);
