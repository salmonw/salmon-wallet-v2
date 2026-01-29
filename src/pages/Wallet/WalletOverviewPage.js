import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getSwitches, getMarketChart, getCoinInfo } from '../../adapter';
import get from 'lodash-es/get';
import isNil from 'lodash-es/isNil';

import { AppContext } from '../../AppProvider';
import TokenList from '../../features/TokenList/TokenList';
import { useNavigation } from '../../routes/hooks';
import { ROUTES_MAP as TOKEN_ROUTES_MAP } from '../../pages/Token/routes';
// PRIMEROS AJUSTES - No usado
// import { ROUTES_MAP as WALLET_ROUTES_MAP } from './routes';
import {
  mergeImportedTokens,
  getListedTokens,
  getNonListedTokens,
} from '../../utils/wallet';
import { CACHE_TYPES, invalidate } from '../../utils/cache';
import {
  hiddenValue,
  getLabelValue,
  showAmount,
  showPercentage,
} from '../../utils/amount';
import { withTranslation } from '../../hooks/useTranslations';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import theme from '../../component-library/Global/theme';
import GlobalCollapse from '../../component-library/Global/GlobalCollapse';
import GlobalPadding from '../../component-library/Global/GlobalPadding';
import GlobalSendReceive from '../../component-library/Global/GlobalSendReceive';
import GlobalChart from '../../component-library/Global/GlobalChart';
import WalletBalanceCard from '../../component-library/Global/GlobalBalance';
// Header ahora viene de LockSheet - no se usa aqui
// import Header from '../../component-library/Layout/Header';
// PRIMEROS AJUSTES - No usado (componente comentado)
// import MyNfts from './components/MyNfts';
import PendingTxs from './components/PendingTxs';
import PendingBridgeTxs from './components/PendingBridgeTxs';
import ImportTokenModal from './components/ImportTokenModal';

// Estilos para el layout con header fijo y scroll en tokens
const styles = StyleSheet.create({
  // Contenedor principal - ocupa toda la pantalla
  container: {
    flex: 1,
  },
  // Parte fija (WalletBalanceCard) - altura automatica
  fixedSection: {
    // Sin flex - altura automatica segun contenido
  },
  // ScrollView - ocupa el espacio restante
  scrollSection: {
    flexGrow: 1,
    flexShrink: 1,
  },
  // Contenido dentro del scroll con padding lateral
  scrollContent: {
    paddingHorizontal: theme.gutters.paddingLG, // 24px segun Figma
    paddingBottom: 120, // Espacio para que el contenido termine arriba del footer
  },
  // Secciones con padding (compatibilidad con estructura anterior)
  paddedSection: {
    paddingHorizontal: theme.gutters.paddingLG, // 24px segun Figma
  },
});

const NETWORK_TO_COINGECKO = {
  'solana-mainnet': 'solana',
  'solana-devnet': 'solana',
  'solana-testnet': 'solana',
  'bitcoin-mainnet': 'bitcoin',
  'bitcoin-testnet': 'bitcoin',
  'ethereum-mainnet': 'ethereum',
  'ethereum-sepolia': 'ethereum',
  'near-mainnet': 'near',
  'near-testnet': 'near',
  'eclipse-mainnet': 'solana',
  'eclipse-testnet': 'solana',
};

const WalletOverviewPage = ({ cfgs, t }) => {
  const navigate = useNavigation();
  const [
    { activeBlockchainAccount, networkId, activeTokens, hiddenBalance },
    { toggleHideBalance, importTokens },
  ] = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState({});
  const [tokenList, setTokenList] = useState([]);
  const [nonListedTokenList, setNonListedTokenList] = useState([]);
  const [availableTokens, setAvailableTokens] = useState([]);
  const [error, setError] = useState(null);
  const [switches, setSwitches] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartDays, setChartDays] = useState('ytd');
  const [chartError, setChartError] = useState(null);
  const [coinInfo, setCoinInfo] = useState(null);
  const [coinInfoLoading, setCoinInfoLoading] = useState(true);
  const allowsImported = switches?.features.import_tokens;
  const isBitcoin = networkId?.startsWith('bitcoin');

  useEffect(() => {
    const loadSwitches = async () => {
      try {
        const allSwitches = await getSwitches();
        setSwitches(allSwitches[networkId].sections.overview);
      } catch (e) {
        console.log(e);
        setError(e);
      }
    };

    loadSwitches();
  }, [networkId]);

  const loadCoinInfo = useCallback(async () => {
    const coinId = NETWORK_TO_COINGECKO[networkId];
    if (!coinId) return;

    try {
      setCoinInfoLoading(true);
      const infoResponse = await getCoinInfo(coinId);
      setCoinInfo(infoResponse);
    } catch (e) {
      console.log('Coin info error:', e);
    } finally {
      setCoinInfoLoading(false);
    }
  }, [networkId]);

  const loadChart = useCallback(async () => {
    const coinId = NETWORK_TO_COINGECKO[networkId];
    if (!coinId) {
      setChartError(new Error('Unsupported network'));
      setChartLoading(false);
      return;
    }

    try {
      setChartLoading(true);
      setChartError(null);
      const chartResponse = await getMarketChart(coinId, chartDays);
      setChartData(chartResponse);
    } catch (e) {
      console.log('Chart error:', e);
      setChartError(e);
    } finally {
      setChartLoading(false);
    }
  }, [networkId, chartDays]);

  useEffect(() => {
    if (isBitcoin) {
      loadCoinInfo();
    }
  }, [loadCoinInfo, isBitcoin]);

  useEffect(() => {
    if (isBitcoin) {
      loadChart();
    }
  }, [loadChart, isBitcoin]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const tokensAddresses = Object.keys(activeTokens);
      const balance = await activeBlockchainAccount.getBalance(tokensAddresses);
      setTotalBalance(balance);
      setTokenList(
        allowsImported
          ? mergeImportedTokens(balance.items, activeTokens)
          : getListedTokens(balance),
      );
      allowsImported &&
        setAvailableTokens(await activeBlockchainAccount.getAvailableTokens());
      setNonListedTokenList(getNonListedTokens(balance, []));
    } catch (e) {
      console.log(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [activeBlockchainAccount, activeTokens, allowsImported]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    invalidate(CACHE_TYPES.BALANCE);
    invalidate(CACHE_TYPES.NFTS);
    await load();
  }, [load]);

  const goToSend = () => {
    navigate(TOKEN_ROUTES_MAP.TOKEN_SELECT, { action: 'send' });
  };

  const goToReceive = () => navigate(TOKEN_ROUTES_MAP.TOKEN_RECEIVE);

  const goToTokenDetail = ({ address }) => {
    navigate(TOKEN_ROUTES_MAP.TOKEN_DETAIL, { tokenId: address });
  };

  const onImport = async token => {
    await importTokens(networkId, [{ imported: true, ...token }]);
    onRefresh();
  };

  const total = useMemo(
    () =>
      hiddenBalance ? `$ ${hiddenValue}` : showAmount(totalBalance.usdTotal),
    [totalBalance, hiddenBalance],
  );

  const percent = useMemo(
    () => get(totalBalance, 'last24HoursChange.perc', 0),
    [totalBalance],
  );

  const alert = useMemo(() => {
    if (error) {
      return {
        text: t('wallet.load_error'),
        type: 'error',
        onPress: onRefresh,
      };
    }
    if (isNil(totalBalance?.usdTotal)) {
      return {
        text: t('wallet.prices_issue'),
        type: 'warning',
        onPress: onRefresh,
      };
    }
    return null;
  }, [error, totalBalance, onRefresh, t]);

  return (
    <View style={styles.container}>
      {/* Seccion fija - WalletBalanceCard NO scrollea */}
      <View style={styles.fixedSection}>
        {/* Balance Card - va de borde a borde, comienza desde top: 0, debajo del header */}
        {/* El padding-top de 114px dentro del card deja espacio para el header */}
        <WalletBalanceCard
          loading={loading}
          total={total}
          {...{ [`${getLabelValue(percent)}Total`]: showPercentage(percent) }}
          showBalance={!hiddenBalance}
          onToggleShow={toggleHideBalance}
          onRefresh={onRefresh}
          alert={alert}
          actions={
            <GlobalSendReceive
              goToSend={goToSend}
              goToReceive={goToReceive}
              canSend={switches?.features?.send}
              canReceive={switches?.features?.receive}
            />
          }
        />
      </View>

      {/* Seccion scrolleable - Solo TokenList y contenido de abajo */}
      <ScrollView
        style={styles.scrollSection}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        <GlobalPadding />
        <PendingTxs />
        <PendingBridgeTxs />

        {!error && (
          networkId?.startsWith('bitcoin') ? (
            <TokenList
              loading={loading}
              tokens={tokenList}
              onDetail={goToTokenDetail}
              hiddenBalance={hiddenBalance}
            />
          ) : (
            <GlobalCollapse title={t('wallet.my_tokens')} isOpen>
              <TokenList
                loading={loading}
                tokens={tokenList}
                onDetail={goToTokenDetail}
                hiddenBalance={hiddenBalance}
              />
            </GlobalCollapse>
          )
        )}
        {!error && (loading || nonListedTokenList?.length) ? (
          <GlobalCollapse title={t('wallet.non_listed_tokens')} isOpen>
            <TokenList
              loading={loading}
              tokens={nonListedTokenList}
              hiddenBalance={hiddenBalance}
            />
          </GlobalCollapse>
        ) : null}
        {isBitcoin && (
          <GlobalChart
            data={chartData}
            coinInfo={coinInfo}
            chartLoading={chartLoading}
            coinInfoLoading={coinInfoLoading}
            error={chartError}
            selectedTimeframe={chartDays}
            onTimeframeChange={setChartDays}
          />
        )}
        {allowsImported && (
          <ImportTokenModal tokens={availableTokens} onChange={onImport} />
        )}
        {/* PRIMEROS AJUSTES - Roadmap: Quitar NFTs de la home */}
        {/* Fecha: 2025-10-31 */}
        {/* {switches?.features.collectibles && (
          <>
            <GlobalPadding />
            <MyNfts />
          </>
        )} */}
      </ScrollView>
    </View>
  );
};

export default withTranslation()(WalletOverviewPage);
