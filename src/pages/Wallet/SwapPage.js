import React, { useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Linking, View, TouchableOpacity } from 'react-native';
import { BLOCKCHAINS, formatAmount, getNetworks, getSwitches } from '../../adapter';
import { AppContext } from '../../AppProvider';
import { useNavigation } from '../../routes/hooks';
import { withTranslation } from '../../hooks/useTranslations';
import { ROUTES_MAP as APP_ROUTES_MAP } from '../../routes/app-routes';
import theme, { globalStyles } from '../../component-library/Global/theme';
import { getTransactionImage, TRANSACTION_STATUS } from '../../utils/wallet';
import { CACHE_TYPES, invalidate } from '../../utils/cache';
import GlobalLayout from '../../component-library/Global/GlobalLayout';
import GlobalBackTitle from '../../component-library/Global/GlobalBackTitle';
import GlobalButton from '../../component-library/Global/GlobalButton';
import GlobalImage from '../../component-library/Global/GlobalImage';
import GlobalPadding from '../../component-library/Global/GlobalPadding';
import GlobalText from '../../component-library/Global/GlobalText';
import InputWithTokenSelector from '../../features/InputTokenSelector';
import GlobalSkeleton from '../../component-library/Global/GlobalSkeleton';
import { getMediaRemoteUrl } from '../../utils/media';
import { showValue } from '../../utils/amount';
import useAnalyticsEventTracker from '../../hooks/useAnalyticsEventTracker';
import useUserConfig from '../../hooks/useUserConfig';
import { SECTIONS_MAP, EVENTS_MAP } from '../../utils/tracking';
import { getSolanaTokenPrice } from '../../adapter/services/price-service';
import NetworkSelector from './components/NetworkSelector';

const styles = StyleSheet.create({
  viewTxLink: {
    fontFamily: theme.fonts.dmSansRegular,
    fontWeight: 'normal',
    textTransform: 'none',
  },
  creatingTx: {
    fontFamily: theme.fonts.dmSansRegular,
    color: theme.colors.labelSecondary,
    fontWeight: 'normal',
    textTransform: 'none',
  },
  symbolContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  floatingSwap: {
    position: 'absolute',
    zIndex: 1,
    right: 55,
    bottom: -5,
  },
  bigDetail: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  networkSelectorContainer: {
    marginTop: theme.gutters.paddingNormal,
    alignItems: 'center',
  },
});

const DetailItem = ({ title, value, color = 'primary', t }) => (
  <View style={globalStyles.inlineWell}>
    <GlobalText type="caption" color={color}>
      {title}
    </GlobalText>

    <GlobalText type="body1">{value}</GlobalText>
  </View>
);

const RouteDetailItem = ({ names, symbols, t }) => (
  <View style={globalStyles.inlineWell}>
    <GlobalText type="caption" color="negativeLight">
      {t('swap.best_route')}
    </GlobalText>
    <View>
      <GlobalText type="body2">{names}</GlobalText>
      <GlobalText type="caption" color="tertiary">
        {`(${symbols})`}
      </GlobalText>
    </View>
  </View>
);

const BigDetailItem = ({ title, value, t }) => (
  <View style={[globalStyles.inlineWell, styles.bigDetail]}>
    <GlobalText type="body1" color="secondary">
      {title}
    </GlobalText>

    <GlobalText type="headline2" nospace>
      {value}
    </GlobalText>
  </View>
);

const GlobalButtonTimer = React.memo(function ({
  onConfirm,
  onExpire,
  onQuote,
  t,
  ...props
}) {
  const [countdown, setCountdown] = useState(10);
  const getConfirmBtnTitle = () =>
    countdown > 0
      ? `${t('general.confirm')} (${countdown})`
      : t('swap.refresh_quote');
  const getConfirmBtnAction = () => {
    if (countdown > 0) {
      return onConfirm();
    } else {
      setCountdown(10);
      return onQuote();
    }
  };
  useEffect(() => setCountdown(10), []);
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearInterval(timer);
    } else {
      onExpire();
    }
  }, [countdown, onExpire]);
  return (
    <GlobalButton
      title={getConfirmBtnTitle()}
      onPress={getConfirmBtnAction}
      {...props}
    />
  );
});

const linkForTransaction = (title, id, status, explorer) => {
  const openTransaction = async tx => {
    const url = explorer.url.replace('{txId}', tx);
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log(`UNSUPPORTED LINK ${url}`);
    }
  };

  return (
    <View style={globalStyles.inlineCentered}>
      <GlobalButton
        type="text"
        wide
        textStyle={styles.viewTxLink}
        title={title}
        readonly={false}
        onPress={() => openTransaction(id)}
      />
      {status === 0 && (
        <GlobalImage
          style={globalStyles.centeredSmall}
          source={getTransactionImage('swapping')}
          size="xs"
          circle
        />
      )}
      {status === 1 && (
        <GlobalImage
          style={globalStyles.centeredSmall}
          source={getTransactionImage('success')}
          size="xs"
          circle
        />
      )}
      {status === 2 && (
        <GlobalImage
          style={globalStyles.centeredSmall}
          source={getTransactionImage('fail')}
          size="xs"
          circle
        />
      )}
    </View>
  );
};

const SwapPage = ({ t }) => {
  const navigate = useNavigation();
  const [
    { activeBlockchainAccount, networkId, hiddenValue, activeTokens },
    { importTokens, changeNetwork },
  ] = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [tokens, setTokens] = useState([]);
  const [ready, setReady] = useState(false);
  const [solanaNetworks, setSolanaNetworks] = useState([]);

  const isSolana = activeBlockchainAccount?.network?.blockchain === BLOCKCHAINS.SOLANA;

  // Load Solana networks for the selector when blockchain is not Solana
  useEffect(() => {
    if (!isSolana) {
      Promise.all([getNetworks(), getSwitches()]).then(([allNetworks, switches]) => {
        const filtered = allNetworks.filter(
          ({ id, blockchain }) =>
            blockchain === BLOCKCHAINS.SOLANA && switches[id]?.enable,
        );
        setSolanaNetworks(filtered);
      });
    }
  }, [isSolana]);
  const [error, setError] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [availableTokens, setAvailableTokens] = useState([]);
  const [featuredTokens, setFeaturedTokens] = useState([]);
  const [inToken, setInToken] = useState(null);
  const [outToken, setOutToken] = useState(null);
  const [inTokenWithPrice, setInTokenWithPrice] = useState(null);
  const [outTokenWithPrice, setOutTokenWithPrice] = useState(null);
  const [quote, setQuote] = useState();
  const [status, setStatus] = useState();
  const [currentTransaction, setCurrentTransaction] = useState('');

  const { trackEvent } = useAnalyticsEventTracker(SECTIONS_MAP.SWAP);
  const { explorer } = useUserConfig();

  const tokensAddresses = useMemo(
    () => Object.keys(activeTokens),
    [activeTokens],
  );

  useEffect(() => {
    if (activeBlockchainAccount && isSolana) {
      invalidate(CACHE_TYPES.AVAILABLE_TOKENS);
      Promise.all([
        activeBlockchainAccount.getBalance(tokensAddresses),
        activeBlockchainAccount.getAvailableTokens(),
        activeBlockchainAccount.getFeaturedTokens(),
      ]).then(([balance, atks, ftks]) => {
        const tks = balance.items || [];
        setTokens(tks);
        setInToken(tks.length ? tks[0] : null);
        setAvailableTokens(atks);
        setFeaturedTokens(ftks);
        setReady(true);
      });
    }
  }, [activeBlockchainAccount, tokensAddresses, isSolana]);

  // Always fetch fresh price from Jupiter for inToken to ensure accurate swap calculations
  useEffect(() => {
    if (!inToken || !isSolana) {
      setInTokenWithPrice(null);
      return;
    }

    const fetchPrice = async () => {
      const price = await getSolanaTokenPrice(inToken.address, networkId);
      setInTokenWithPrice({
        ...inToken,
        usdPrice: price,
      });
    };

    fetchPrice();
  }, [inToken, networkId, isSolana]);

  // Always fetch fresh price from Jupiter for outToken to ensure accurate swap calculations
  useEffect(() => {
    if (!outToken || !isSolana) {
      setOutTokenWithPrice(null);
      return;
    }

    const fetchPrice = async () => {
      const price = await getSolanaTokenPrice(outToken.address, networkId);
      setOutTokenWithPrice({
        ...outToken,
        usdPrice: price,
      });
    };

    fetchPrice();
  }, [outToken, networkId, isSolana]);

  const [inAmount, setInAmount] = useState(null);

  // Calculate estimated output amount based on USD prices
  const outAmount = useMemo(() => {
    if (!inAmount || !inTokenWithPrice || !outTokenWithPrice) {
      return '--';
    }

    const inTokenUsdPrice = inTokenWithPrice.usdPrice;
    const outTokenUsdPrice = outTokenWithPrice.usdPrice;

    // If both tokens have USD prices, calculate estimate
    if (inTokenUsdPrice && outTokenUsdPrice) {
      const inValueUsd = parseFloat(inAmount) * inTokenUsdPrice;
      const estimatedOut = inValueUsd / outTokenUsdPrice;
      return estimatedOut.toFixed(8).replace(/\.?0+$/, ''); // Remove trailing zeros
    }

    return '--';
  }, [inAmount, inTokenWithPrice, outTokenWithPrice]);

  useEffect(() => {
    setError(false);
  }, [inAmount, inToken, outToken]);

  const MIN_SWAP_USD = 1;
  const zeroAmount = inToken && inAmount && parseFloat(inAmount) <= 0;
  const inAmountUsd =
    inAmount && inTokenWithPrice?.usdPrice
      ? parseFloat(inAmount) * inTokenWithPrice.usdPrice
      : 0;
  const belowMinimum =
    !zeroAmount && inAmountUsd > 0 && inAmountUsd < MIN_SWAP_USD;

  const validAmount =
    inToken &&
    parseFloat(inAmount) <= inToken.uiAmount &&
    parseFloat(inAmount) > 0;

  const formattedFee = useMemo(() => {
    if (!quote?.fee) {
      return '';
    }
    const { amount, decimals, symbol, percent } = quote.fee;
    return percent
      ? `${percent}%`
      : `${formatAmount(amount, decimals)} ${symbol}`;
  }, [quote]);

  const formattedInput = useMemo(() => {
    const { amount, decimals, symbol = inToken?.symbol } = quote?.input || {};
    return `${decimals ? formatAmount(amount, decimals) : inAmount} ${symbol}`;
  }, [quote, inAmount, inToken]);

  const formattedOutput = useMemo(() => {
    const { amount, decimals, symbol = outToken?.symbol } = quote?.output || {};
    return `${decimals ? formatAmount(amount, decimals) : outAmount} ${symbol}`;
  }, [quote, outAmount, outToken]);

  const statusColor = useMemo(() => {
    switch (status) {
      case TRANSACTION_STATUS.SUCCESS:
        return 'positive';
      case TRANSACTION_STATUS.FAIL:
        return 'negative';
      default:
        return 'primary';
    }
  }, [status]);

  const goToBack = () => {
    navigate(APP_ROUTES_MAP.WALLET);
  };

  const onQuote = async () => {
    setError(false);
    setProcessing(true);
    try {
      const q = await activeBlockchainAccount.getBestSwapQuote(
        inToken.mint || inToken.address,
        outToken.address,
        parseFloat(inAmount),
      );
      setQuote(q);

      trackEvent(EVENTS_MAP.SWAP_QUOTE);
      setStep(2);
    } catch (e) {
      setError(true);
    } finally {
      setProcessing(false);
    }
  };
  const onExpire = async () => {};

  const onConfirm = async () => {
    setError(false);
    setProcessing(true);
    trackEvent(EVENTS_MAP.SWAP_CONFIRMED);
    setStatus(TRANSACTION_STATUS.SWAPPING);
    setStep(3);
    try {
      const txs = await activeBlockchainAccount.createSwapTransaction(quote);

      if (activeBlockchainAccount.network.blockchain === BLOCKCHAINS.ETHEREUM) {
        try {
          await importTokens(networkId, [outToken]);
        } catch (e) {
          console.error('Could not import token:', outToken, e);
        }
      }

      trackEvent(EVENTS_MAP.SWAP_COMPLETED);
      setStatus(TRANSACTION_STATUS.SUCCESS);
      invalidate(CACHE_TYPES.BALANCE);
      invalidate(CACHE_TYPES.TRANSACTIONS);
      setCurrentTransaction(txs[0]);
    } catch (ex) {
      console.error(ex);
      setError(true);
      trackEvent(EVENTS_MAP.SWAP_FAILED);
      setStatus(TRANSACTION_STATUS.FAIL);
    } finally {
      setProcessing(false);
    }
  };

  // Show network selector when blockchain is not Solana
  if (!isSolana) {
    return (
      <GlobalLayout>
        <GlobalLayout.Header>
          <GlobalBackTitle title={t('swap.swap_tokens')} />
          <GlobalPadding size="2xl" />
          <GlobalText type="body1" center>
            {t('swap.not_available_on_network')}
          </GlobalText>
          <GlobalPadding />
          <GlobalText type="body2" center color="tertiary">
            {t('swap.select_solana_network')}
          </GlobalText>
          {solanaNetworks.length > 0 && (
            <View style={styles.networkSelectorContainer}>
              <NetworkSelector
                networks={solanaNetworks}
                value=""
                setValue={changeNetwork}
              />
            </View>
          )}
        </GlobalLayout.Header>
      </GlobalLayout>
    );
  }

  return (
    <GlobalLayout>
      {step === 1 && (
        <>
          <GlobalLayout.Header>
            <GlobalBackTitle title={t('swap.swap_tokens')} />

            <GlobalPadding />
            {ready && tokens.length && (
              <>
                <View style={globalStyles.inlineFlexButtons}>
                  <GlobalText type="body2">{t('swap.you_send')}</GlobalText>
         
                  <GlobalButton
                      type="secondary"                      
                      size="small"
                      onPress={() => setInAmount(inToken.uiAmount.toString())}>                      
                      <GlobalText type="body1">                  
                        Max                      
                      </GlobalText>
                    </GlobalButton>  
                  
                </View>

                <GlobalPadding size="xs" />

                <InputWithTokenSelector
                  value={inAmount || ''}
                  setValue={setInAmount}
                  placeholder={t('swap.enter_amount')}
                  title={inToken.symbol}
                  tokens={tokens}
                  hiddenValue={hiddenValue}
                  image={getMediaRemoteUrl(inToken.logo)}
                  onChange={setInToken}
                  invalid={!validAmount && !!inAmount}
                  number
                  disableZeroBalance
                />
                {belowMinimum ? (
                  <GlobalText type="body1" center color="negative">
                    {t('swap.minimum_amount')}
                  </GlobalText>
                ) : (
                  !validAmount &&
                  !zeroAmount &&
                  !!inAmount && (
                    <GlobalText type="body1" center color="negative">
                      {t('token.send.amount.insufficient', {
                        max: inToken.uiAmount,
                      })}
                    </GlobalText>
                  )
                )}

                <GlobalPadding size="xs" />

                <View style={globalStyles.inlineFlexButtons}>
                  {inTokenWithPrice?.usdPrice && (
                    <GlobalText type="body1" color="tertiary">
                      {showValue(inAmount * inTokenWithPrice.usdPrice, 6)}{' '}
                      {t('general.usd')}
                    </GlobalText>                
                  )}

                  <View style={globalStyles.inline}>                                   
                    
                    <GlobalText type="caption" >                  
                      Available: {inToken.uiAmount} {inToken.symbol}
                    </GlobalText> 
                      
                    </View>
                  </View>

                <GlobalPadding size="md" />
                <GlobalText type="body2">{t('swap.you_receive')}</GlobalText>
                <GlobalPadding size="xs" />

                <InputWithTokenSelector
                  value={outAmount}
                  setValue={() => {}} // Dummy setter - field is disabled
                  title={outToken ? outToken.symbol : '-'}
                  tokens={availableTokens}
                  featuredTokens={featuredTokens}
                  image={
                    outToken ? getMediaRemoteUrl(outToken.logo) : undefined
                  }
                  onChange={setOutToken}
                  disabled
                />

                <GlobalPadding size="xs" />

                {outTokenWithPrice?.usdPrice && outAmount !== '--' && (
                  <GlobalText type="body1" color="tertiary">
                    {showValue(parseFloat(outAmount) * outTokenWithPrice.usdPrice, 7)}{' '}
                    {t('general.usd')}
                  </GlobalText>
                )}

                {error && (
                  <GlobalText type="body1" color="negative">
                    {t('general.error')}
                  </GlobalText>
                )}
              </>
            )}
            {!ready && <GlobalSkeleton type="Swap" />}
          </GlobalLayout.Header>

          <GlobalLayout.Footer>
            <GlobalButton
              type="primary"
              wideSmall
              title={t('swap.quote')}
              disabled={!validAmount || !outToken || processing || belowMinimum}
              onPress={onQuote}
            />
          </GlobalLayout.Footer>
        </>
      )}
      {step === 2 && (
        <>
          <GlobalLayout.Header>
            <GlobalBackTitle title={t('swap.swap_preview')} />
            <GlobalPadding />
            <BigDetailItem title={t('swap.you_send')} value={formattedInput} />
            <BigDetailItem
              title={t('swap.you_receive')}
              value={formattedOutput}
            />
            <GlobalPadding size="2xl" />
            {formattedFee ? (
              <DetailItem title={t('swap.total_fee')} value={formattedFee} />
            ) : null}
            <GlobalPadding size="xs" />
            <GlobalText type="caption" color="tertiary" center>
              {t('swap.platform_fee_disclaimer')}
            </GlobalText>
            <GlobalPadding size="md" />
            {quote?.custom?.priceImpact !== undefined ? (
              <DetailItem
                title={t('swap.price_impact')}
                value={`${quote.custom.priceImpact.toFixed(2)}%`}
                color={quote.custom.priceImpact > 1 ? 'negative' : 'primary'}
              />
            ) : null}
            {quote?.custom?.router ? (
              <DetailItem
                title={t('swap.router')}
                value={quote.custom.router.toUpperCase()}
              />
            ) : null}
            {quote?.custom?.gasless ? (
              <DetailItem
                title={t('swap.gasless')}
                value={t('swap.yes')}
                color="positive"
              />
            ) : null}
            {quote?.custom?.prioritizationFeeLamports > 0 ? (
              <DetailItem
                title={t('swap.priority_fee')}
                value={`${(quote.custom.prioritizationFeeLamports / 1e9).toFixed(6)} SOL`}
              />
            ) : null}
            {quote?.custom?.rentFeeLamports > 0 ? (
              <DetailItem
                title={t('swap.rent_fee')}
                value={`${(quote.custom.rentFeeLamports / 1e9).toFixed(6)} SOL`}
                color="tertiary"
              />
            ) : null}
            {quote?.custom?.slippageBps !== undefined ? (
              <DetailItem
                title={t('swap.slippage_tolerance')}
                value={`${(quote.custom.slippageBps / 100).toFixed(2)}%`}
              />
            ) : null}
            {quote?.custom?.otherAmountThreshold && outToken ? (
              <DetailItem
                title={t('swap.minimum_received')}
                value={`${formatAmount(quote.custom.otherAmountThreshold, outToken.decimals)} ${outToken.symbol}`}
              />
            ) : null}
            {quote?.custom?.swapMode ? (
              <DetailItem
                title={t('swap.swap_mode')}
                value={quote.custom.swapMode}
                color="tertiary"
              />
            ) : null}
          </GlobalLayout.Header>
          <GlobalLayout.Footer inlineFlex>
            <GlobalButton
              type="default"
              flex
              title={t('general.back')}
              onPress={() => {
                setStep(1);
                onExpire();
              }}
              style={[globalStyles.button, globalStyles.buttonLeft]}
              touchableStyles={globalStyles.buttonTouchable}
            />
            <GlobalButtonTimer
              type="primary"
              flex
              disabled={processing}
              style={[globalStyles.button, globalStyles.buttonRight]}
              touchableStyles={globalStyles.buttonTouchable}
              onConfirm={onConfirm}
              onExpire={onExpire}
              onQuote={onQuote}
              t={t}
            />
          </GlobalLayout.Footer>
        </>
      )}
      {step === 3 && (
        <>
          <GlobalLayout.Header>
            <GlobalPadding size="4xl" />
            <View style={globalStyles.centeredSmall}>
              <View style={styles.symbolContainer}>
                <GlobalImage
                  source={inToken.logo || activeBlockchainAccount.network.icon}
                  size="xl"
                  circle
                />
                <GlobalImage
                  source={getTransactionImage('swap')}
                  style={styles.floatingSwap}
                  size="sm"
                  circle
                />
                <GlobalImage
                  source={outToken.logo || activeBlockchainAccount.network.icon}
                  size="xl"
                  circle
                />
              </View>
              <GlobalPadding size="lg" />
              <View>
                <GlobalText type="headline3" center>
                  {formattedInput && `-${formattedInput}`}
                </GlobalText>
                <GlobalText type="headline3" center>
                  {formattedOutput && `+${formattedOutput}`}
                </GlobalText>
              </View>
              <GlobalPadding size="xl" />
              <GlobalText type={'body2'} color={statusColor} center>
                {t(`token.send.transaction_${status}`)}
              </GlobalText>
              <GlobalPadding size="sm" />
              {!processing &&
                currentTransaction &&
                linkForTransaction(
                  'Transaction Swap',
                  currentTransaction.id,
                  currentTransaction.status,
                  explorer,
                )}
              <GlobalPadding size="4xl" />
            </View>
          </GlobalLayout.Header>

          <GlobalLayout.Footer>
            {(status === TRANSACTION_STATUS.SUCCESS ||
              status === TRANSACTION_STATUS.FAIL) && (
              <GlobalButton
                type="secondary"
                title={t(`general.close`)}
                wide
                onPress={goToBack}
                style={globalStyles.button}
                touchableStyles={globalStyles.buttonTouchable}
              />
            )}
          </GlobalLayout.Footer>
        </>
      )}
    </GlobalLayout>
  );
};

export default withTranslation()(SwapPage);
