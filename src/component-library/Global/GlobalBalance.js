import React, { useState } from 'react';
import { Platform, StyleSheet, View, TouchableOpacity } from 'react-native';

import { withTranslation } from '../../hooks/useTranslations';
import theme from './theme';
import GlobalAlert from './GlobalAlert';
import GlobalButton from './GlobalButton';
import GlobalImage from './GlobalImage';
import GlobalSkeleton from './GlobalSkeleton';
import GlobalText from './GlobalText';
import SimpleDialog from '../Dialog/SimpleDialog';

import IconVisibilityHidden from '../../assets/images/IconVisibilityHidden.png';
import IconVisibilityShow from '../../assets/images/IconVisibilityShow.png';
import IconBalanceUp from '../../assets/images/IconBalancetUp.png';
import IconBalanceDown from '../../assets/images/IconBalanceDown.png';
import IconReset from '../../assets/images/IconReset.png';

const styles = StyleSheet.create({
  balanceContainer: {
    backgroundColor: 'rgba(16, 19, 28, 0.8)',
    borderRadius: 34.557,
    borderWidth: 1.382,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 114, // Espacio para que el contenido no quede detras del header
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 10px 10px rgba(0, 0, 0, 0.9)' }
      : {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.9,
          shadowRadius: 10,
        }),
    width: '100%', // De punta a punta
  },
  numbers: {
    height: 110,
  },
  bigTotal: {
    marginRight: -52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inline: {
    marginTop: theme.gutters.paddingXXS,
    marginBottom: theme.gutters.paddingXL,
    marginLeft: theme.gutters.paddingSM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUpDown: {
    marginLeft: theme.gutters.paddingXXS,
    width: 18,
    height: 18,
  },
  upDownTotals: {
    marginTop: 2,
    marginRight: theme.gutters.paddingXXS,
    lineHeight: theme.fontSize.fontSizeNormal,
  },
  percentageBadge: {
    backgroundColor: 'rgba(128, 255, 84, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentageBadgeNegative: {
    backgroundColor: 'rgba(255, 84, 84, 0.2)',
  },
  infoLink: {
    marginLeft: theme.gutters.paddingXXS,
    fontFamily: theme.fonts.dmSansRegular,
    fontSize: theme.fontSize.fontSizeXS,
    lineHeight: theme.fontSize.fontSizeNormal,
    color: theme.colors.labelSecondary,
    fontWeight: 'normal',
    textTransform: 'none',
    marginTop: 2,
  },
});

const WalletBalanceCard = ({
  loading,
  total,
  totalType = 'headline1',
  neutralTotal,
  negativeTotal,
  positiveTotal,
  alert,
  actions,
  showBalance,
  onToggleShow,
  onRefresh,
  t,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const toggleDialog = () => {
    setShowDialog(!showDialog);
  };
  return (
    <View style={styles.balanceContainer}>
      <View style={styles.numbers}>
        {loading && <GlobalSkeleton type="Balance" />}
        {!loading && !alert && (
          <>
            <View style={styles.bigTotal}>
              <GlobalText type={totalType} center nospace>
                {total}

                <GlobalButton
                  type="icon"
                  transparent
                  icon={showBalance ? IconVisibilityShow : IconVisibilityHidden}
                  onPress={onToggleShow}
                />
                {onRefresh && (
                  <GlobalButton
                    type="icon"
                    transparent
                    icon={IconReset}
                    onPress={onRefresh}
                  />
                )}
              </GlobalText>
            </View>

            <View style={styles.inline}>
              {neutralTotal && (
                <GlobalText type="body2" style={styles.upDownTotals}>
                  {neutralTotal}
                </GlobalText>
              )}

              {negativeTotal && (
                <View style={[styles.percentageBadge, styles.percentageBadgeNegative]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <GlobalImage
                      source={IconBalanceDown}
                      style={styles.iconUpDown}
                    />
                    <GlobalText
                      type="body2"
                      color="negative"
                      style={styles.upDownTotals}>
                      {negativeTotal}
                    </GlobalText>
                  </View>
                </View>
              )}

              {positiveTotal && (
                <View style={styles.percentageBadge}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <GlobalImage
                      source={IconBalanceUp}
                      style={styles.iconUpDown}
                    />
                    <GlobalText
                      type="body2"
                      color="positive"
                      style={styles.upDownTotals}>
                      {positiveTotal}
                    </GlobalText>
                  </View>
                </View>
              )}
              {(neutralTotal || negativeTotal || positiveTotal) && (
                <TouchableOpacity onPress={toggleDialog}>
                  <GlobalText type="body2" style={styles.infoLink}>
                    {t(`wallet.create.info_icon`)}
                  </GlobalText>
                </TouchableOpacity>
              )}
            </View>
            <SimpleDialog
              onClose={toggleDialog}
              isOpen={showDialog}
              text={
                <GlobalText center type="body1">
                  {t(`token.balance.percentage_info`)}
                </GlobalText>
              }
            />
          </>
        )}
        {!loading && alert && (
          <GlobalAlert type={alert.type} text={alert.text} layout="horizontal">
            {alert.onPress && (
              <GlobalButton
                type="icon"
                icon={IconReset}
                onPress={alert.onPress}
                transparent
              />
            )}
          </GlobalAlert>
        )}
      </View>
      {actions}
    </View>
  );
};

export default withTranslation()(WalletBalanceCard);
