import React, { useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import debounce from 'lodash/debounce';
import pick from 'lodash/pick';

import { BLOCKCHAINS, getNetworks, getSwitches } from '../../adapter';
import { AppContext } from '../../AppProvider';
import NetworkSelector from './components/NetworkSelector';
import { useNavigation } from '../../routes/hooks';
import { withTranslation } from '../../hooks/useTranslations';
import { ROUTES_MAP as APP_ROUTES_MAP } from '../../routes/app-routes';
import theme, { globalStyles } from '../../component-library/Global/theme';
import GlobalLayout from '../../component-library/Global/GlobalLayout';
import GlobalBackTitle from '../../component-library/Global/GlobalBackTitle';
import GlobalButton from '../../component-library/Global/GlobalButton';
import GlobalImage from '../../component-library/Global/GlobalImage';
import GlobalPadding from '../../component-library/Global/GlobalPadding';
import GlobalText from '../../component-library/Global/GlobalText';
import GlobalCollapse from '../../component-library/Global/GlobalCollapse';
import CardButtonWallet from '../../component-library/CardButton/CardButtonWallet';
import GlobalAlert from '../../component-library/Global/GlobalAlert';
import InputWithTokenSelector from '../../features/InputTokenSelector';
import { getTransactionImage, TRANSACTION_STATUS } from '../../utils/wallet';
import { CACHE_TYPES, invalidate } from '../../utils/cache';
import { getMediaRemoteUrl } from '../../utils/media';
import { showValue } from '../../utils/amount';
import {
  getBridgeSupportedTokens,
  getBridgeEstimatedAmount,
  getBridgeMinimalAmount,
  createBridgeExchange,
} from '../../adapter';
import Header from '../../component-library/Layout/Header';
import GlobalSkeleton from '../../component-library/Global/GlobalSkeleton';
import BasicRadios from '../../component-library/Radios/BasicRadios';
import IconSwapAccent1 from '../../assets/images/IconSwapAccent1.png';
import IconSpinner from '../../assets/images/IconTransactionSending.gif';

import useAnalyticsEventTracker from '../../hooks/useAnalyticsEventTracker';
import { SECTIONS_MAP, EVENTS_MAP } from '../../utils/tracking';
import GlobalInputWithButton from '../../component-library/Global/GlobalInputWithButton';
import storage from '../../utils/storage';
import STORAGE_KEYS from '../../utils/storageKeys';

const styles = StyleSheet.create({
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
  previewLogos: {
    marginLeft: theme.gutters.paddingNormal,
    marginRight: theme.gutters.paddingXS,
    marginTop: theme.gutters.paddingXXS,
  },
  bigDetailItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  networkSelectorContainer: {
    marginTop: theme.gutters.paddingNormal,
    alignItems: 'center',
  },
});

const BigDetailItem = ({ title, amount, symbol, logo, t }) => (
  <View style={[globalStyles.inlineWell, styles.bigDetailItem]}>
    <GlobalText type="body1" color="secondary">
      {title}
    </GlobalText>
    <View style={[globalStyles.inline]}>
      <GlobalText type="headline2" nospace>
        {amount}
      </GlobalText>
      <GlobalImage
        style={[styles.previewLogos]}
        source={logo}
        size="xs"
        circle
      />
      <GlobalText type="headline2" nospace>
        {symbol}
      </GlobalText>
    </View>
  </View>
);

const GlobalButtonTimer = React.memo(function ({
  onConfirm,
  onQuote,
  processing,
  validAddress,
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
  const getConfirmBtnStatus = () =>
    countdown > 0 ? processing || !validAddress : processing;
  useEffect(() => setCountdown(10), []);
  useEffect(() => {
    const timer =
      countdown > 0 && setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);
  return (
    <GlobalButton
      title={getConfirmBtnTitle()}
      onPress={getConfirmBtnAction}
      disabled={getConfirmBtnStatus()}
      {...props}
    />
  );
});

// Explorer patterns to identify blockchain from address_explorer URL
const EXPLORER_PATTERNS = {
  solana: 'solana.com',
  bitcoin: '/bitcoin/', // Specific to avoid matching bitcoin-cash
  // ethereum: '/ethereum/', // TODO: Enable when ETH support is ready
};

// Get tokens for a specific blockchain from StealthEX supported tokens
const getTokensForBlockchain = (bsupp, blockchain, networkSymbol) => {
  const explorerPattern = EXPLORER_PATTERNS[blockchain] || '';
  return bsupp.filter(tok => {
    const tokNetwork = tok.network?.toLowerCase();
    if (tokNetwork === networkSymbol) {
      return true;
    }
    if (tokNetwork === 'mainnet' && explorerPattern) {
      return tok.address_explorer?.toLowerCase().includes(explorerPattern);
    }
    return false;
  });
};

// Get tokens from OTHER blockchains (for "You Receive" selector)
const getOtherBlockchainsTokens = (bsupp, currentBlockchain) => {
  const otherBlockchains = Object.keys(EXPLORER_PATTERNS).filter(
    b => b !== currentBlockchain,
  );
  const tokens = otherBlockchains.flatMap(blockchain => {
    const networkSymbol = blockchain === 'solana' ? 'sol' : blockchain === 'ethereum' ? 'eth' : 'btc';
    return getTokensForBlockchain(bsupp, blockchain, networkSymbol).map(tok => ({
      ...tok,
      blockchain,
    }));
  });
  // Sort alphabetically by name
  return tokens.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
};

const mergeStealthExTokenData = (bsupp, tks, network) => {
  const smbl = network.currency.symbol.toLowerCase();
  const isMatch = (tok1, tok2) =>
    tok1.symbol === tok2.symbol.toLowerCase() ||
    tok1.symbol === tok2.symbol.slice(0, 3).concat(smbl).toLowerCase() ||
    tok1.symbol === tok2.symbol.slice(0, 4).concat(smbl).toLowerCase();

  // Filter supported tokens for this network
  const networkTokens = getTokensForBlockchain(bsupp, network.blockchain, smbl);

  // Merge with balance data, include all supported tokens (even with 0 balance)
  const merged = networkTokens.map(el => {
    const balanceToken = tks?.find(element => isMatch(el, element));
    return {
      ...el,
      ...(balanceToken || {}),
      uiAmount: balanceToken?.uiAmount || 0,
      usdPrice: balanceToken?.usdPrice || 0,
      usdBalance: balanceToken?.usdBalance || 0,
      blockchain: network.blockchain,
    };
  });

  // Sort: tokens with balance > 0 first (by USD value desc), then others alphabetically
  return merged.sort((a, b) => {
    if (a.uiAmount > 0 && b.uiAmount === 0) return -1;
    if (a.uiAmount === 0 && b.uiAmount > 0) return 1;
    if (a.uiAmount > 0 && b.uiAmount > 0) {
      return (b.usdBalance || 0) - (a.usdBalance || 0);
    }
    return (a.name || '').localeCompare(b.name || '');
  });
};

const BridgePage = ({ t }) => {
  const navigate = useNavigation();
  const [
    {
      accounts,
      activeAccount,
      activeBlockchainAccount,
      hiddenValue,
      activeTokens,
    },
    { changeNetwork },
  ] = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [tokens, setTokens] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [providerError, setProviderError] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [availableTokens, setAvailableTokens] = useState([]);
  const [featuredTokens, setFeaturedTokens] = useState([]);
  const [inToken, setInToken] = useState(null);
  const [outToken, setOutToken] = useState(null);
  const [status, setStatus] = useState();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientType, setRecipientType] = useState('own');
  const [validAddress, setValidAddress] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [addressEmpty, setAddressEmpty] = useState(false);
  const [checkingAddress, setCheckingAddress] = useState(false);
  const [result, setResult] = useState(false);
  const [minimalAmount, setMinimalAmount] = useState(null);

  const { trackEvent } = useAnalyticsEventTracker(SECTIONS_MAP.SWAP);
  const current_blockchain = activeBlockchainAccount.network.blockchain;
  const current_symbol = activeBlockchainAccount.network.currency.symbol;

  // Bridge only works on mainnet networks (Solana mainnet, Bitcoin mainnet)
  const isMainnet = activeBlockchainAccount?.network?.environment === 'mainnet';
  const [mainnetNetworks, setMainnetNetworks] = useState([]);

  // Load mainnet networks for the selector when current network is not mainnet
  useEffect(() => {
    if (!isMainnet) {
      Promise.all([getNetworks(), getSwitches()]).then(([allNetworks, switches]) => {
        const filtered = allNetworks.filter(
          ({ id, blockchain, environment }) =>
            environment === 'mainnet' &&
            (blockchain === BLOCKCHAINS.SOLANA || blockchain === BLOCKCHAINS.BITCOIN) &&
            switches[id]?.enable,
        );
        setMainnetNetworks(filtered);
      });
    }
  }, [isMainnet]);

  const tokensAddresses = useMemo(
    () => Object.keys(activeTokens),
    [activeTokens],
  );

  const recipientAccounts = useMemo(
    () =>
      accounts.filter(
        account =>
          account.networksAccounts[
            `${
              outToken?.network === 'MAINNET'
                ? outToken?.name?.toLowerCase().split(' ')[0]
                : outToken?.network?.toLowerCase() ||
                  outToken?.name?.toLowerCase().split(' ')[0]
            }-mainnet`
          ],
      ),
    [accounts, outToken?.name, outToken?.network],
  );

  const RECIPIENT_OPTIONS = [
    { label: 'My Wallets', value: 'own' },
    { label: 'Other Wallet', value: 'other' },
  ];

  useEffect(() => {
    if (activeBlockchainAccount) {
      // Reset ready state to show skeleton while loading new network data
      setReady(false);

      const symbol = current_symbol.toLowerCase();

      // Load only active network balance first for faster initial render
      const activeNetworkBalance = async () => {
        const network = activeBlockchainAccount.network;
        const tokens = await activeBlockchainAccount.getBalance();
        return [{ network, tokens }];
      };

      Promise.all([
        activeNetworkBalance(),
        getBridgeSupportedTokens(),
      ])
        .then(([balance, bsupp]) => {
          const currentBlockchain = activeBlockchainAccount.network.blockchain;

          // Tokens for "You Pay" (current network)
          const tksSupp = balance
            .map(ntwBlc =>
              mergeStealthExTokenData(
                bsupp,
                ntwBlc.tokens.items,
                ntwBlc.network,
              ),
            )
            .flat(1);

          // Tokens for "You Receive" (other blockchains)
          const otherTokens = getOtherBlockchainsTokens(bsupp, currentBlockchain);

          setTokens(tksSupp);
          setInToken(
            tksSupp.length
              ? tksSupp.find(tok => tok.symbol === symbol) || tksSupp[0]
              : null,
          );
          setOutToken(otherTokens.length ? otherTokens[0] : null);
          setFeaturedTokens(otherTokens.slice(0, 4)); // First 4 as featured
          setAvailableTokens(otherTokens);
          setReady(true);
        })
        .catch(() => setProviderError(true));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBlockchainAccount?.address, activeBlockchainAccount?.network?.id]);

  const [inAmount, setInAmount] = useState(null);
  const [outAmount, setOutAmount] = useState('--');
  const [processingOutAmount, setProcessingOutAmount] = useState(false);

  const isMinimalAmount =
    minimalAmount && parseFloat(inAmount) >= minimalAmount;

  const onChangeInToken = token => {
    setInToken(token);
    // availableTokens already contains all tokens from other blockchains
    // No need to fetch again when changing input token
  };

  const onRefreshEstimate = () => {
    if (Number(inAmount) > 0 && outToken) {
      Promise.resolve(
        getBridgeEstimatedAmount(
          inToken.symbol.toLowerCase(),
          outToken.symbol,
          inAmount,
        ),
      ).then(async estAmount => {
        setOutAmount(estAmount);
      });
    } else {
      setOutAmount('--');
    }
  };

  const debounceIn = useMemo(
    () =>
      debounce((inAmt, inTkn, outTkn) => {
        Promise.all([
          getBridgeEstimatedAmount(
            inTkn.symbol.toLowerCase(),
            outTkn.symbol,
            inAmt,
          ),
          getBridgeMinimalAmount(inTkn.symbol.toLowerCase(), outTkn.symbol),
        ]).then(([estAmount, minAmount]) => {
          setOutAmount(parseFloat(inAmt) >= minAmount ? estAmount : '--');
          setMinimalAmount(minAmount);
          setProcessingOutAmount(false);
        });
      }, 500),
    [],
  );

  useEffect(() => {
    setProcessingOutAmount(true);
    if (Number(inAmount) > 0 && outToken) {
      setOutAmount('--');
      debounceIn(inAmount, inToken, outToken);
    } else {
      setOutAmount('--');
      setProcessingOutAmount(false);
    }
  }, [activeBlockchainAccount, debounceIn, inAmount, inToken, outToken]);

  useEffect(() => {
    setError(false);
  }, [inAmount, inToken, outToken]);

  const zeroAmount = inToken && parseFloat(inAmount) <= 0;

  const validAmount =
    inToken &&
    parseFloat(inAmount) <= inToken.uiAmount &&
    parseFloat(inAmount) > 0 &&
    isMinimalAmount;

  const goToBack = () => {
    navigate(APP_ROUTES_MAP.WALLET);
  };

  const onConfirm = async () => {
    setError(false);
    setProcessing(true);
    changeNetwork(`${inToken?.blockchain}-mainnet`);
    try {
      setStatus(TRANSACTION_STATUS.CREATING);
      setStep(3);
      setStatus(TRANSACTION_STATUS.BRIDGING);
      const exDet = await createBridgeExchange(
        inToken.symbol.toLowerCase(),
        outToken.symbol,
        inAmount,
        recipientAddress,
      );
      const { txId } = await activeBlockchainAccount.createTransferTransaction(
        exDet?.address_from,
        inToken.address,
        exDet?.expected_amount,
        { ...pick(inToken, 'decimals') },
      );
      await activeBlockchainAccount.confirmTransferTransaction(txId);
      setStatus(TRANSACTION_STATUS.BRIDGE_SUCCESS);
      savePendingTx(exDet);
      trackEvent(EVENTS_MAP.BRIDGE_COMPLETED);
      setProcessing(false);
      setError(false);
    } catch (e) {
      console.error(e);
      setError(true);
      setStatus(TRANSACTION_STATUS.FAIL);
      trackEvent(EVENTS_MAP.BRIDGE_FAILED);

      setStep(3);
      setProcessing(false);
    }
  };

  const statusColor = useMemo(() => {
    switch (status) {
      case 'success':
        return 'positive';
      case 'fail':
        return 'negative';
      default:
        return 'primary';
    }
  }, [status]);

  const validateAddress = useMemo(
    () =>
      debounce(async (a, regex) => {
        setCheckingAddress(true);
        setValidAddress(null);
        if (a) {
          const valid = new RegExp(regex).test(a);
          if (valid || !regex) {
            setCheckingAddress(false);
            setValidAddress(true);
            setAddressEmpty(true);
            setResult({ type: 'SUCCESS', code: 'VALID_ACCOUNT' });
          } else {
            setCheckingAddress(false);
            setValidAddress(false);
            setResult({ type: 'ERROR', code: 'ERROR' });
            console.log(error);
          }
        }
      }, 500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeBlockchainAccount],
  );
  useEffect(() => {
    setResult();
    if (recipientAddress) {
      validateAddress(recipientAddress, outToken.validation_address);
    } else {
      setValidAddress(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientAddress]);

  const savePendingTx = async exDet => {
    exDet.status = 'inProgress';
    const lastStatus = new Date().getTime();
    const expires = new Date().getTime() + 24 * 60 * 60 * 1000;
    let transactions = await storage.getItem(STORAGE_KEYS.PENDING_BRIDGE_TXS);
    if (transactions === null) transactions = [];
    transactions.push({
      account: activeBlockchainAccount.publicKey,
      chain: activeBlockchainAccount.chain,
      lastStatus,
      expires,
      ...exDet,
    });
    storage.setItem(STORAGE_KEYS.PENDING_BRIDGE_TXS, transactions);
  };

  // Show network selector when not on mainnet
  if (!isMainnet) {
    return (
      <GlobalLayout>
        <GlobalLayout.Header>
          <Header />
          <GlobalBackTitle title={t('bridge.bridge')} />
          <GlobalPadding size="2xl" />
          <GlobalText type="body1" center>
            {t('bridge.not_available_on_testnet')}
          </GlobalText>
          <GlobalPadding />
          <GlobalText type="body2" center color="tertiary">
            {t('bridge.select_mainnet_network')}
          </GlobalText>
          {mainnetNetworks.length > 0 && (
            <View style={styles.networkSelectorContainer}>
              <NetworkSelector
                networks={mainnetNetworks}
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
      {step === 1 &&
        (providerError ? (
          <GlobalLayout.Header>
            <Header />
            <GlobalBackTitle title={t('bridge.bridge')} />
            <GlobalPadding size="4xl" />
            <GlobalPadding size="4xl" />
            <GlobalPadding size="4xl" />
            <GlobalPadding size="xl" />

            <GlobalText type="body3" color="secondary" center>
              {t('bridge.provider_error')}
            </GlobalText>
            <GlobalPadding />

            <GlobalButton
              type="secondary"
              size="medium"
              title={t('actions.retry')}
              onPress={() => setProviderError(false)}
            />
          </GlobalLayout.Header>
        ) : (
          <>
            <GlobalLayout.Header>
              <Header />
              <GlobalBackTitle title={t('bridge.bridge')} />
              <GlobalPadding />
              {ready && tokens.length && inToken && (
                <>
                  <View style={globalStyles.inlineFlexButtons}>
                    <GlobalText type="body2">{t('bridge.you_pay')}</GlobalText>
                    <GlobalText type="body1">
                      Max. {inToken.uiAmount} {inToken.symbol}
                    </GlobalText>
                  </View>

                  <GlobalPadding size="xs" />

                  <InputWithTokenSelector
                    value={inAmount || ''}
                    setValue={setInAmount}
                    placeholder={t('swap.enter_amount')}
                    title={inToken.symbol.toUpperCase()}
                    description={inToken.network || inToken.name}
                    tokens={tokens}
                    hiddenValue={hiddenValue}
                    image={getMediaRemoteUrl(inToken.logo || inToken.image)}
                    onChange={onChangeInToken}
                    invalid={!validAmount && !!inAmount}
                    number
                    chips
                    disableZeroBalance
                  />
                  {zeroAmount ? (
                    <GlobalText type="body1" center color="negative">
                      {t(`token.send.amount.invalid`)}
                    </GlobalText>
                  ) : !isMinimalAmount && !!inAmount ? (
                    minimalAmount && (
                      <GlobalText type="body1" center color="negative">
                        {t(`bridge.less_than_minimal`, {
                          min: minimalAmount,
                          symbol: inToken.name,
                        })}
                      </GlobalText>
                    )
                  ) : (
                    !validAmount &&
                    !!inAmount && (
                      <GlobalText type="body1" center color="negative">
                        {t(`token.send.amount.insufficient`, {
                          max: inToken.uiAmount,
                        })}
                      </GlobalText>
                    )
                  )}
                  <GlobalPadding size="xs" />

                  <GlobalText type="body1" color="tertiary">
                    {showValue(inAmount * inToken.usdPrice, 6)}{' '}
                    {t('general.usd')}
                  </GlobalText>
                  <GlobalPadding size="sm" />

                  {processingOutAmount ? (
                    <GlobalImage
                      source={IconSpinner}
                      size="normal"
                      style={globalStyles.centeredSmall}
                      circle
                    />
                  ) : (
                    <GlobalImage
                      source={IconSwapAccent1}
                      size="normal"
                      style={globalStyles.centeredSmall}
                      circle
                    />
                  )}
                  <GlobalPadding size="sm" />
                  <GlobalText type="body2">{t('swap.you_receive')}</GlobalText>
                  <GlobalPadding size="xs" />

                  <InputWithTokenSelector
                    value={outAmount || '--'}
                    setValue={setOutAmount}
                    title={outToken ? outToken.symbol.toUpperCase() : '--'}
                    description={outToken?.network || outToken?.name}
                    tokens={availableTokens}
                    featuredTokens={featuredTokens}
                    image={
                      outToken
                        ? getMediaRemoteUrl(outToken.logo || outToken.image)
                        : undefined
                    }
                    onChange={setOutToken}
                    disabled
                    chips
                  />

                  <GlobalPadding size="xs" />

                  {error && (
                    <GlobalText type="body1" color="negative">
                      {t('general.error')}
                    </GlobalText>
                  )}
                </>
              )}
              {!ready && <GlobalSkeleton type="Bridge" />}
            </GlobalLayout.Header>

            <GlobalLayout.Footer>
              <GlobalButton
                type="primary"
                wideSmall
                title={t('actions.next')}
                disabled={
                  !validAmount ||
                  !outToken ||
                  processing ||
                  processingOutAmount ||
                  outAmount === '--'
                }
                onPress={() => setStep(2)}
              />
            </GlobalLayout.Footer>
          </>
        ))}
      {step === 2 && (
        <>
          <GlobalLayout.Header>
            <GlobalBackTitle title={t('bridge.preview')} />
            <GlobalPadding />
            <BigDetailItem
              title={t('bridge.you_pay')}
              amount={inAmount}
              symbol={inToken.symbol.toUpperCase()}
              logo={inToken.logo || current_blockchain.network.icon}
            />
            <BigDetailItem
              title={t('swap.you_receive')}
              amount={outAmount}
              symbol={outToken.symbol.toUpperCase()}
              logo={outToken.logo || current_blockchain.network.icon}
            />
            <GlobalPadding size="lg" />
            <BasicRadios
              label={t('bridge.recipient_type')}
              value={recipientType}
              setValue={setRecipientType}
              options={RECIPIENT_OPTIONS}
            />
            {recipientType === 'other' && (
              <>
                <GlobalPadding size="lg" />
                <GlobalInputWithButton
                  startLabel={t('general.to')}
                  placeholder={t('general.recipient_s_address', {
                    token: outToken.symbol.toUpperCase(),
                  })}
                  value={recipientAddress}
                  setValue={setRecipientAddress}
                  onActionPress={() => {}}
                  editable={!checkingAddress}
                  validating={checkingAddress}
                  complete={validAddress}
                  inputStyle={
                    result && result.type !== 'SUCCESS'
                      ? styles[result.type]
                      : {}
                  }
                  style={{ paddingHorizontal: theme.gutters.paddingSM }}
                  returnKeyType="done"
                  onSubmitEditing={() => validAddress && onConfirm()}
                  onEnter={() => validAddress && onConfirm()}
                />
                <GlobalPadding size="xl" />
                <GlobalAlert
                  type="warning"
                  noIcon
                  text={t('bridge.other_wallet_alert', {
                    to: outToken.network || outToken.name,
                  })}
                />
              </>
            )}
            {recipientType === 'own' &&
              (recipientAccounts.length > 0 ? (
                <>
                  <GlobalPadding size="xxs" />
                  <GlobalCollapse
                    title={t('settings.wallets.my_wallets')}
                    titleStyle={styles.titleStyle}
                    isOpen
                    hideCollapse>
                    {recipientAccounts.flatMap(account =>
                      account.networksAccounts[
                        `${
                          outToken?.network === 'MAINNET'
                            ? outToken?.name?.toLowerCase().split(' ')[0]
                            : outToken?.network?.toLowerCase() ||
                              outToken?.name?.toLowerCase().split(' ')[0]
                        }-mainnet`
                      ]?.map(blockchainAccount => (
                        <CardButtonWallet
                          key={blockchainAccount.getReceiveAddress()}
                          title={account.name}
                          address={blockchainAccount.getReceiveAddress()}
                          image={blockchainAccount.network.icon}
                          imageSize="md"
                          selected={
                            blockchainAccount.getReceiveAddress() ===
                            recipientAddress
                          }
                          onPress={() =>
                            setRecipientAddress(
                              blockchainAccount.getReceiveAddress(),
                            )
                          }
                          buttonStyle={globalStyles.addressBookItem}
                          touchableStyles={globalStyles.addressBookTouchable}
                          transparent
                        />
                      )),
                    )}
                  </GlobalCollapse>
                  <GlobalPadding size="md" />
                  <GlobalAlert
                    type="warning"
                    noIcon
                    text={t('bridge.own_wallet_alert', {
                      from: inToken.network || inToken.name,
                      to: outToken.network || outToken.name,
                    })}
                  />
                </>
              ) : (
                <>
                  <GlobalPadding size="xl" />
                  <GlobalAlert
                    type="warning"
                    noIcon
                    text={t('bridge.no_wallet_found', {
                      chain: outToken.network || outToken.name,
                    })}
                  />
                </>
              ))}
            {result && result.type !== 'SUCCESS' && (
              <>
                <GlobalPadding size="sm" />
                <GlobalText
                  type="body1"
                  center
                  color={result.type === 'ERROR' ? 'negative' : 'warning'}>
                  {t(`general.address_validation.${result.code}`)}
                </GlobalText>
              </>
            )}
          </GlobalLayout.Header>
          <GlobalLayout.Footer inlineFlex>
            <GlobalButton
              type="default"
              flex
              title={t('general.back')}
              onPress={() => setStep(1)}
              style={[globalStyles.button, globalStyles.buttonLeft]}
              touchableStyles={globalStyles.buttonTouchable}
            />
            <GlobalButtonTimer
              type="primary"
              flex
              style={[globalStyles.button, globalStyles.buttonRight]}
              touchableStyles={globalStyles.buttonTouchable}
              onConfirm={onConfirm}
              onQuote={onRefreshEstimate}
              processing={processing}
              validAddress={validAddress}
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
                  source={inToken.logo || current_blockchain.network.icon}
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
                  source={outToken.logo || current_blockchain.network.icon}
                  size="xl"
                  circle
                />
              </View>
              <GlobalPadding size="lg" />
              <GlobalPadding size="xl" />
              {status !== 'creating' && (
                <GlobalText type={'body2'} color={statusColor} center>
                  {t(`token.send.transaction_${status}`)}
                </GlobalText>
              )}
              <GlobalPadding size="sm" />
              <GlobalPadding size="4xl" />
            </View>
          </GlobalLayout.Header>

          <GlobalLayout.Footer>
            {(status === 'bridge_success' || status === 'fail') && (
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

export default withTranslation()(BridgePage);
