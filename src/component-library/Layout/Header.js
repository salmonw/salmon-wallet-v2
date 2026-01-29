import React, { useContext, useEffect, useState } from 'react';
import theme from '../../component-library/Global/theme';
import { StyleSheet, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { getNetworks, getSwitches } from '../../adapter';
import { AppContext } from '../../AppProvider';
import { useNavigation } from '../../routes/hooks';
import { ROUTES_MAP as ROUTES_WALLET_MAP } from '../../pages/Wallet/routes';
import { ROUTES_MAP as ROUTES_SETTINGS_MAP } from '../../pages/Settings/routes';
import { ROUTES_MAP as TOKEN_ROUTES_MAP } from '../../pages/Token/routes';
import AvatarImage from '../../component-library/Image/AvatarImage';
import { getShortAddress } from '../../utils/wallet';
import GlobalToast from '../../component-library/Global/GlobalToast';
import GlobalButton from '../../component-library/Global/GlobalButton';
import GlobalText from '../../component-library/Global/GlobalText';
import GlobalImage from '../../component-library/Global/GlobalImage';
import IconCopy from '../../assets/images/IconCopy.png';
import IconChangeWallet from '../../assets/images/IconChangeWallet.png';
import IconQRCodeScanner from '../../assets/images/IconQRCodeScanner.png';
import { getMediaRemoteUrl } from '../../utils/media';
import { isExtension, isNative } from '../../utils/platform';
import clipboard from '../../utils/clipboard.native';
import storage from '../../utils/storage';
import { withTranslation } from '../../hooks/useTranslations';
import QRScan from '../../features/QRScan/QRScan';
import Tooltip from '../Tooltip/Tooltip';
import NetworkSelector from '../../pages/Wallet/components/NetworkSelector';
import useUserConfig from '../../hooks/useUserConfig';

import WhitelistBackground from '../../assets/images/WhitelistBackground.png';
import IconWhitelist from '../../assets/images/IconWhitelist.png';

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#10131C',
    borderBottomLeftRadius: 34.557,
    borderBottomRightRadius: 34.557,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1.38,
    borderBottomColor: 'rgba(255, 255, 255, 0.8)',
  },
  avatarWalletAddressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.gutters.paddingNormal,
    marginBottom: theme.gutters.paddingXL,
    marginRight: theme.gutters.paddingXS * -1,
  },
  avatarWalletAddress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWhitelistBorder: {
    position: 'absolute',
    left: -3,
    top: -3,
  },
  whitelistBadgeIcon: {
    position: 'absolute',
    left: 28,
    top: 28,
  },
  whitelistBadgeText: {
    color: 'white',
    position: 'absolute',
    left: 30,
    top: 32,
    fontSize: 7,
    fontWeight: 'bold',
  },
  walletNameAddress: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: theme.gutters.paddingSM,
  },
  walletName: {
    lineHeight: theme.fontSize.fontSizeNormal + 4,
  },
  walletAddressActions: {
    flexDirection: 'row',
  },
  walletAddress: {
    lineHeight: theme.fontSize.fontSizeNormal + 4,
  },
  walletActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  narrowBtn: {
    paddingHorizontal: theme.gutters.paddingSM,
  },
  addressIcon: {
    marginLeft: theme.gutters.margin,
    marginTop: 1,
  },
  appStatus: {
    marginRight: theme.gutters.paddingNormal,
    borderRadius: 50,
    height: 14,
    width: 14,
  },
  appConnectedStatus: {
    backgroundColor: theme.colors.positiveBright,
  },
  appDisconnectedStatus: {
    backgroundColor: theme.colors.negativeBright,
  },
  networkSelector: {
    marginRight: theme.gutters.paddingXS,
    minWidth: 120,
  },
});

const Header = ({ isHome, t }) => {
  const [
    { activeAccount, activeBlockchainAccount, networkId, whitelisted },
    { changeNetwork },
  ] = useContext(AppContext);

  const [showToast, setShowToast] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [isConnected, setIsConnected] = useState(null);
  const [hostname, setHostname] = useState(null);
  const [networks, setNetworks] = useState([]);
  const { developerNetworks, userConfig } = useUserConfig();

  const navigate = useNavigation();

  useEffect(() => {
    const checkConnection = async () => {
      if (isExtension()) {
        // eslint-disable-next-line no-undef
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        try {
          setHostname(new URL(tabs?.[0]?.url).hostname);
        } catch (err) {
          console.log(err);
        }
        const tabsIds = await storage.getItem('connectedTabsIds');
        setIsConnected(tabsIds?.includes(tabs?.[0]?.id));
      }
    };

    checkConnection();
  }, []);

  useEffect(() => {
    // Wait for config to load before filtering networks
    if (!userConfig) return;

    const load = async () => {
      const switches = await getSwitches();
      const allNetworks = await getNetworks();
      // PRIMEROS AJUSTES - Roadmap: Filtrar por Developer Networks toggle
      // Fecha: 2025-10-31
      const filteredNetworks = allNetworks.filter(({ id, environment }) => {
        // Primero verificar si está habilitado en switches
        if (!switches[id]?.enable) return false;
        // Si developerNetworks está OFF, solo mostrar mainnet
        if (!developerNetworks && environment !== 'mainnet') return false;
        return true;
      });
      setNetworks(filteredNetworks);

      // Auto-switch if current network is not in filtered options
      const currentNetworkInOptions = filteredNetworks.some(n => n.id === networkId);
      if (!currentNetworkInOptions && filteredNetworks.length > 0) {
        // Find a network with the same blockchain, preferably mainnet
        const currentNetwork = allNetworks.find(n => n.id === networkId);
        const sameBlockchainNetwork = filteredNetworks.find(
          n => n.blockchain === currentNetwork?.blockchain,
        );
        changeNetwork(sameBlockchainNetwork?.id || filteredNetworks[0].id);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [developerNetworks, networkId, userConfig]);

  const toggleScan = () => {
    setShowScan(!showScan);
  };

  const onRead = qr => {
    const data = qr;
    setShowScan(false);
    navigate(TOKEN_ROUTES_MAP.TOKEN_SELECT_TO, {
      action: 'sendTo',
      toAddress: data.data,
    });
  };

  const onClickAvatar = () => {
    navigate(ROUTES_SETTINGS_MAP.SETTINGS_ACCOUNT_SELECT);
  };

  const onCopyAddress = () => {
    clipboard.copy(activeBlockchainAccount.getReceiveAddress());
    setShowToast(true);
  };

  const onSelectPathIndex = () => {
    navigate(ROUTES_WALLET_MAP.WALLET_INDEX_PATH);
  };

  return (
    <SafeAreaView edges={['top']}>
      <View style={styles.headerContainer}>
        <View style={styles.avatarWalletAddressActions}>
          <View style={styles.avatarWalletAddress}>
            <TouchableOpacity onPress={onClickAvatar}>
              {whitelisted && (
                <GlobalImage
                  source={WhitelistBackground}
                  size="md"
                  style={styles.avatarWhitelistBorder}
                />
              )}
              <AvatarImage
                src={getMediaRemoteUrl(activeAccount.avatar)}
                size={42}
              />
              {whitelisted && (
                <>
                  <GlobalImage
                    source={IconWhitelist}
                    size="xxs"
                    style={styles.whitelistBadgeIcon}
                  />
                  <GlobalText style={styles.whitelistBadgeText}>WL</GlobalText>
                </>
              )}
            </TouchableOpacity>
            <View style={styles.walletNameAddress}>
              <GlobalText
                type="body2"
                style={styles.walletName}
                numberOfLines={1}>
                {activeAccount.name}
              </GlobalText>
              <View style={styles.walletAddressActions}>
                <GlobalText
                  type="caption"
                  color="tertiary"
                  style={styles.walletAddress}
                  numberOfLines={1}>
                  ({getShortAddress(activeBlockchainAccount.getReceiveAddress())})
                </GlobalText>
                <TouchableOpacity onPress={onCopyAddress}>
                  <GlobalImage
                    source={IconCopy}
                    style={styles.addressIcon}
                    size="xxs"
                  />
                </TouchableOpacity>
                {isHome &&
                  activeAccount.networksAccounts[networkId].length > 1 && (
                    <TouchableOpacity onPress={onSelectPathIndex}>
                      <GlobalImage
                        source={IconChangeWallet}
                        style={styles.addressIcon}
                        size="xxs"
                      />
                    </TouchableOpacity>
                  )}
              </View>
            </View>
          </View>

          <View style={styles.walletActions}>
            {networks.length > 1 && (
              <View style={styles.networkSelector}>
                <NetworkSelector
                  networks={networks}
                  setValue={changeNetwork}
                  value={networkId}
                />
              </View>
            )}
            {/* <GlobalButton
                    type="icon"
                    transparent
                    icon={hasNotifications ? IconNotificationsAdd : IconNotifications}
                    style={styles.narrowBtn}
                    onPress={goToNotifications}
                  /> */}
            {isNative() && (
              <GlobalButton
                type="icon"
                transparent
                icon={IconQRCodeScanner}
                style={styles.narrowBtn}
                onPress={toggleScan}
              />
            )}
            {isConnected !== null && (
              <Tooltip
                title={
                  <GlobalText>
                    {t(isConnected ? 'header.connected' : 'header.disconnected', {
                      hostname,
                    })}
                  </GlobalText>
                }>
                <View
                  style={[
                    styles.appStatus,
                    isConnected
                      ? styles.appConnectedStatus
                      : styles.appDisconnectedStatus,
                  ]}
                />
              </Tooltip>
            )}
          </View>
        </View>
        <GlobalToast
          message={t('wallet.copied')}
          open={showToast}
          setOpen={setShowToast}
        />
        {isNative() && (
          <QRScan active={showScan} onClose={toggleScan} onRead={onRead} />
        )}
      </View>
    </SafeAreaView>
  );
};

export default withTranslation()(Header);
