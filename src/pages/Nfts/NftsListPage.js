import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { getSwitches } from 'salmon-wallet-adapter';

import { AppContext } from '../../AppProvider';
import { useNavigation } from '../../routes/hooks';
import { withTranslation } from '../../hooks/useTranslations';
import { updatePendingNfts } from '../../utils/nfts';

import theme from '../../component-library/Global/theme';
import GlobalSkeleton from '../../component-library/Global/GlobalSkeleton';
import GlobalLayout from '../../component-library/Global/GlobalLayout';
import GlobalNftList from '../../component-library/Global/GlobalNftList';
import GlobalText from '../../component-library/Global/GlobalText';
import Header from '../../component-library/Layout/Header';
import NftDetail from './components/NftDetail';

import useAnalyticsEventTracker from '../../hooks/useAnalyticsEventTracker';
import { SECTIONS_MAP } from '../../utils/tracking';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.black300,
  },
});

const NftsListPage = ({ t }) => {
  useAnalyticsEventTracker(SECTIONS_MAP.NFT_LIST);
  const navigate = useNavigation();
  const [{ activeBlockchainAccount, networkId }] = useContext(AppContext);
  const [loaded, setLoaded] = useState(false);
  const [listedInfo, setListedInfo] = useState([]);
  const [nftsGroup, setNftsGroup] = useState([]);
  const [switches, setSwitches] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);

  useEffect(() => {
    getSwitches().then(allSwitches =>
      setSwitches(allSwitches[networkId].sections.nfts),
    );
  }, [networkId]);
  useEffect(() => {
    const load = async () => {
      if (activeBlockchainAccount) {
        try {
          setLoaded(false);
          const nfts = await activeBlockchainAccount.getAllNftsGrouped();
          setNftsGroup(await updatePendingNfts(nfts));
          if (switches?.list_in_marketplace?.active) {
            //const listed = await activeBlockchainAccount.getListedNfts();
            const listed = [];
            setListedInfo(listed);
          }
        } finally {
          setLoaded(true);
        }
      }
    };

    load();
  }, [activeBlockchainAccount, switches]);

  const onClick = nft => {
    if (!nft.pending) {
      setSelectedNft(nft);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <GlobalLayout style={isModalOpen && styles.container}>
        {selectedNft && (
          <NftDetail
            nftDetail={selectedNft}
            switches={switches}
            onClose={() => setSelectedNft(null)}
          />
        )}
        {loaded && !selectedNft && (
          <GlobalLayout.Header>
            <Header />
            <View>
              <GlobalText center type="headline2">
                {t(`wallet.nfts`)}
              </GlobalText>
              <GlobalText type="headline3">{t(`wallet.my_nfts`)}</GlobalText>
            </View>
            <GlobalNftList
              nonFungibleTokens={nftsGroup}
              listedInfo={listedInfo}
              onClick={onClick}
            />
          </GlobalLayout.Header>
        )}
        {!loaded && <GlobalSkeleton type="NftListScreen" />}
      </GlobalLayout>
    </>
  );
};

export default withTranslation()(NftsListPage);
