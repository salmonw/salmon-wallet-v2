import React from 'react';
import { StyleSheet, View, Image } from 'react-native';

import ImageMaskLGCards from '../../assets/images/ImageMaskLGCards.png';
import ImageMaskLGAccentPrimary from '../../assets/images/ImageMaskLGAccentPrimary.png';
import ImageMaskXLCards from '../../assets/images/ImageMaskXLCards.png';
import ImageMaskXXLCards from '../../assets/images/ImageMaskXXLCards.png';
import theme from './theme';

const styles = StyleSheet.create({
  sizeSM: {
    width: 32,
    height: 32,
  },
  sizeNormal: {
    width: 40,
    height: 40,
  },
  sizeMD: {
    width: 48,
    height: 48,
  },
  sizeXL: {
    width: 70,
    height: 70,
  },
  sizeXXL: {
    width: 100,
    height: 100,
  },
  block: {
    width: '100%',
    height: '100%',
  },
  circle: {
    borderRadius: 250,
  },
  imageMask: {
    position: 'absolute',
    marginTop: -1,
    marginLeft: -1,
  },
  imageMaskLG: {
    width: 72,
    height: 72,
  },
  imageMaskXL: {
    width: 196,
    height: 196,
  },
  imageMaskXXL: {
    width: 264,
    height: 264,
  },
});

const GlobalImage = ({
  name,
  source,
  size,
  mask,
  maskColor,
  circle,
  resizeMode,
  style,
  ...props
}) => {
  const imageStyles = {
    ...(size === 'sm' ? styles.sizeSM : {}),
    ...(size === 'md' ? styles.sizeMD : {}),
    ...(size === 'xl' ? styles.sizeXL : {}),
    ...(size === 'xxl' ? styles.sizeXXL : {}),
    ...(size === 'block' ? styles.block : {}),
    ...(circle && styles.circle),
  };

  return (
    <>
      <Image
        // source={name ? getImage(name) : source}
        source={source}
        resizeMode={resizeMode || 'contain'}
        style={[styles.sizeNormal, imageStyles, style]}
        {...props}
      />

      {mask && (
        <View style={styles.imageMask}>
          {mask === 'lg' && (
            <>
              {maskColor !== 'accentPrimary' && (
                <GlobalImage
                  source={ImageMaskLGCards}
                  style={styles.imageMaskLG}
                />
              )}
              {maskColor === 'accentPrimary' && (
                <GlobalImage
                  source={ImageMaskLGAccentPrimary}
                  style={styles.imageMaskLG}
                />
              )}
            </>
          )}

          {mask === 'xl' && (
            <GlobalImage source={ImageMaskXLCards} style={styles.imageMaskXL} />
          )}

          {mask === 'xxl' && (
            <GlobalImage
              source={ImageMaskXXLCards}
              style={styles.imageMaskXXL}
            />
          )}
        </View>
      )}
    </>
  );
};

export default GlobalImage;