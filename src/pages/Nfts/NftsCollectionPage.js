import React, { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';

import { AppContext } from '../../AppProvider';
import { useNavigation, withParams } from '../../routes/hooks';
import { ROUTES_MAP } from './routes';

import GlobalBackTitle from '../../component-library/Global/GlobalBackTitle';
import GlobalLayout from '../../component-library/Global/GlobalLayout';
import GlobalNftList from '../../component-library/Global/GlobalNftList';
import GlobalText from '../../component-library/Global/GlobalText';
// Header ahora viene de LockSheet - no se usa aqui
// import Header from '../../component-library/Layout/Header';

// Altura del Header de LockSheet para compensar el espacio
const LOCKSHEET_HEADER_HEIGHT = 63;
import useAnalyticsEventTracker from '../../hooks/useAnalyticsEventTracker';
import { SECTIONS_MAP } from '../../utils/tracking';

const NftsCollectionPage = ({ params }) => {
  useAnalyticsEventTracker(SECTIONS_MAP.NFT_COLLECTION);
  const navigate = useNavigation();
  const [loaded, setLoaded] = useState(false);
  const [nftsCollection, setNftsCollection] = useState([]);
  const [listedInfo, setListedInfo] = useState([]);
  const [{ activeBlockchainAccount }] = useContext(AppContext);
  useEffect(() => {
    const load = async () => {
      try {
        setLoaded(false);
        const nfts = await activeBlockchainAccount.getAllNftsGrouped();
        const collection = nfts.find(n => n.collection === params.id);
        if (collection) {
          setNftsCollection(collection.items);
        }
        const listed = await activeBlockchainAccount.getListedNfts();
        setListedInfo(listed);
      } finally {
        setLoaded(true);
      }
    };

    load();
  }, [activeBlockchainAccount, params.id]);
  const goToBack = () => {
    navigate(ROUTES_MAP.NFTS_LIST);
  };
  const onClick = nft => {
    navigate(ROUTES_MAP.NFTS_DETAIL, { id: nft.mint });
  };
  return (
    <GlobalLayout fullscreen>
      <GlobalLayout.Header>
        <View style={{ height: LOCKSHEET_HEADER_HEIGHT }} />
        <GlobalBackTitle
          onBack={goToBack}
          inlineTitle={
            <GlobalText type="headline2" center>
              {params.id}
            </GlobalText>
          }
        />
        <GlobalNftList
          loading={!loaded}
          nonFungibleTokens={nftsCollection}
          listedInfo={listedInfo}
          onClick={onClick}
        />
      </GlobalLayout.Header>
    </GlobalLayout>
  );
};

export default withParams(NftsCollectionPage);
