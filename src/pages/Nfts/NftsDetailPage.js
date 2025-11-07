import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StyleSheet, View, FlatList } from 'react-native';
import { get } from 'lodash';
// LINT FIX - BLOCKCHAINS no usado
import { getSwitches } from '../../adapter';

import { AppContext } from '../../AppProvider';
import { useNavigation, withParams } from '../../routes/hooks';
import { ROUTES_MAP } from './routes';
import { withTranslation } from '../../hooks/useTranslations';
import { getMediaRemoteUrl } from '../../utils/media';

import theme, { globalStyles } from '../../component-library/Global/theme';
import GlobalLayout from '../../component-library/Global/GlobalLayout';
import GlobalBackTitle from '../../component-library/Global/GlobalBackTitle';
import GlobalImage from '../../component-library/Global/GlobalImage';
import GlobalText from '../../component-library/Global/GlobalText';
import GlobalPadding from '../../component-library/Global/GlobalPadding';
import GlobalFloatingBadge from '../../component-library/Global/GlobalFloatingBadge';
import GlobalSendReceive from '../../component-library/Global/GlobalSendReceive';
import CardButton from '../../component-library/CardButton/CardButton';
import Header from '../../component-library/Layout/Header';
import IconInfo from '../../assets/images/IconInfo.png';
import IconSolana from '../../assets/images/IconSolana.png';
import IconHyperspaceWhite from '../../assets/images/IconHyperspaceWhite.png';
import IconHyperspace from '../../assets/images/IconHyperspace.jpeg';

import useAnalyticsEventTracker from '../../hooks/useAnalyticsEventTracker';
import { SECTIONS_MAP } from '../../utils/tracking';

// LINT FIX - No usado
// import { PublicKey } from '@solana/web3.js';

// LINT FIX - No usado
// import {
//   TOKEN_2022_PROGRAM_ID,
//   getExtensionData,
//   ExtensionType,
//   getMint,
// } from '@solana/spl-token';

// LINT FIX - No usado
// import fetch from 'node-fetch';

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
  iconMarginBottom: {
    marginBottom: -2,
  },
});

const NftsDetailPage = ({ route, params, t }) => {
  const location = useLocation();

  useAnalyticsEventTracker(SECTIONS_MAP.NFT_DETAIL);
  const navigate = useNavigation();
  const [loaded, setLoaded] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [listedLoaded, setListedLoaded] = useState(false);
  const [nftDetail, setNftDetail] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [listedInfo, setListedInfo] = useState([]);
  const [{ networkId }] = useContext(AppContext);
  const [switches, setSwitches] = useState(null);

  useEffect(() => {
    const { nft } = location?.state || {};
    if (!nft) {
      navigate(ROUTES_MAP.NFTS_LIST);
      return;
    }
    setNftDetail(nft);
    setLoaded(true);
  }, [location.state, navigate]);

  useEffect(() => {
    getSwitches().then(allSwitches =>
      setSwitches(allSwitches[networkId].sections.collectibles),
    );
  }, [networkId]);

  const transferable = useMemo(
    () =>
      !nftDetail?.extensions
        ?.map(({ extension }) => extension)
        ?.includes('nonTransferableAccount'),
    [nftDetail],
  );

  const getListBtnTitle = () =>
    !listedLoaded ? (
      '...'
    ) : listedInfo ? (
      <>
        {t('nft.delist_nft')}
        {'  '}
        <GlobalImage
          source={IconHyperspaceWhite}
          size="xxs"
          style={styles.iconMarginBottom}
        />
      </>
    ) : (
      <>
        {t('nft.list_nft')}
        {'  '}
        <GlobalImage
          source={IconHyperspaceWhite}
          size="xxs"
          style={styles.iconMarginBottom}
        />
      </>
    );

  const hasProperties = () => {
    return get(nftDetail, 'extras.attributes', []).length > 0;
  };

  const goToBack = () => {
    navigate(ROUTES_MAP.NFTS_LIST);
  };

  const goToSend = () => {
    navigate(ROUTES_MAP.NFTS_SEND, { id: params.id }, { nft: nftDetail });
  };

  const goToBurn = () => {
    navigate(ROUTES_MAP.NFTS_BURN, { id: params.id });
  };

  const goToListing = () => {
    navigate(ROUTES_MAP.NFTS_LISTING, {
      id: params.id,
      type: listedInfo ? 'unlist' : 'list',
    });
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
    (loaded && (
      <GlobalLayout fullscreen>
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
              {listedInfo?.market_place_state?.price && (
                <GlobalFloatingBadge
                  {...{
                    titleTopDetail: (
                      <View style={globalStyles.inlineFlexButtons}>
                        <GlobalText
                          type="caption"
                          color="body2"
                          numberOfLines={1}>
                          {t('nft.listed_nft')}
                        </GlobalText>
                        <GlobalImage
                          circle
                          source={IconHyperspace}
                          size="xxs"
                          style={styles.hyperspaceIcon}
                        />
                      </View>
                    ),
                    titleTopPrice: (
                      <View style={styles.topPrice}>
                        <GlobalText
                          type="caption"
                          color="tertiary"
                          numberOfLines={1}>
                          {listedInfo?.market_place_state?.price}
                        </GlobalText>
                        <GlobalImage
                          source={IconSolana}
                          circle
                          size="xxs"
                          style={styles.topPriceIcon}
                        />
                      </View>
                    ),
                  }}
                />
              )}
            </View>
          </View>

          <GlobalPadding size="lg" />

          <View style={globalStyles.inlineFlexButtons}>
            <GlobalSendReceive
              goToSend={goToSend}
              canSend={switches?.send && transferable}
              goToList={goToListing}
              canList={switches?.list_in_marketplace?.active}
              titleList={getListBtnTitle()}
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
      </GlobalLayout>
    )) ||
    null
  );
};

export default withParams(withTranslation()(NftsDetailPage));
