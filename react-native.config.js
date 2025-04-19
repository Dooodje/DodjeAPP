module.exports = {
    dependencies: {
      'react-native': {
        platforms: {
          ios: {
            sourceDir: './node_modules/react-native',
            podspecPath: null, // empêche certains modules de s'intégrer automatiquement
          },
        },
      },
    },
    assets: [],
    commands: [],
  };
  