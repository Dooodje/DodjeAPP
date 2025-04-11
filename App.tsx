import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import setupWebPolyfills from './src/utils/web-polyfills';

// Import de l'application Firebase déjà initialisée
import app from './src/config/firebase';

// Importation de l'application Expo Router
import { Slot } from 'expo-router';

export default function App() {
  // Initialiser les polyfills pour le web
  useEffect(() => {
    setupWebPolyfills();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Slot />
      </SafeAreaProvider>
    </Provider>
  );
} 