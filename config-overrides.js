/**
 * Webpack configuration overrides for react-app-rewired
 * Fase 1: Code Splitting Básico
 *
 * Este archivo configura webpack para separar el bundle en chunks optimizados:
 * - react-vendors: React, ReactDOM, y librerías relacionadas
 * - solana: SDK de Solana y paquetes relacionados
 * - crypto-vendors: ethers, bitcoinjs-lib, near-api-js
 * - utils: lodash, moment, i18next
 * - mui: Material-UI components
 */

module.exports = function override(config, env) {
  // Solo aplicar en producción
  if (env === 'production') {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // React ecosystem - carga siempre, mejor en chunk separado para caching
          reactVendors: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
            name: 'react-vendors',
            priority: 40,
            reuseExistingChunk: true,
          },

          // Material-UI - usado en toda la app, mejor separado
          mui: {
            test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
            name: 'mui',
            priority: 35,
            reuseExistingChunk: true,
          },

          // Solana SDK - grande y específico para Solana blockchain
          solana: {
            test: /[\\/]node_modules[\\/](@solana|@metaplex-foundation|salmon-wallet-standard)[\\/]/,
            name: 'solana',
            priority: 30,
            reuseExistingChunk: true,
          },

          // Blockchain vendors - ethers, bitcoinjs-lib, near (para lazy load futuro)
          cryptoVendors: {
            test: /[\\/]node_modules[\\/](ethers|bitcoinjs-lib|near-api-js|@near-js|bitcore-lib)[\\/]/,
            name: 'crypto-vendors',
            priority: 25,
            reuseExistingChunk: true,
          },

          // Utilities - lodash, moment, i18next
          utils: {
            test: /[\\/]node_modules[\\/](lodash|moment|i18next|react-i18next|date-fns)[\\/]/,
            name: 'utils',
            priority: 20,
            reuseExistingChunk: true,
          },

          // React Native Web - si se usa en el proyecto
          reactNative: {
            test: /[\\/]node_modules[\\/](react-native|react-native-web|react-native-.*)[\\/]/,
            name: 'react-native',
            priority: 15,
            reuseExistingChunk: true,
          },

          // Default vendor chunk para el resto de node_modules
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },

          // Common code shared between chunks
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
            name: 'common',
          },
        },
      },
    };

    // Mejorar nombres de chunks para debugging
    config.optimization.chunkIds = 'named';

    // Configurar runtime chunk separado
    config.optimization.runtimeChunk = {
      name: 'runtime',
    };
  }

  return config;
};
