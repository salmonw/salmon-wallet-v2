import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { get } from 'lodash';
import { BLOCKCHAINS, getSwitches } from 'salmon-wallet-adapter';

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
import IconSolana from '../../assets/images/IconSolana.png';
import IconHyperspaceWhite from '../../assets/images/IconHyperspaceWhite.png';
import IconHyperspace from '../../assets/images/IconHyperspace.jpeg';

import useAnalyticsEventTracker from '../../hooks/useAnalyticsEventTracker';
import { SECTIONS_MAP } from '../../utils/tracking';

import { PublicKey } from '@solana/web3.js';

import {
  TOKEN_2022_PROGRAM_ID,
  getExtensionData,
  ExtensionType,
  getMint,
} from '@solana/spl-token';

import fetch from 'node-fetch';

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

function decodeTokenMetadata(hexData) {
  const buffer = Buffer.from(hexData, 'hex');
  let offset = 64;

  const nameLength = buffer.readUInt32LE(offset);
  offset += 4;
  const name = buffer.slice(offset, offset + nameLength).toString();
  offset += nameLength;

  const symbolLength = buffer.readUInt32LE(offset);
  offset += 4;
  const symbol = buffer.slice(offset, offset + symbolLength).toString();
  offset += symbolLength;

  const uriLength = buffer.readUInt32LE(offset);
  offset += 4;
  const uri = buffer.slice(offset, offset + uriLength).toString();

  return { name, symbol, uri };
}

const getMetadata = async (mintAddress, connection) => {
  const mintInfo = await getMint(
    connection,
    new PublicKey(mintAddress),
    'confirmed',
    TOKEN_2022_PROGRAM_ID,
  );
  const tokenMetadataRaw = getExtensionData(
    ExtensionType.TokenMetadata,
    mintInfo.tlvData,
  );
  if (tokenMetadataRaw) {
    const metadata = decodeTokenMetadata(
      Buffer.from(tokenMetadataRaw).toString('hex'),
    );
    if (metadata.uri) {
      try {
        metadata.uri = metadata.uri.replace(
          /^ipfs:\/\//,
          'https://ipfs.io/ipfs/',
        );
        const response = await fetch(metadata.uri);
        const jsonMetadata = await response.json();
        metadata.json = jsonMetadata;
      } catch (e) {
        metadata.jsonError = `Error fetching JSON metadata: ${e.message}`;
      }
    }
    return metadata;
  }
  return null;
};

const NftsDetailPage = ({ params, t }) => {
  useAnalyticsEventTracker(SECTIONS_MAP.NFT_DETAIL);
  const navigate = useNavigation();
  const [loaded, setLoaded] = useState(false);
  const [listedLoaded, setListedLoaded] = useState(false);
  const [nftDetail, setNftDetail] = useState({});
  const [listedInfo, setListedInfo] = useState([]);
  const [{ activeBlockchainAccount, networkId }] = useContext(AppContext);
  const [switches, setSwitches] = useState(null);

  useEffect(() => {
    getSwitches().then(allSwitches =>
      setSwitches(allSwitches[networkId].sections.nfts),
    );
  }, [networkId]);

  useEffect(() => {
    if (activeBlockchainAccount) {
      activeBlockchainAccount.getAllNfts().then(async nfts => {
        const nft = nfts.find(n => n.mint === params.id);
        if (nft) {
          nft.metadata = await getMetadata(
            nft.mint,
            await activeBlockchainAccount.getConnection(),
          );
          setNftDetail(nft);
        }
        if (activeBlockchainAccount.network.blockchain === BLOCKCHAINS.SOLANA) {
          const listed = await activeBlockchainAccount.getListedNfts();
          setListedInfo(listed.find(l => l.token_address === params.id));
          setListedLoaded(true);
        }
        setLoaded(true);
      });
    }
  }, [activeBlockchainAccount, params.id]);

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
          style={{ marginBottom: -2 }}
        />
      </>
    ) : (
      <>
        {t('nft.list_nft')}
        {'  '}
        <GlobalImage
          source={IconHyperspaceWhite}
          size="xxs"
          style={{ marginBottom: -2 }}
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
    navigate(ROUTES_MAP.NFTS_SEND, { id: params.id });
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
              canSend={switches?.send}
              goToList={goToListing}
              canList={switches?.list_in_marketplace?.active}
              titleList={getListBtnTitle()}
              listedLoaded
              goToBurn={goToBurn}
              canBurn={switches?.burn}
            />
          </View>

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
