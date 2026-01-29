import React from 'react';
import { StyleSheet, View } from 'react-native';

import GlobalBackgroundImage from '../../component-library/Global/GlobalBackgroundImage';
import { useCurrentTab } from '../../routes/hooks';
import GlobalButton from './GlobalButton';
import theme from './theme';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollViewHorizontal: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Contenedor del footer con gradiente de negro a transparente (de abajo hacia arriba)
  // Permite que los tokens se vean "desvaneciendo" detras del footer
  // Usa backgroundImage para React Native Web (no expo-linear-gradient)
  bottomNavContainer: {
    backgroundImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 8,
    paddingTop: 60, // Más espacio para que el gradiente sea visible
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  // Contenedor de botones - medidas exactas de Figma  (node 1390:743)
  // "hug" = se ajusta al contenido, NO tiene width fijo
  tabsContainer: {
    alignSelf: 'center', // Centrarse en el padre sin ocupar 100% del ancho
    paddingTop: 12, // Figma: py-[12px] en los hijos, aplicado al contenedor
    paddingHorizontal: 80, // Figma: px-[80px]
    borderRadius: 82.394,
    borderWidth: 1.15,
    borderColor: '#404962',
    backgroundColor: '#10131C',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4.602 },
    shadowOpacity: 0.4,
    shadowRadius: 13.805,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden', // Figma: overflow-clip
  },
  // Cada boton/tab (node 1390:744)
  tabButton: {
    paddingHorizontal: 19.251, // Figma: px-[19.251px]
    paddingVertical: 12, // Figma: py-[12px]
    gap: 4, // Figma: gap-[4px]
    borderRadius: 1125.754, // Figma: rounded-[1125.754px]
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Texto activo (seleccionado) - con gradiente CSS para web
  // Figma: linear-gradient(93.3685deg, rgb(255, 92, 69) 12.275%, rgba(161, 42, 42, 0.9) 83.06%)
  activeTabText: {
    fontSize: 12, // Figma: text-[12px]
    fontFamily: theme.fonts.dmSansBold, // DM Sans Bold (closest to SemiBold available)
    fontWeight: '600', // Figma: font-semibold
    letterSpacing: 0.24, // Figma: tracking-[0.24px]
    lineHeight: 16.8, // Figma: leading-[1.4] = 12 * 1.4
    textAlign: 'center', // Figma: text-center
    textTransform: 'none', // NO mayusculas - sobreescribe GlobalText button
    // Gradiente de texto para web - Figma: ORANGE_GRADIENT
    background:
      'linear-gradient(93.3685deg, rgb(255, 92, 69) 12.275%, rgba(161, 42, 42, 0.9) 83.06%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    // Fallback color para React Native (no soporta gradiente de texto)
    color: '#FF5C45',
  },
  // Texto inactivo (no seleccionado)
  // Figma: blanco puro
  inactiveTabText: {
    fontSize: 12, // Figma: text-[12px]
    fontFamily: theme.fonts.dmSansBold, // DM Sans Bold (closest to SemiBold available)
    fontWeight: '600', // Figma: font-semibold
    letterSpacing: 0.24, // Figma: tracking-[0.24px]
    lineHeight: 16.8, // Figma: leading-[1.4] = 12 * 1.4
    textAlign: 'center', // Figma: text-center
    textTransform: 'none', // NO mayusculas - sobreescribe GlobalText button
    // Figma: blanco puro para texto inactivo
    color: '#FFFFFF',
  },
  // Iconos - tamaños específicos de Figma
  iconHome: {
    width: 28,
    height: 30,
  },
  iconCollectibles: {
    width: 30,
    height: 30,
  },
  iconSwap: {
    width: 30.285, // Figma: w-[30.285px]
    height: 24, // Figma: h-[24px]
    transform: [{ rotate: '-90deg' }], // Figma: -rotate-90
  },
  // Estilo genérico por defecto para iconos
  iconStyle: {
    width: 28,
    height: 30,
  },
});

// Función para obtener el estilo de icono según el título del tab
const getIconStyleByTitle = (title) => {
  const titleLower = title.toLowerCase();
  if (titleLower === 'home' || titleLower === 'wallet') {
    return styles.iconHome;
  }
  if (titleLower === 'collectibles' || titleLower === 'nfts') {
    return styles.iconCollectibles;
  }
  if (titleLower === 'swap') {
    return styles.iconSwap;
  }
  return styles.iconStyle;
};

export const GlobalTabBar = ({ tabs }) => {
  const currentTab = useCurrentTab({ tabs });

  return (
    <View style={styles.tabsContainer}>
      {tabs.map(t => {
        const isActive = currentTab.title === t.title;
        const iconStyle = getIconStyleByTitle(t.title);
        return (
          <GlobalButton
            key={`btn-${t.title}`}
            type="tabbar"
            size="medium"
            iconStyle={iconStyle}
            style={styles.tabButton}
            color={!isActive ? 'tertiary' : ''}
            transparent
            title={isActive ? t.title : null}
            icon={t.icon}
            textStyle={styles.activeTabText}
            onPress={() => {
              t.onClick();
            }}
          />
        );
      })}
    </View>
  );
};

const GlobalTabBarLayout = ({ children, tabs }) => (
  <GlobalBackgroundImage>
    <View style={styles.wrapper}>{children}</View>
    <View style={styles.bottomNavContainer}>
      <GlobalTabBar tabs={tabs} />
    </View>
  </GlobalBackgroundImage>
);

export default GlobalTabBarLayout;
