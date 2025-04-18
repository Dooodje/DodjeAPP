// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Ajout des extensions .mjs pour le support web
config.resolver.sourceExts.push('mjs');

// Configuration pour react-native-svg-transformer
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Filtrer les extensions d'assets pour exclure .svg (sera traité comme un composant)
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');

// Ajouter svg aux extensions de source pour qu'il soit traité comme un composant
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg', 'cjs', 'mjs'];

// Ajouter les modules React Native Reanimated comme modules à traiter spécialement
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native-reanimated': path.resolve(__dirname, 'node_modules', 'react-native-reanimated'),
};

// Désactiver le minify pour le web peut aider à résoudre certains problèmes
if (process.env.EXPO_PLATFORM === 'web') {
  config.transformer.minifierConfig = {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  };
}

// Augmenter la limite de mémoire pour le bundler
config.maxWorkers = 2;
config.transformer.workerThreads = false;
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

module.exports = config; 