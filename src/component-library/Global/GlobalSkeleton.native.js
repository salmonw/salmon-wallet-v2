import React from 'react';
import { Dimensions } from 'react-native';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';
import theme from './theme';

const window = Dimensions.get('window');

const GlobalSkeleton = ({ type }) => {
  switch (type) {
    case 'TokenList':
      return <TokenList />;
    case 'TokenListSend':
      return <TokenListSend />;
    case 'NftList':
      return <NftList />;
    case 'NftListScreen':
      return <NftListScreen />;
    case 'NftItem':
      return <NftItem />;
    case 'ActivityList':
      return <ActivityList />;
    case 'Balance':
      return <Balance />;
    case 'NftDetail':
      return <NftDetail />;
    case 'TransactionDetail':
      return <TransactionDetail />;
    case 'TransactionSimulation':
      return <TransactionSimulation />;
    case 'Swap':
      return <Swap />;
    case 'DerivedAccounts':
      return <DerivedAccounts />;
    case 'Generic':
      return <Generic />;
  }
};

const TokenList = () => (
  <ContentLoader
    speed={8}
    width="100%"
    height={370}
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}>
    <Rect x="0" y="5" rx="5" ry="5" width={window.width - 35} height="70" />
    <Rect x="0" y="95" rx="5" ry="5" width={window.width - 35} height="70" />
    <Rect x="0" y="185" rx="5" ry="5" width={window.width - 35} height="70" />
    <Rect x="0" y="275" rx="5" ry="5" width={window.width - 35} height="70" />
  </ContentLoader>
);

const TokenListSend = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 200">
    <Rect x="0" y="23" rx="3" ry="3" width="100" height="14" />
    <Rect x="0" y="54" rx="3" ry="3" width="100" height="14" />
    <Rect x="0" y="70" rx="3" ry="3" width="100" height="14" />
    <Rect x="0" y="86" rx="3" ry="3" width="100" height="14" />
    <Rect x="0" y="102" rx="3" ry="3" width="100" height="14" />
    <Rect x="0" y="118" rx="3" ry="3" width="100" height="14" />
    <Rect x="0" y="134" rx="3" ry="3" width="100" height="14" />
  </ContentLoader>
);

const NftList = () => (
  <ContentLoader
    speed={8}
    width="100%"
    height={200}
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}>
    <Rect x="0" y="0" rx="5" ry="5" width="150" height="150" />
    <Rect x="170" y="0" rx="5" ry="5" width="150" height="150" />
  </ContentLoader>
);

const NftListScreen = () => (
  <ContentLoader
    width="100%"
    height={420}
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 112">
    {/* NFT GRID (2 columns) - using percentages in viewBox */}
    {/* NFT 1 - Image (48% width, left side) */}
    <Rect x="1" y="2" rx="5" ry="5" width="48" height="44" />
    {/* NFT 1 - Name container */}
    <Rect x="1" y="38" rx="5" ry="5" width="48" height="13" />

    {/* NFT 2 - Image (48% width, right side) */}
    <Rect x="51" y="2" rx="5" ry="5" width="48" height="44" />
    {/* NFT 2 - Name container */}
    <Rect x="51" y="38" rx="5" ry="5" width="48" height="13" />

    {/* NFT 3 - Image */}
    <Rect x="1" y="57" rx="5" ry="5" width="48" height="44" />
    {/* NFT 3 - Name container */}
    <Rect x="1" y="93" rx="5" ry="5" width="48" height="13" />

    {/* NFT 4 - Image */}
    <Rect x="51" y="57" rx="5" ry="5" width="48" height="44" />
    {/* NFT 4 - Name container */}
    <Rect x="51" y="93" rx="5" ry="5" width="48" height="13" />
  </ContentLoader>
);

const NftItem = () => (
  <ContentLoader
    width="100%"
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 120">
    {/* NFT Image - square with borderRadius */}
    <Rect x="0" y="0" rx="10" ry="10" width="100" height="100" />
    {/* NFT Name container - overlaps image slightly */}
    <Rect x="0" y="85" rx="10" ry="10" width="100" height="35" />
  </ContentLoader>
);

const ActivityList = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 200">
    <Rect x="0" y="0" rx="3" ry="3" width="100" height="23" />
    <Rect x="0" y="25" rx="3" ry="3" width="100" height="23" />
    <Rect x="0" y="50" rx="3" ry="3" width="100" height="23" />
    <Rect x="0" y="75" rx="3" ry="3" width="100" height="23" />
    <Rect x="0" y="100" rx="3" ry="3" width="100" height="23" />
    <Rect x="0" y="125" rx="3" ry="3" width="100" height="23" />
    <Rect x="0" y="150" rx="3" ry="3" width="100" height="23" />
    <Rect x="0" y="175" rx="3" ry="3" width="100" height="23" />
  </ContentLoader>
);

const Balance = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 24">
    <Rect x="20" y="0" rx="3" ry="3" width="60" height="12" />
    <Rect x="36" y="14" rx="3" ry="3" width="28" height="8" />
  </ContentLoader>
);

const NftDetail = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 280">
    {/* NFT Title (headline2) */}
    <Rect x="25" y="5" rx="3" ry="3" width="50" height="10" />
    {/* NFT Image (large squircle) */}
    <Rect x="15" y="22" rx="8" ry="8" width="70" height="70" />
    {/* Input field for address/price */}
    <Rect x="5" y="102" rx="4" ry="4" width="90" height="18" />
    {/* Info row 1 */}
    <Rect x="5" y="128" rx="4" ry="4" width="90" height="14" />
    {/* Info row 2 */}
    <Rect x="5" y="148" rx="4" ry="4" width="90" height="14" />
    {/* Info row 3 (fee) */}
    <Rect x="5" y="168" rx="4" ry="4" width="90" height="14" />
    {/* Buttons */}
    <Rect x="5" y="195" rx="6" ry="6" width="42" height="16" />
    <Rect x="53" y="195" rx="6" ry="6" width="42" height="16" />
  </ContentLoader>
);

const TransactionDetail = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 260">
    {/* IconsBanner - Main circle */}
    <Circle cx="50" cy="25" r="18" />
    {/* IconsBanner - Status badge (floating) */}
    <Circle cx="62" cy="38" r="6" />
    {/* Amount line 1 (headline2) */}
    <Rect x="20" y="52" rx="3" ry="3" width="60" height="10" />
    {/* Amount line 2 (if swap) */}
    <Rect x="25" y="66" rx="3" ry="3" width="50" height="8" />
    {/* Info row - Date */}
    <Rect x="5" y="85" rx="4" ry="4" width="90" height="12" />
    {/* Info row - Type */}
    <Rect x="5" y="102" rx="4" ry="4" width="90" height="12" />
    {/* Info row - ID */}
    <Rect x="5" y="119" rx="4" ry="4" width="90" height="12" />
    {/* Info row - Status */}
    <Rect x="5" y="136" rx="4" ry="4" width="90" height="12" />
    {/* Info row - From/To */}
    <Rect x="5" y="153" rx="4" ry="4" width="90" height="12" />
    {/* Info row - Fee */}
    <Rect x="5" y="170" rx="4" ry="4" width="90" height="12" />
    {/* Button - Explorer */}
    <Rect x="15" y="200" rx="6" ry="6" width="70" height="14" />
    {/* Button - Back */}
    <Rect x="15" y="220" rx="6" ry="6" width="70" height="14" />
  </ContentLoader>
);

const TransactionSimulation = () => (
  <ContentLoader
    speed={8}
    width="100%"
    height={370}
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}>
    <Rect x="0" y="5" rx="5" ry="5" width={window.width - 35} height="70" />
    <Rect x="0" y="95" rx="5" ry="5" width={window.width - 35} height="70" />
  </ContentLoader>
);

const Swap = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 85">
    {/* "You Send" label + Max button */}
    <Rect x="0" y="0" rx="2" ry="2" width="25" height="5" />
    <Rect x="88" y="0" rx="2" ry="2" width="12" height="5" />
    {/* Input field with token selector */}
    <Rect x="0" y="8" rx="4" ry="4" width="100" height="16" />
    {/* USD value + Available balance */}
    <Rect x="0" y="27" rx="2" ry="2" width="30" height="4" />
    <Rect x="60" y="27" rx="2" ry="2" width="40" height="4" />
    {/* "You Receive" label */}
    <Rect x="0" y="38" rx="2" ry="2" width="30" height="5" />
    {/* Output input field with token selector */}
    <Rect x="0" y="46" rx="4" ry="4" width="100" height="16" />
    {/* USD value */}
    <Rect x="0" y="65" rx="2" ry="2" width="30" height="4" />
  </ContentLoader>
);

const DerivedAccounts = () => (
  <ContentLoader
    speed={8}
    width="100%"
    height={370}
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}>
    <Rect x="0" y="0" rx="5" ry="5" width={window.width - 35} height="15" />
    <Rect x="0" y="18" rx="5" ry="5" width={window.width - 35} height="15" />
    <Rect x="0" y="36" rx="5" ry="5" width={window.width - 35} height="15" />
    <Rect x="0" y="54" rx="5" ry="5" width={window.width - 35} height="15" />
  </ContentLoader>
);

const Generic = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 200">
    <Rect x="0" y="0" width="100" height="200" />
  </ContentLoader>
);

export default GlobalSkeleton;
