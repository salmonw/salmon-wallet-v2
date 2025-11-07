import React, { useContext, useEffect, useState } from 'react';
// LINT FIX - StyleSheet no usado
import { View } from 'react-native';
import { getSwitches } from '../../adapter';

import { AppContext } from '../../AppProvider';
import { useNavigation } from '../../routes/hooks';
import { withTranslation } from '../../hooks/useTranslations';
import { updatePendingNfts } from '../../utils/nfts';

import GlobalSkeleton from '../../component-library/Global/GlobalSkeleton';
import GlobalLayout from '../../component-library/Global/GlobalLayout';
import GlobalNftList from '../../component-library/Global/GlobalNftList';
import GlobalText from '../../component-library/Global/GlobalText';
import Header from '../../component-library/Layout/Header';

import useAnalyticsEventTracker from '../../hooks/useAnalyticsEventTracker';
import { SECTIONS_MAP } from '../../utils/tracking';
import { ROUTES_MAP as NFTS_ROUTES_MAP } from '../../pages/Nfts/routes';

const NftsListPage = ({ t }) => {
  useAnalyticsEventTracker(SECTIONS_MAP.NFT_LIST);
  const navigate = useNavigation();
  const [{ activeBlockchainAccount, networkId }] = useContext(AppContext);
  const [loaded, setLoaded] = useState(false);
  const [listedInfo, setListedInfo] = useState([]);
  const [nftsGroup, setNftsGroup] = useState([]);
  const [switches, setSwitches] = useState(null);

  useEffect(() => {
    getSwitches().then(allSwitches =>
      setSwitches(allSwitches[networkId].sections.collectibles),
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
            const listed = await activeBlockchainAccount.getListedNfts();
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
      navigate(NFTS_ROUTES_MAP.NFTS_DETAIL, { id: nft.mint }, { nft });
    }
  };

  return (
    <>
      <GlobalLayout>
        {loaded && (
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
