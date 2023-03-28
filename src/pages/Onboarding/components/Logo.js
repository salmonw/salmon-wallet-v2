import React from 'react';
import { StyleSheet, View } from 'react-native';
import GlobalImage from '../../../component-library/Global/GlobalImage';
import AppIcon from '../../../assets/images/AppIcon.png';

const styles = StyleSheet.create({
  appLogo: {
    width: 102,
    height: 102,
    margin: 'auto',
  },
  appLogoSm: {
    width: 48,
    height: 48,
    margin: 'auto',
  },
  center: {
    flex: 1,
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
});

const Logo = ({ size, center }) => {
  const logoStyle = size === 'sm' ? styles.appLogoSm : styles.appLogo;
  return (
    <View style={center && styles.center}>
      <GlobalImage source={AppIcon} style={logoStyle} />
    </View>
  );
};

export default Logo;
