import React from 'react';
import { View } from 'react-native';
import { withTranslation } from '../../hooks/useTranslations';
import GlobalLayout from '../../component-library/Global/GlobalLayout';
import GlobalBackTitle from '../../component-library/Global/GlobalBackTitle';
import GlobalPadding from '../../component-library/Global/GlobalPadding';
import GlobalText from '../../component-library/Global/GlobalText';
// Header ahora viene de LockSheet - no se usa aqui
// import Header from '../../component-library/Layout/Header';

// Altura del Header de LockSheet para compensar el espacio
const LOCKSHEET_HEADER_HEIGHT = 63;

const UnavailablePage = ({ t }) => {
  return (
    <GlobalLayout>
      <GlobalLayout.Header>
        <View style={{ height: LOCKSHEET_HEADER_HEIGHT }} />
        <GlobalBackTitle title={t('wallet.not_available_title')} />

        <GlobalPadding />
        <GlobalText type={'body1'} center>
          {t('wallet.not_available_msg')}
        </GlobalText>
      </GlobalLayout.Header>
    </GlobalLayout>
  );
};

export default withTranslation()(UnavailablePage);
