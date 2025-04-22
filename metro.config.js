// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Add support for file extensions used by React Native Reanimated
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'mjs',
  'cjs',
  'svg'
];

// Exclude .svg from asset extensions to use it as a React component
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');

// Configuration for react-native-svg-transformer
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Add React Native Reanimated module to be treated specially 
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native-reanimated': path.resolve(__dirname, 'node_modules', 'react-native-reanimated'),
  // Add mock for expo-font/build/server
  'expo-font/build/server': path.resolve(__dirname, 'src/utils/server.js'),
};

// Configuration specific for web
if (process.env.EXPO_PLATFORM === 'web') {
  // Disable minification for web to help resolve ESM/CommonJS issues
  config.transformer.minifierConfig = {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  };
  
  // Resolver main fields order for web
  config.resolver.resolverMainFields = ['browser', 'main', 'module'];
}

// Optimize memory usage for bundler
config.maxWorkers = 2;
config.transformer.workerThreads = false;
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

module.exports = config; 