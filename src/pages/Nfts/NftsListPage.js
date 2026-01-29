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
// Header ahora viene de LockSheet - no se usa aqui
// import Header from '../../component-library/Layout/Header';

// Altura del Header de LockSheet para compensar el espacio
const LOCKSHEET_HEADER_HEIGHT = 63;
import Grid from '../../component-library/Grid/Grid';

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
          // TODO: Reactivar cuando se migre el servicio de listing (Hyperspace deprecado)
          if (false) {
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
        <GlobalLayout.Header>
          <View style={{ height: LOCKSHEET_HEADER_HEIGHT }} />
          <View>
            <GlobalText center type="headline2">
              {t(`wallet.nfts`)}
            </GlobalText>
            <GlobalText type="headline3">{t(`wallet.my_nfts`)}</GlobalText>
          </View>
          {!loaded && (
            <Grid
              spacing={1}
              columns={2}
              items={[1, 2, 3, 4].map(i => (
                <GlobalSkeleton key={i} type="NftItem" />
              ))}
            />
          )}
          {loaded && (
            <GlobalNftList
              nonFungibleTokens={nftsGroup}
              listedInfo={listedInfo}
              onClick={onClick}
            />
          )}
        </GlobalLayout.Header>
      </GlobalLayout>
    </>
  );
};

export default withTranslation()(NftsListPage);
