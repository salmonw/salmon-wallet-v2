import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

import { AppContext } from '../../AppProvider';
import theme from '../../component-library/Global/theme';
import GlobalText from '../../component-library/Global/GlobalText';
import GlobalButton from '../../component-library/Global/GlobalButton';
import GlobalInput from '../../component-library/Global/GlobalInput';
import GlobalPadding from '../../component-library/Global/GlobalPadding';
import GlobalImage from '../../component-library/Global/GlobalImage';
import GlobalToast from '../../component-library/Global/GlobalToast';
import SimpleDialog from '../../component-library/Dialog/SimpleDialog';
import GlobalBackgroundImage from '../../component-library/Global/GlobalBackgroundImage';
import AvatarImage from '../../component-library/Image/AvatarImage';
import { withTranslation } from '../../hooks/useTranslations';
import Logo from '../Onboarding/components/Logo';
import useAnalyticsEventTracker from '../../hooks/useAnalyticsEventTracker';
import { SECTIONS_MAP, EVENTS_MAP } from '../../utils/tracking';
import { getShortAddress } from '../../utils/wallet';
import { getMediaRemoteUrl } from '../../utils/media';
import clipboard from '../../utils/clipboard.native';

import IconCopy from '../../assets/images/IconCopy.png';
import IconSettings from '../../assets/images/IconSettings.png';
import WhitelistBackground from '../../assets/images/WhitelistBackground.png';
import IconWhitelist from '../../assets/images/IconWhitelist.png';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 63; // Altura real del Header segun Figma
const ANIMATION_DURATION = 400;

const LockSheet = ({ t, navigation }) => {
  const [
    { locked, activeAccount, activeBlockchainAccount, whitelisted },
    { unlockAccounts, logout },
  ] = useContext(AppContext);
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const wasLockedRef = useRef(locked);

  const { trackEvent } = useAnalyticsEventTracker(SECTIONS_MAP.UNLOCK_WALLET);

  // Header data
  const accountName = activeAccount?.name || 'Account 1';
  const accountAddress = activeBlockchainAccount?.getReceiveAddress?.() || '';
  const shortAddress = getShortAddress(accountAddress);
  const avatarSrc = activeAccount?.avatar
    ? getMediaRemoteUrl(activeAccount.avatar)
    : null;

  const onCopyAddress = () => {
    if (accountAddress) {
      clipboard.copy(accountAddress);
      setShowToast(true);
    }
  };

  const onClickAvatar = () => {
    // Navegacion a seleccion de cuenta cuando este disponible
    if (navigation) {
      navigation.navigate('SETTINGS_ACCOUNT_SELECT');
    }
  };

  const onClickSettings = () => {
    // Navegacion a settings cuando este disponible
    if (navigation) {
      navigation.navigate('SETTINGS_OPTIONS');
    }
  };

  // Reset form cuando se desbloquea
  useEffect(() => {
    if (wasLockedRef.current && !locked) {
      // Se acaba de desbloquear - resetear formulario
      const timer = setTimeout(() => {
        setPass('');
        setError(false);
        setUnlocking(false);
      }, ANIMATION_DURATION);

      return () => clearTimeout(timer);
    }
    wasLockedRef.current = locked;
  }, [locked]);

  const onChange = v => {
    setError(false);
    setPass(v);
  };

  const unlock = async () => {
    setError(false);
    setUnlocking(true);
    const result = await unlockAccounts(pass);
    if (!result) {
      setError(true);
      setUnlocking(false);
    }
    // Si result es true, unlockAccounts ya llamo setLocked(false)
    // y la sheet se animara automaticamente via el estilo
  };

  const handleLogout = () => {
    logout();
    trackEvent(EVENTS_MAP.PASSWORD_FORGOT);
  };

  // Estilo de la sheet con CSS transition para web
  // La sheet tiene altura SCREEN_HEIGHT + HEADER_HEIGHT
  // Estructura: Content (SCREEN_HEIGHT) + Header (HEADER_HEIGHT)
  // Posicion inicial: top = 0
  // Cuando locked=true: translateY = 0 (Content visible de Y=0 a Y=SCREEN_HEIGHT, Header oculto debajo)
  // Cuando locked=false: translateY = -SCREEN_HEIGHT (Sheet sube, Header queda en Y=0 visible)
  const sheetStyle = [
    styles.sheet,
    {
      transform: [{ translateY: locked ? 0 : -SCREEN_HEIGHT }],
      // Para web, usar transición CSS
      ...(Platform.OS === 'web' && {
        transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      }),
    },
  ];

  // La sheet siempre esta visible, solo cambia su posicion
  // No necesitamos verificar isVisible

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Overlay oscuro - solo visible cuando esta bloqueado */}
      {locked && <View style={styles.overlay} />}

      {/* LockSheet animada */}
      <View style={sheetStyle}>
        <GlobalBackgroundImage style={styles.backgroundImage}>
          {/* Contenido del login - ocupa exactamente SCREEN_HEIGHT, PRIMERO */}
          <View
            style={[
              styles.content,
              {
                opacity: locked ? 1 : 0,
                pointerEvents: locked ? 'auto' : 'none',
              },
            ]}>
            {/* Header spacer */}
            <GlobalPadding size="4xl" />

            {/* Contenido principal */}
            <View style={styles.innerContent}>
              <Logo />
              <GlobalPadding size="2xl" />
              <GlobalText type="headline2" center style={styles.title}>
                {t('lock.title')}
              </GlobalText>

              <GlobalPadding size="md" />

              <GlobalInput
                placeholder={t('lock.placeholder')}
                value={pass}
                setValue={onChange}
                secureTextEntry
                autocomplete={false}
                invalid={error}
                autoFocus={true}
                onEnter={unlock}
              />
              {error && (
                <GlobalText type="body1" color="negative">
                  {t('lock.error')}
                </GlobalText>
              )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <GlobalButton
                type="primary"
                wide
                title={unlocking ? t('lock.buttonChecking') : t('lock.buttonUnlock')}
                onPress={unlock}
                disabled={!pass || unlocking}
                style={styles.unlockButton}
              />

              <GlobalPadding size="lg" />
              <GlobalButton
                type="text"
                textStyle={styles.forgotButtonText}
                size="medium"
                title={t('lock.forgot')}
                onPress={() => setShowDialog(true)}
              />
              <SimpleDialog
                title={
                  <GlobalText center type="headline3" numberOfLines={1}>
                    {t('lock.forgotten')}
                  </GlobalText>
                }
                type="danger"
                btn1Title={t('lock.clear_confirm')}
                btn2Title={t('actions.cancel')}
                onClose={() => setShowDialog(false)}
                isOpen={showDialog}
                action={handleLogout}
                text={
                  <GlobalText
                    center
                    onPress={handleLogout}
                    type="subtitle1"
                    numberOfLines={12}>
                    {t('lock.forgot_content')}
                  </GlobalText>
                }
              />
            </View>
          </View>

          {/* Header persistente - DESPUES del contenido, inicialmente oculto debajo del borde */}
          <View style={styles.headerSection}>
            <View style={styles.headerContent}>
              {/* Lado izquierdo: Avatar + Account name */}
              <View style={styles.headerLeft}>
                <TouchableOpacity
                  onPress={onClickAvatar}
                  style={styles.avatarContainer}>
                  {whitelisted && (
                    <GlobalImage
                      source={WhitelistBackground}
                      size="md"
                      style={styles.avatarWhitelistBorder}
                    />
                  )}
                  {avatarSrc ? (
                    <AvatarImage src={avatarSrc} size={42} />
                  ) : (
                    <View style={styles.avatarPlaceholder} />
                  )}
                  {whitelisted && (
                    <>
                      <GlobalImage
                        source={IconWhitelist}
                        size="xxs"
                        style={styles.whitelistBadgeIcon}
                      />
                      <GlobalText style={styles.whitelistBadgeText}>
                        WL
                      </GlobalText>
                    </>
                  )}
                </TouchableOpacity>

                {/* Account Name + Address + Copy button */}
                <View style={styles.accountNameContainer}>
                  <GlobalText
                    type="body2"
                    style={styles.accountName}
                    numberOfLines={1}>
                    {accountName}
                  </GlobalText>
                  <View style={styles.addressRow}>
                    <GlobalText
                      type="caption"
                      color="tertiary"
                      style={styles.accountAddress}
                      numberOfLines={1}>
                      {shortAddress ? `(${shortAddress})` : ''}
                    </GlobalText>
                    {accountAddress && (
                      <TouchableOpacity
                        onPress={onCopyAddress}
                        style={styles.copyButton}>
                        <GlobalImage source={IconCopy} size="xxs" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Lado derecho: Settings */}
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={onClickSettings}>
                <GlobalImage source={IconSettings} size="sm" />
              </TouchableOpacity>
            </View>
            <GlobalToast
              message={t('wallet.copied')}
              open={showToast}
              setOpen={setShowToast}
            />
          </View>
        </GlobalBackgroundImage>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    alignItems: 'center',
    pointerEvents: 'box-none', // Permite clicks en el contenido debajo cuando esta colapsada
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }),
  },
  sheet: {
    position: 'absolute',
    top: 0, // Posicion base en la parte superior
    width: '100%',
    maxWidth: theme.variables.mobileWidthLG,
    alignSelf: 'center',
    height: SCREEN_HEIGHT + HEADER_HEIGHT, // Content + Header
    backgroundColor: theme.colors.bgPrimary,
    borderBottomLeftRadius: theme.borderRadius.borderRadiusXL,
    borderBottomRightRadius: theme.borderRadius.borderRadiusXL,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 5.529px 16.587px rgba(0, 0, 0, 1)' }
      : {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 5.529 },
          shadowOpacity: 1,
          shadowRadius: 16.587,
        }),
    elevation: 20,
    overflow: 'hidden',
  },
  backgroundImage: {
    flex: 1,
  },
  content: {
    height: SCREEN_HEIGHT, // Altura fija = pantalla completa
    justifyContent: 'space-between',
    alignSelf: 'center',
    paddingVertical: theme.gutters.paddingNormal,
    paddingBottom: theme.gutters.padding4XL,
    paddingHorizontal: theme.gutters.paddingSM,
    width: '100%',
    maxWidth: theme.variables.mobileWidthLG,
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: theme.gutters.paddingNormal,
    paddingBottom: theme.gutters.padding2XL,
  },
  title: {
    fontSize: 36,
  },
  footer: {
    paddingTop: theme.gutters.paddingLG,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  unlockButton: {
    backgroundColor: theme.colors.gradientStart,
    borderRadius: 21,
  },
  forgotButtonText: {
    fontFamily: theme.fonts.dmSansMedium,
    textTransform: 'none',
  },
  headerSection: {
    height: HEADER_HEIGHT,
    backgroundColor: '#10131C',
    borderBottomLeftRadius: 34.557,
    borderBottomRightRadius: 34.557,
    borderBottomWidth: 1.38,
    borderBottomColor: 'rgba(255, 255, 255, 0.8)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 10px 10px rgba(0, 0, 0, 0.9)' }
      : {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.9,
          shadowRadius: 10,
        }),
    elevation: 10,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.bgLight,
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
  accountNameContainer: {
    marginLeft: theme.gutters.paddingSM,
    flex: 1,
  },
  accountName: {
    fontFamily: theme.fonts.dmSansBold,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountAddress: {
    fontSize: 12,
    lineHeight: 16,
  },
  copyButton: {
    marginLeft: theme.gutters.margin,
    padding: 4,
  },
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default withTranslation()(LockSheet);
