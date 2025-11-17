import React from 'react';
import { StyleSheet, View } from 'react-native';

import BasicCard from '../../../component-library/Card/BasicCard';
import GlobalBackTitle from '../../../component-library/Global/GlobalBackTitle';
import GlobalButton from '../../../component-library/Global/GlobalButton';
import GlobalLayout from '../../../component-library/Global/GlobalLayout';
import GlobalPadding from '../../../component-library/Global/GlobalPadding';
import GlobalText from '../../../component-library/Global/GlobalText';
import theme, { globalStyles } from '../../../component-library/Global/theme';

import { ActiveWalletCard } from './ActiveWalletCard';
import { DAppCard } from './DAppCard';
import { withTranslation } from '../../../hooks/useTranslations';

const styles = StyleSheet.create({
  cardContainer: {
    marginTop: theme.gutters.paddingMD,
  },
  cardContent: {
    padding: theme.gutters.paddingXS,
  },
  fee: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const formatNumber = (digits, decimals) => {
  if (decimals < 0) {
    return `${digits}`.padEnd(-decimals, '0');
  }
  if (decimals > 0) {
    const s = `${digits}`.padStart(decimals + 1, '0');
    const i = s.length - decimals;
    return (s.substring(0, i) + '.' + s.substring(i)).replace(/\.{0,1}0+$/, '');
  }
  return `${digits}`;
};

const BasicTransactionApproval = ({
  t,
  origin,
  name,
  icon,
  fee,
  network,
  onApprove,
  onReject,
}) => (
  <GlobalLayout fullscreen>
    <GlobalLayout.Header>
      <ActiveWalletCard showEnvironment />
      <GlobalBackTitle title={t('adapter.detail.transaction.title')} nospace />
      <GlobalPadding size="xl" />
      <DAppCard name={name} icon={icon} origin={origin} />
    </GlobalLayout.Header>
    <GlobalLayout.Inner>
      <GlobalPadding size="sm" />
      <GlobalText type="caption" uppercase>
        {t('adapter.detail.transaction.detail')}:
      </GlobalText>
      <BasicCard style={styles.cardContainer} contentStyle={styles.cardContent}>
        <View style={styles.fee}>
          <GlobalText type="caption" color="secondary">
            {t('adapter.detail.transaction.fee')}
          </GlobalText>
          <GlobalText type="caption" color="primary">
            {fee != null
              ? `${formatNumber(fee, 9)} ${
                  network?.nativeCurrency?.symbol || ''
                }`
              : '?'}
          </GlobalText>
        </View>
      </BasicCard>
    </GlobalLayout.Inner>
    <GlobalLayout.Footer>
      <View style={globalStyles.inlineFlexButtons}>
        <GlobalButton
          type="secondary"
          flex
          title={t('actions.cancel')}
          onPress={onReject}
          style={[globalStyles.button, globalStyles.buttonLeft]}
          touchableStyles={globalStyles.buttonTouchable}
        />
        <GlobalButton
          type="primary"
          flex
          title={t('actions.confirm')}
          onPress={() => onApprove()}
          style={[globalStyles.button, globalStyles.buttonRight]}
          touchableStyles={globalStyles.buttonTouchable}
        />
      </View>
    </GlobalLayout.Footer>
  </GlobalLayout>
);

export default withTranslation()(BasicTransactionApproval);
