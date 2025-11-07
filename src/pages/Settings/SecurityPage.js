// LINT FIX - No usado
// import React, { useContext, useState } from 'react';
import React from 'react';

// LINT FIX - No usado
// import { AppContext } from '../../AppProvider';
import { ROUTES_MAP as ROUTES_SETTINGS_MAP } from './routes';
import { useNavigation } from '../../routes/hooks';
import { withTranslation } from '../../hooks/useTranslations';

import GlobalLayout from '../../component-library/Global/GlobalLayout';
import GlobalBackTitle from '../../component-library/Global/GlobalBackTitle';
// LINT FIX - No usado
// import GlobalButton from '../../component-library/Global/GlobalButton';
// LINT FIX - No usado
// import GlobalInput from '../../component-library/Global/GlobalInput';
import GlobalPadding from '../../component-library/Global/GlobalPadding';

const SecurityPage = ({ t }) => {
  const navigate = useNavigation();

  const onBack = () => navigate(ROUTES_SETTINGS_MAP.SETTINGS_OPTIONS);

  return (
    <GlobalLayout>
      <GlobalLayout.Header>
        <GlobalBackTitle onBack={onBack} title={t(`settings.security`)} />

        <GlobalPadding size="md" />
      </GlobalLayout.Header>
    </GlobalLayout>
  );
};

export default withTranslation()(SecurityPage);
