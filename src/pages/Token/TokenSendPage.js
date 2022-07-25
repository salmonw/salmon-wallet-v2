import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppContext } from '../../AppProvider';
import { useNavigation, withParams } from '../../routes/hooks';
import { ROUTES_MAP } from '../../routes/app-routes';
import { cache, CACHE_TYPES } from '../../utils/cache';
import { withTranslation } from '../../hooks/useTranslations';

import { LOGOS } from '../../utils/wallet';
import { getMediaRemoteUrl } from '../../utils/media';

import theme from '../../component-library/Global/theme';
import { GlobalLayoutForTabScreen } from '../../component-library/Global/GlobalLayout';
import GlobalBackTitle from '../../component-library/Global/GlobalBackTitle';
import GlobalButton from '../../component-library/Global/GlobalButton';
import GlobalImage from '../../component-library/Global/GlobalImage';
import GlobalInput from '../../component-library/Global/GlobalInput';
import GlobalPadding from '../../component-library/Global/GlobalPadding';
import GlobalText from '../../component-library/Global/GlobalText';

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigImage: {
    backgroundColor: theme.colors.bgLight,
  },
  inlineFlexButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonTouchable: {
    flex: 1,
  },
  button: {
    alignSelf: 'stretch',
  },
  buttonLeft: {
    marginRight: theme.gutters.paddingXS,
  },
  buttonRight: {
    marginLeft: theme.gutters.paddingXS,
  },
});

const TokenSendPage = ({ params, t }) => {
  const navigate = useNavigation();
  const [loaded, setloaded] = useState(false);
  const [token, setToken] = useState({});

  const [{ activeWallet }] = useContext(AppContext);

  const [recipientAddress, setRecipientAddress] = useState('');

  useEffect(() => {
    if (activeWallet) {
      Promise.all([
        cache(
          `${activeWallet.networkId}-${activeWallet.getReceiveAddress()}`,
          CACHE_TYPES.BALANCE,
          () => activeWallet.getBalance(),
        ),
      ]).then(([balance]) => {
        const tokenSelected = (balance.items || []).find(
          i => i.address === params.tokenId,
        );
        setToken(tokenSelected || {});
        setloaded(true);
      });
    }
  }, [activeWallet, params]);

  const goToBack = () => {
    navigate(ROUTES_MAP.WALLET);
  };

  const onSend = () => {
    navigate(ROUTES_MAP.WALLET);
  };

  return (
    loaded && (
      <GlobalLayoutForTabScreen>
        <GlobalBackTitle
          onBack={goToBack}
          inlineTitle={t('token.action.send')}
          inlineAddress={params.tokenId}
        />

        <View style={styles.centered}>
          <GlobalImage
            source={getMediaRemoteUrl(LOGOS['SOLANA'])}
            size="xxl"
            style={styles.bigImage}
            circle
          />

          <GlobalPadding size="md" />

          <GlobalInput
            placeholder="Recipient´s ACR address"
            value={recipientAddress}
            setValue={setRecipientAddress}
          />

          <GlobalPadding size="md" />

          <GlobalInput
            placeholder="USD"
            value={recipientAddress}
            setValue={setRecipientAddress}
          />

          <GlobalPadding />

          <GlobalText type="body2" center>
            -0 USD
          </GlobalText>

          <GlobalPadding size="md" />

          <GlobalText type="body1" center>
            2 lines max Validation text sint occaecat cupidatat non proident
          </GlobalText>
        </View>

        <GlobalPadding size="4xl" />

        <View style={styles.inlineFlexButtons}>
          <GlobalButton
            type="secondary"
            flex
            title="Cancel"
            onPress={goToBack}
            style={[styles.button, styles.buttonLeft]}
            touchableStyles={styles.buttonTouchable}
          />

          <GlobalButton
            type="primary"
            flex
            title="Send"
            onPress={onSend}
            style={[styles.button, styles.buttonRight]}
            touchableStyles={styles.buttonTouchable}
          />
        </View>

        <GlobalPadding size="xl" />
      </GlobalLayoutForTabScreen>
    )
  );
};

export default withParams(withTranslation()(TokenSendPage));
