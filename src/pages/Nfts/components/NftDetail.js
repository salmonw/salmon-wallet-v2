import React, { useMemo, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { get } from 'lodash';

import { useNavigation, withParams } from '../../../routes/hooks';
import { ROUTES_MAP } from '../routes';
import { withTranslation } from '../../../hooks/useTranslations';
import { getMediaRemoteUrl } from '../../../utils/media';

import theme, { globalStyles } from '../../../component-library/Global/theme';
import GlobalLayout from '../../../component-library/Global/GlobalLayout';
import GlobalBackTitle from '../../../component-library/Global/GlobalBackTitle';
import GlobalImage from '../../../component-library/Global/GlobalImage';
import GlobalText from '../../../component-library/Global/GlobalText';
import GlobalPadding from '../../../component-library/Global/GlobalPadding';
import GlobalSendReceive from '../../../component-library/Global/GlobalSendReceive';
import CardButton from '../../../component-library/CardButton/CardButton';
import Header from '../../../component-library/Layout/Header';
import IconInfo from '../../../assets/images/IconInfo.png';
import NftSend from './NftSend';

import useAnalyticsEventTracker from '../../../hooks/useAnalyticsEventTracker';
import { SECTIONS_MAP } from '../../../utils/tracking';

const styles = StyleSheet.create({
  renderItemStyle: {
    width: '49%',
    marginBottom: theme.gutters.paddingXS,
  },
  columnWrapperStyle: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nftImage: {
    width: '80%',
    margin: 'auto',
  },
  imageContainer: {
    flexGrow: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hyperspaceIcon: {
    marginLeft: theme.gutters.paddingXXS,
  },
  topPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 55,
  },
  topPriceIcon: {
    marginLeft: theme.gutters.paddingXXS,
  },
});

const NftsDetailPage = ({ nftDetail, t, switches, onClose }) => {
  const [isSend, setIsSend] = useState();
  useAnalyticsEventTracker(SECTIONS_MAP.NFT_DETAIL);
  const navigate = useNavigation();

  const transferable = useMemo(
    () =>
      !nftDetail?.extensions
        ?.map(({ extension }) => extension)
        ?.includes('nonTransferableAccount'),
    [nftDetail],
  );

  const hasProperties = () => {
    return get(nftDetail, 'extras.attributes', []).length > 0;
  };

  const goToBack = () => {
    onClose();
  };

  const goToSend = () => {
    setIsSend(true);
  };

  const goToBurn = () => {
    navigate(ROUTES_MAP.NFTS_BURN, { id: nftDetail.id });
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.renderItemStyle}>
        <CardButton
          key={item.title}
          caption={item.caption}
          title={item.title}
          description={item.description}
          nospace
          readonly
        />
      </View>
    );
  };
  const image =
    nftDetail.metadata?.json?.image ||
    getMediaRemoteUrl(nftDetail.metadata?.uri);
  //nftDetail.metadata?.json?.name || nftDetail.metadata?.name || nftDetail.symbol
  //nftDetail.metadata?.json?.description
  const title =
    nftDetail.metadata?.json?.name ||
    nftDetail.metadata?.name ||
    nftDetail.symbol;

  return (
    <>
      {isSend && (
        <NftSend onClose={() => setIsSend(false)} nftDetail={nftDetail} />
      )}
      {!isSend && (
        <GlobalLayout.Header>
          <Header />
          <GlobalBackTitle
            onBack={goToBack}
            inlineTitle={
              <GlobalText type="headline2" center>
                {title}
              </GlobalText>
            }
            nospace
          />

          <GlobalPadding size="xxs" />

          <View style={globalStyles.centered}>
            <GlobalPadding size="xs" />

            <View style={styles.imageContainer}>
              <GlobalImage
                source={image}
                style={styles.nftImage}
                square
                squircle
              />
            </View>
          </View>

          <GlobalPadding size="lg" />
          <View style={globalStyles.inlineFlexButtons}>
            <GlobalSendReceive
              goToSend={goToSend}
              canSend={switches?.send && transferable}
              canList={switches?.list_in_marketplace?.active}
              listedLoaded
              goToBurn={goToBurn}
              canBurn={switches?.burn}
            />
          </View>

          <GlobalPadding size="sm" />

          {!transferable && (
            <View style={globalStyles.inlineCentered}>
              <GlobalImage source={IconInfo} size="xxs" circle />
              <GlobalText type="caption" bold>
                {t('token.nonTransferable')}
              </GlobalText>
            </View>
          )}

          <GlobalPadding size="lg" />

          <GlobalText type="body2">{t('nft.description')}</GlobalText>

          <GlobalPadding size="sm" />

          <GlobalText type="body1" color="secondary">
            {nftDetail.metadata?.json?.description}
          </GlobalText>

          <GlobalPadding size="xl" />
          {hasProperties() && (
            <>
              <GlobalText type="body2">{t('nft.properties')}</GlobalText>

              <GlobalPadding size="sm" />

              <FlatList
                data={get(nftDetail, 'extras.attributes', []).map(a => ({
                  caption: a.trait_type,
                  title: a.value,
                  description: '',
                }))}
                renderItem={renderItem}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapperStyle}
              />
            </>
          )}
        </GlobalLayout.Header>
      )}
    </>
  );
};

export default withParams(withTranslation()(NftsDetailPage));
