import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { useNavigation } from '../../routes/hooks';
import { withTranslation } from '../../hooks/useTranslations';
import { ROUTES_MAP } from './routes';

import GlobalLayout from '../../component-library/Global/GlobalLayout';
import GlobalBackTitle from '../../component-library/Global/GlobalBackTitle';
import GlobalImage from '../../component-library/Global/GlobalImage';
import GlobalPadding from '../../component-library/Global/GlobalPadding';
import GlobalButton from '../../component-library/Global/GlobalButton';

import AppIcon from '../../assets/images/AppIcon.png';
import AppTitle from '../../assets/images/AppTitle.png';
import { AppContext } from '../../AppProvider';
import storage from '../../utils/storage';
import STORAGE_KEYS from '../../utils/storageKeys';

const styles = StyleSheet.create({
  appIconImage: {
    marginBottom: 30,
    width: 88,
    height: 88,
  },
  appTitleImage: {
    width: 124,
    height: 26,
  },
  appLogo: {
    width: 88,
    height: 88,
    margin: 'auto',
  },
});

const SelectAction = ({
  onNext,
  onBack,
  onboarded,
  hasStoredWallets,
  onUnlock,
  t,
}) => {
  return (
    <>
      <GlobalLayout.Header>
        <GlobalBackTitle
          onBack={onBack}
          secondaryTitle={
            onboarded
              ? t('wallet.onboarding.titleOnboarded')
              : t('wallet.onboarding.titleWelcome')
          }
        />
      </GlobalLayout.Header>

      <GlobalLayout.Inner>
        <GlobalImage source={AppIcon} style={styles.appIconImage} />
        <GlobalImage source={AppTitle} style={styles.appTitleImage} />
      </GlobalLayout.Inner>

      <GlobalLayout.Footer>
        <GlobalButton
          type="primary"
          wide
          title={t('wallet.create_wallet')}
          onPress={() => onNext(ROUTES_MAP.ONBOARDING_CREATE)}
          // disabled={!chainCode}
        />

        <GlobalPadding size="md" />

        <GlobalButton
          type="secondary"
          wide
          title={t('wallet.recover_wallet')}
          onPress={() => onNext(ROUTES_MAP.ONBOARDING_RECOVER)}
          // disabled={!chainCode}
        />

        {hasStoredWallets && (
          <>
            <GlobalPadding size="md" />

            <GlobalButton
              type="secondary"
              wide
              title={t('wallet.access_existing_account')}
              onPress={onUnlock}
            />
          </>
        )}
      </GlobalLayout.Footer>
    </>
  );
};

const SelectOptionsPage = ({ t }) => {
  const navigate = useNavigation();
  const [{ accounts }, { lockAccounts }] = useContext(AppContext);
  const [hasStoredWallets, setHasStoredWallets] = useState(false);

  useEffect(() => {
    const checkStoredWallets = async () => {
      try {
        const storedWallets = await storage.getItem(STORAGE_KEYS.WALLETS);
        const storedAccounts = await storage.getItem(STORAGE_KEYS.ACCOUNTS);
        const storedMnemonics = await storage.getItem(STORAGE_KEYS.MNEMONICS);
        // Verificar si hay wallets almacenadas (cualquiera de estos indica que hay una cuenta)
        if (storedWallets || storedAccounts || storedMnemonics) {
          setHasStoredWallets(true);
        }
      } catch (error) {
        console.warn('Error checking stored wallets:', error);
      }
    };

    checkStoredWallets();
  }, []);

  const onSelectAction = action => {
    navigate(action);
  };

  // PRIMEROS AJUSTES - Roadmap: Eliminar páginas de bienvenida
  // Fecha: 2025-10-31
  const onHomeBack = () => {
    if (accounts.length) {
      // Usar string directamente para evitar dependencia circular con app-routes
      navigate('WALLET');
    }
    // Eliminado: navigate('WELCOME') - Ya no existe página de bienvenida
    // Si no hay accounts, no navega a ninguna parte (se queda en onboarding)
  };

  const onUnlock = () => {
    lockAccounts();
  };

  return (
    <GlobalLayout fullscreen>
      <SelectAction
        onNext={onSelectAction}
        onBack={accounts.length > 0 ? onHomeBack : null}
        onboarded={accounts.length}
        hasStoredWallets={hasStoredWallets}
        onUnlock={onUnlock}
        t={t}
      />
    </GlobalLayout>
  );
};

export default withTranslation()(SelectOptionsPage);
