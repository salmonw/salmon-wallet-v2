import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';

import { withTranslation } from '../../hooks/useTranslations';
import theme, { globalStyles } from './theme';
import GlobalImage from './GlobalImage';
import GlobalText from './GlobalText';
import GlobalFloatingBadge from './GlobalFloatingBadge';

import { getMediaRemoteUrl } from '../../utils/media';
import { isCollection, isBlacklisted } from '../../utils/nfts';
import Blacklisted from '../../assets/images/Blacklisted.jpeg';
import IconSolana from '../../assets/images/IconSolana.png';
import IconHyperspace from '../../assets/images/IconHyperspace.jpeg';

import { PublicKey } from '@solana/web3.js';

import {
  TOKEN_2022_PROGRAM_ID,
  getExtensionData,
  ExtensionType,
  getMint,
} from '@solana/spl-token';

import fetch from 'node-fetch';
import { AppContext } from '../../AppProvider';

const styles = StyleSheet.create({
  image: {
    aspectRatio: 1,
    backgroundColor: theme.colors.bgLight,
    borderRadius: theme.borderRadius.borderRadiusXL,
    overflow: 'hidden',
    zIndex: 1,
  },
  touchable: {
    width: '100%',
    flexGrow: 1,
  },
  nameContainer: {
    backgroundColor: theme.colors.bgDarken,
    borderRadius: theme.borderRadius.borderRadiusXL,
    marginBottom: theme.gutters.paddingXXS,
    marginTop: -36,
    height: 70,
    zIndex: -1,
  },
  nftName: {
    paddingTop: theme.gutters.padding2XL + 6,
    paddingRight: 15,
    paddingLeft: 15,
  },
  badgeIcon: {
    marginLeft: theme.gutters.paddingXXS,
    marginBottom: -3,
  },
  solanaIcon: {
    marginBottom: -3,
    marginLeft: 6,
    paddingHorizontal: theme.gutters.paddingXS,
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

const GlobalNft = ({ nft, onClick = () => {}, t }) => {
  const [completeNft, setCompleteNft] = useState(nft);
  const [{ activeBlockchainAccount }] = useContext(AppContext);

  useEffect(() => {
    const load = async () => {
      if (!nft.metadata) {
        try {
          const metadata = await getMetadata(
            nft.mint,
            await activeBlockchainAccount.getConnection(),
          );
          setCompleteNft({ ...nft, metadata });
        } catch (error) {
          console.error('Error updating NFTs after display:', error);
        }
      }
    };
    load();
  }, [nft, activeBlockchainAccount]);
  return (
    <>
      <TouchableOpacity
        onPress={() => onClick(completeNft)}
        style={styles.touchable}>
        <View key={completeNft.url} style={styles.image}>
          <GlobalFloatingBadge
            {...{
              titleTop: completeNft.marketInfo?.price && (
                <View style={globalStyles.inlineFlexButtons}>
                  <GlobalText type="caption" color="body2" numberOfLines={1}>
                    {t('completeNft.listed_nft')}
                  </GlobalText>
                  <GlobalImage
                    circle
                    source={IconHyperspace}
                    size="xxs"
                    style={styles.badgeIcon}
                  />
                </View>
              ),
            }}
          />
          <GlobalImage
            source={
              isBlacklisted(completeNft)
                ? Blacklisted
                : completeNft.metadata?.json?.image ||
                  getMediaRemoteUrl(completeNft.metadata?.uri)
            }
            size="block"
            style={completeNft.pending && { filter: 'blur(3px)' }}
          />
          <GlobalFloatingBadge
            {...(isCollection(completeNft) && completeNft.length > 1
              ? { number: completeNft.length }
              : {
                  title:
                    completeNft.lowest_listing_mpa?.price ||
                    completeNft.marketInfo?.price ? (
                      <>
                        <Text>
                          {completeNft.lowest_listing_mpa?.price?.toFixed(2) ||
                            completeNft.marketInfo?.price}
                        </Text>
                        <GlobalImage
                          source={IconSolana}
                          circle
                          size="xxs"
                          style={styles.badgeIcon}
                        />
                      </>
                    ) : (
                      completeNft.metadata?.json?.description && (
                        <GlobalText
                          type="caption"
                          color="tertiary"
                          numberOfLines={1}>
                          {completeNft.metadata?.json?.description}
                        </GlobalText>
                      )
                    ),
                })}
          />
        </View>
      </TouchableOpacity>
      <View style={styles.nameContainer}>
        <GlobalText
          style={styles.nftName}
          center
          type="caption"
          numberOfLines={1}>
          {isCollection(completeNft)
            ? completeNft.collection
            : completeNft.metadata?.json?.name ||
              completeNft.metadata?.name ||
              completeNft.symbol}
        </GlobalText>
      </View>
    </>
  );
};
export default withTranslation()(GlobalNft);
