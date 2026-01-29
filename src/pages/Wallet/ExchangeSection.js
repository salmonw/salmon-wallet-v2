import React, { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppContext } from '../../AppProvider';
import { useNavigation } from '../../routes/hooks';
import { withTranslation } from '../../hooks/useTranslations';
// PRIMEROS AJUSTES - No usado (función comentada)
// import { ROUTES_MAP as APP_ROUTES_MAP } from '../../routes/app-routes';
import { ROUTES_MAP } from './routes';
import theme from '../../component-library/Global/theme';
import GlobalLayout from '../../component-library/Global/GlobalLayout';
import GlobalBackTitle from '../../component-library/Global/GlobalBackTitle';
import GlobalButton from '../../component-library/Global/GlobalButton';
import AvatarImage from '../../component-library/Image/AvatarImage';
import CardButton from '../../component-library/CardButton/CardButton';
import GlobalPadding from '../../component-library/Global/GlobalPadding';
import GlobalText from '../../component-library/Global/GlobalText';
// Header ahora viene de LockSheet - no se usa aqui
// import Header from '../../component-library/Layout/Header';

// Altura del Header de LockSheet para compensar el espacio
const LOCKSHEET_HEADER_HEIGHT = 63;
// PRIMEROS AJUSTES - No usado
// import IconBridge from '../../assets/images/IconBridge.png';

const styles = StyleSheet.create({
  cardBtn: {
    backgroundColor: theme.colors.bgLight,
  },
});

const ExchangeSection = ({ t }) => {
  const navigate = useNavigation();
  const [{ activeBlockchainAccount }] = useContext(AppContext);
  const [optSelected, setOptSelected] = useState(0);

  // PRIMEROS AJUSTES - No usado
  // const goToBack = () => {
  //   navigate(APP_ROUTES_MAP.WALLET);
  // };

  // PRIMEROS AJUSTES - Roadmap: Ocultar Bridge
  // Fecha: 2025-10-31
  const goToSwapRoute = type =>
    type === 0
      ? navigate(ROUTES_MAP.WALLET_SWAP)
      : navigate(ROUTES_MAP.WALLET_BRIDGE); // Bridge comentado en routes
  return (
    <GlobalLayout>
      <GlobalLayout.Header>
        <View style={{ height: LOCKSHEET_HEADER_HEIGHT }} />
        <GlobalBackTitle title={t('swap.swap_tokens')} />
        <GlobalPadding />
        <GlobalText type="body2" color="secondary" center>
          {t('swap.choose_type')}
        </GlobalText>
        <GlobalPadding size="xl" />
        <CardButton
          buttonStyle={styles.cardBtn}
          onPress={() => setOptSelected(0)}
          title={t('swap.same_blockchain')}
          active={optSelected === 0}
          actions={[
            <AvatarImage
              key="network-icon"
              url={activeBlockchainAccount.network.icon}
              size={30}
            />,
          ]}
        />
        <GlobalPadding size="xxs" />
        {/* BRIDGE OPTION - Comentado temporalmente */}
        {/* <CardButton
          buttonStyle={styles.cardBtn}
          onPress={() => setOptSelected(1)}
          title={t('swap.other_blockchain')}
          active={optSelected === 1}
          actions={[
            <AvatarImage key="bridge-icon" url={IconBridge} size={30} />,
          ]}
        /> */}
      </GlobalLayout.Header>

      <GlobalLayout.Footer>
        <GlobalButton
          type="primary"
          wideSmall
          title={t('actions.next')}
          onPress={() => goToSwapRoute(optSelected)}
        />
      </GlobalLayout.Footer>
    </GlobalLayout>
  );
};

export default withTranslation()(ExchangeSection);
