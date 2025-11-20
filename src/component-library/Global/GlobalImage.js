import React from 'react';
import { StyleSheet, View, Image } from 'react-native';

import ImageMaskLGCards from '../../assets/images/ImageMaskLGCards.png';
import ImageMaskLGAccentPrimary from '../../assets/images/ImageMaskLGAccentPrimary.png';
import ImageMaskXLCards from '../../assets/images/ImageMaskXLCards.png';
import ImageMaskXXLCards from '../../assets/images/ImageMaskXXLCards.png';

const styles = StyleSheet.create({
  sizeXXXS: {
    width: 14,
    height: 14,
  },
  sizeXXS: {
    width: 16,
    height: 16,
  },
  sizeXS: {
    width: 24,
    height: 24,
  },
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
  size3XL: {
    width: 120,
    height: 120,
  },
  size4XL: {
    width: 196,
    height: 196,
  },
  size5XL: {
    width: 234,
    height: 234,
  },
  block: {
    width: '100%',
    height: '100%',
  },
  square: {
    width: '100%',
    aspectRatio: 1,
  },
  circle: {
    borderRadius: 250,
  },
  squircle: {
    borderRadius: 20,
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

// Known problematic URL patterns that shouldn't trigger console warnings
const KNOWN_PROBLEMATIC_PATTERNS = [
  'cf-ipfs.com',
  'cloudflare-ipfs.com',
  'ipfs.nftstorage.link',
  'shdw-drive.genesysgo.net',
  'chexbacca.com',
  'cdn.bridgesplit.com',
  'ipfs.dweb.link',
  'gateway.pinata.cloud',
  'ipfs.infura.io',
];

/**
 * Check if URL is a known problematic domain
 * @param {string} url - The image URL
 * @returns {boolean} True if URL matches known problematic pattern
 */
const isKnownProblematicUrl = (url) => {
  if (!url) return false;
  return KNOWN_PROBLEMATIC_PATTERNS.some(pattern => url.includes(pattern));
};

const GlobalImage = ({
  name,
  source,
  url,
  size,
  mask,
  maskColor,
  square,
  circle,
  squircle,
  resizeMode,
  style,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);

  const imageStyles = {
    ...(size === 'xxxs' && styles.sizeXXXS),
    ...(size === 'xxs' && styles.sizeXXS),
    ...(size === 'xs' && styles.sizeXS),
    ...(size === 'sm' && styles.sizeSM),
    ...(size === 'normal' && styles.sizeNormal),
    ...(size === 'md' && styles.sizeMD),
    ...(size === 'xl' && styles.sizeXL),
    ...(size === 'xxl' && styles.sizeXXL),
    ...(size === '3xl' && styles.size3XL),
    ...(size === '4xl' && styles.size4XL),
    ...(size === '5xl' && styles.size5XL),
    ...(size === 'block' && styles.block),
    ...(circle && styles.circle),
    ...(squircle && styles.squircle),
    ...(square && styles.square),
  };

  // Reset error state when URL changes
  React.useEffect(() => {
    setImageError(false);
  }, [url]);

  return (
    <>
      <Image
        // source={name ? getImage(name) : source}
        source={url && !imageError ? { uri: url } : source}
        resizeMode={resizeMode || 'contain'}
        style={[imageStyles, style]}
        onError={() => {
          if (url) {
            // Only log warnings for unexpected failures (not known problematic URLs)
            if (!isKnownProblematicUrl(url)) {
              console.warn(`Failed to load image: ${url}`);
            }
            setImageError(true);
          }
        }}
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
