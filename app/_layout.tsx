import React, { useEffect, useState } from 'react';
import { Stack, usePathname } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../src/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { iapService } from '../src/services/iap';
import Reanimated from 'react-native-reanimated';

const AnimatedView = Reanimated.createAnimatedComponent(View);

/**
 * Layout racine de l'application
 * Fournit le Provider Redux et la configuration de navigation principale
 * Inclut un gestionnaire d'erreur global
 */
export default function RootLayout() {
  const [error, setError] = useState<Error | null>(null);
  const [isIAPInitialized, setIsIAPInitialized] = useState(false);

  // Initialiser le service IAP pour les plateformes mobiles (Android/iOS)
  useEffect(() => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      const initializeIAP = async () => {
        try {
          await iapService.initialize();
          setIsIAPInitialized(true);
          console.log('Service IAP initialisé avec succès');
        } catch (error) {
          console.error('Erreur lors de l\'initialisation du service IAP:', error);
          // Ne pas bloquer l'application en cas d'échec d'initialisation IAP
          setIsIAPInitialized(true);
        }
      };

      initializeIAP();
    } else {
      // Sur le web, marquer comme initialisé pour ne pas bloquer
      setIsIAPInitialized(true);
    }
  }, []);

  useEffect(() => {
    // Intercepter les erreurs globales non capturées
    const errorHandler = (error: any) => {
      console.error('Erreur globale interceptée:', error);
      
      // Ne capturer que les erreurs spécifiques que nous cherchons à résoudre
      if (error && error.message && error.message.includes('indexOf')) {
        setError(error instanceof Error ? error : new Error(error.message || 'Erreur d\'accès à indexOf sur un objet undefined'));
        return true;
      }
      return false;
    };

    // Attacher les gestionnaires d'erreur
    if (typeof window !== 'undefined') {
      // @ts-ignore - Ignorer l'erreur TypeScript car nous adaptons le comportement pour RN
      window.addEventListener('error', errorHandler);
    }

    // Attacher un gestionnaire d'erreurs globales pour React Native
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Vérifier si l'erreur concerne 'indexOf' sur un objet undefined
      const errorString = args.join(' ');
      if (errorString.includes('indexOf') && errorString.includes('undefined')) {
        setError(new Error('Erreur d\'accès à indexOf sur un objet undefined'));
      }
      originalConsoleError(...args);
    };

    return () => {
      // Nettoyer les gestionnaires
      if (typeof window !== 'undefined') {
        // @ts-ignore
        window.removeEventListener('error', errorHandler);
      }
      console.error = originalConsoleError;
    };
  }, []);

  const handleReset = () => {
    setError(null);
    // Recharger la page si possible
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#FF3B30" />
        <Text style={styles.errorTitle}>Oups, quelque chose s'est mal passé</Text>
        <Text style={styles.errorMessage}>
          {error.message || 'Une erreur inattendue s\'est produite'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleReset}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Afficher un indicateur de chargement pendant l'initialisation du service IAP
  if (!isIAPInitialized && (Platform.OS === 'android' || Platform.OS === 'ios')) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06D001" />
        <Text style={styles.loadingText}>Initialisation des services de paiement...</Text>
      </View>
    );
  }

  // Composant de chargement pour PersistGate
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#06D001" />
      <Text style={styles.loadingText}>Chargement de vos données...</Text>
    </View>
  );

  return (
    <AnimatedView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={renderLoading()} persistor={persistor}>
          <SafeAreaProvider>
            <StatusBar style="light" />
            <RootLayoutNav />
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </AnimatedView>
  );
}

/**
 * Composant de navigation séparé qui utilise les hooks Redux en toute sécurité
 * Définit les routes principales et leur configuration
 */
function RootLayoutNav() {
  const pathname = usePathname();
  
  // Si le chemin commence par /course ou /video, ne pas afficher le header du Stack parent
  const isNoHeaderRoute = pathname.startsWith('/course') || pathname.startsWith('/video');
  
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: !isNoHeaderRoute, // Masquer le header pour les routes 'course' et 'video'
        headerStyle: {
          backgroundColor: '#0A0400',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontFamily: 'Arboria-Bold',
        },
      }}
    >
      <Stack.Screen
        name="video"
        options={{
          headerShown: false, // Toujours masquer le header pour ces routes
          statusBarHidden: true,
        }}
      />
      <Stack.Screen
        name="course"
        options={{
          headerShown: false, // Toujours masquer le header pour ces routes
        }}
      />
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(dodjeone)"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="(settings)"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0400',
    padding: 20,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'Arboria-Bold',
  },
  errorMessage: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Arboria-Book',
  },
  retryButton: {
    backgroundColor: '#059212',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Arboria-Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0400',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 20,
    fontFamily: 'Arboria-Book',
  },
});
