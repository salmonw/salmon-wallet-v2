import React from 'react';
import ContentLoader from 'react-content-loader';
import theme from '../../component-library/Global/theme';

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
    case 'Chart':
      return <Chart />;
    case 'ChartPrice':
      return <ChartPrice />;
    case 'ChartInfo':
      return <ChartInfo />;
    case 'ChartAbout':
      return <ChartAbout />;
  }
};

const TokenList = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 100">
    <rect x="0" y="0" rx="3" ry="3" width="100" height="23" />
    <rect x="0" y={25} rx="3" ry="3" width="100" height="23" />
    <rect x="0" y={25 * 2} rx="3" ry="3" width="100" height="23" />
    <rect x="0" y={25 * 3} rx="3" ry="3" width="100" height="23" />
  </ContentLoader>
);

const TokenListSend = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 200">
    <rect x="0" y="23" rx="3" ry="3" width="100" height="14" />
    <rect x="0" y="54" rx="3" ry="3" width="100" height="14" />
    <rect x="0" y="70" rx="3" ry="3" width="100" height="14" />
    <rect x="0" y="86" rx="3" ry="3" width="100" height="14" />
    <rect x="0" y="102" rx="3" ry="3" width="100" height="14" />
    <rect x="0" y="118" rx="3" ry="3" width="100" height="14" />
    <rect x="0" y="134" rx="3" ry="3" width="100" height="14" />
  </ContentLoader>
);

const NftList = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 100">
    <rect x="0" y="0" rx="5" ry="5" width="48" height="48" />
    <rect x="52" y="0" rx="5" ry="5" width="48" height="48" />
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
    <rect x="1" y="2" rx="5" ry="5" width="48" height="44" />
    {/* NFT 1 - Name container */}
    <rect x="1" y="38" rx="5" ry="5" width="48" height="13" />

    {/* NFT 2 - Image (48% width, right side) */}
    <rect x="51" y="2" rx="5" ry="5" width="48" height="44" />
    {/* NFT 2 - Name container */}
    <rect x="51" y="38" rx="5" ry="5" width="48" height="13" />

    {/* NFT 3 - Image */}
    <rect x="1" y="57" rx="5" ry="5" width="48" height="44" />
    {/* NFT 3 - Name container */}
    <rect x="1" y="93" rx="5" ry="5" width="48" height="13" />

    {/* NFT 4 - Image */}
    <rect x="51" y="57" rx="5" ry="5" width="48" height="44" />
    {/* NFT 4 - Name container */}
    <rect x="51" y="93" rx="5" ry="5" width="48" height="13" />
  </ContentLoader>
);

const NftItem = () => (
  <ContentLoader
    width="100%"
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 120">
    {/* NFT Image - square with borderRadius */}
    <rect x="0" y="0" rx="10" ry="10" width="100" height="100" />
    {/* NFT Name container - overlaps image slightly */}
    <rect x="0" y="85" rx="10" ry="10" width="100" height="35" />
  </ContentLoader>
);

const ActivityList = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 200">
    <rect x="0" y="0" rx="3" ry="3" width="100" height="23" />
    <rect x="0" y={25} rx="3" ry="3" width="100" height="23" />
    <rect x="0" y={25 * 2} rx="3" ry="3" width="100" height="23" />
    <rect x="0" y={25 * 3} rx="3" ry="3" width="100" height="23" />
    <rect x="0" y={25 * 4} rx="3" ry="3" width="100" height="23" />
    <rect x="0" y={25 * 5} rx="3" ry="3" width="100" height="23" />
    <rect x="0" y={25 * 6} rx="3" ry="3" width="100" height="23" />
    <rect x="0" y={25 * 7} rx="3" ry="3" width="100" height="23" />
  </ContentLoader>
);

const Balance = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 24">
    <rect x="20" y="0" rx="3" ry="3" width="60" height="12" />
    <rect x="36" y="14" rx="3" ry="3" width="28" height="8" />
  </ContentLoader>
);

const NftDetail = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 280">
    {/* NFT Title (headline2) */}
    <rect x="25" y="5" rx="3" ry="3" width="50" height="10" />
    {/* NFT Image (large squircle) */}
    <rect x="15" y="22" rx="8" ry="8" width="70" height="70" />
    {/* Input field for address/price */}
    <rect x="5" y="102" rx="4" ry="4" width="90" height="18" />
    {/* Info row 1 */}
    <rect x="5" y="128" rx="4" ry="4" width="90" height="14" />
    {/* Info row 2 */}
    <rect x="5" y="148" rx="4" ry="4" width="90" height="14" />
    {/* Info row 3 (fee) */}
    <rect x="5" y="168" rx="4" ry="4" width="90" height="14" />
    {/* Buttons */}
    <rect x="5" y="195" rx="6" ry="6" width="42" height="16" />
    <rect x="53" y="195" rx="6" ry="6" width="42" height="16" />
  </ContentLoader>
);

const TransactionDetail = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 260">
    {/* IconsBanner - Main circle */}
    <circle cx="50" cy="25" r="18" />
    {/* IconsBanner - Status badge (floating) */}
    <circle cx="62" cy="38" r="6" />
    {/* Amount line 1 (headline2) */}
    <rect x="20" y="52" rx="3" ry="3" width="60" height="10" />
    {/* Amount line 2 (if swap) */}
    <rect x="25" y="66" rx="3" ry="3" width="50" height="8" />
    {/* Info row - Date */}
    <rect x="5" y="85" rx="4" ry="4" width="90" height="12" />
    {/* Info row - Type */}
    <rect x="5" y="102" rx="4" ry="4" width="90" height="12" />
    {/* Info row - ID */}
    <rect x="5" y="119" rx="4" ry="4" width="90" height="12" />
    {/* Info row - Status */}
    <rect x="5" y="136" rx="4" ry="4" width="90" height="12" />
    {/* Info row - From/To */}
    <rect x="5" y="153" rx="4" ry="4" width="90" height="12" />
    {/* Info row - Fee */}
    <rect x="5" y="170" rx="4" ry="4" width="90" height="12" />
    {/* Button - Explorer */}
    <rect x="15" y="200" rx="6" ry="6" width="70" height="14" />
    {/* Button - Back */}
    <rect x="15" y="220" rx="6" ry="6" width="70" height="14" />
  </ContentLoader>
);

const TransactionSimulation = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 100">
    <rect x="0" y="0" rx="3" ry="3" width="100" height="23" />
    <rect x="0" y={25} rx="3" ry="3" width="100" height="23" />
  </ContentLoader>
);

const Swap = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 100">
    <rect x="0" y="0" rx="3" ry="3" width="100" height="23" />
    <rect x="0" y={25} rx="3" ry="3" width="100" height="23" />
    <rect x="0" y={25 * 2} rx="3" ry="3" width="100" height="23" />
    <rect x="0" y={25 * 3} rx="3" ry="3" width="100" height="23" />
  </ContentLoader>
);

const DerivedAccounts = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 100">
    <rect x="0" y="0" rx="3" ry="3" width="100" height="15" />
    <rect x="0" y={18} rx="3" ry="3" width="100" height="15" />
    <rect x="0" y={18 * 2} rx="3" ry="3" width="100" height="15" />
    <rect x="0" y={18 * 3} rx="3" ry="3" width="100" height="15" />
  </ContentLoader>
);

const Generic = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 200">
    <rect x="0" y="0" width="100" height="200" />
  </ContentLoader>
);

const Chart = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 50">
    <rect x="0" y="0" rx="4" ry="4" width="100" height="50" />
  </ContentLoader>
);

const ChartPrice = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 28">
    {/* Main price */}
    <rect x="0" y="0" rx="3" ry="3" width="45" height="12" />
    {/* Price change amount */}
    <rect x="0" y="16" rx="2" ry="2" width="25" height="8" />
    {/* Percentage badge */}
    <rect x="28" y="16" rx="4" ry="4" width="18" height="8" />
  </ContentLoader>
);

const ChartInfo = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 120">
    {/* Title "Info" */}
    <rect x="0" y="0" rx="2" ry="2" width="20" height="8" />
    {/* Card container with rows */}
    <rect x="0" y="12" rx="4" ry="4" width="100" height="108" />
  </ContentLoader>
);

const ChartAbout = () => (
  <ContentLoader
    foregroundColor={theme.colors.cards}
    backgroundColor={theme.colors.bgLight}
    viewBox="0 0 100 70">
    {/* Title "About" */}
    <rect x="0" y="0" rx="2" ry="2" width="25" height="8" />
    {/* Description lines */}
    <rect x="0" y="14" rx="2" ry="2" width="100" height="6" />
    <rect x="0" y="24" rx="2" ry="2" width="100" height="6" />
    <rect x="0" y="34" rx="2" ry="2" width="100" height="6" />
    <rect x="0" y="44" rx="2" ry="2" width="100" height="6" />
    <rect x="0" y="54" rx="2" ry="2" width="75" height="6" />
  </ContentLoader>
);

export default GlobalSkeleton;
