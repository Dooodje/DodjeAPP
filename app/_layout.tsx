import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { Stack, usePathname } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../src/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Platform, LogBox } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimationProvider } from '../src/contexts/AnimationContext';
import { PreopeningProvider } from '../src/contexts/PreopeningContext';
import { FirstConnectionProvider } from './contexts/FirstConnectionContext';
import FirstConnectionWrapper from './components/FirstConnectionWrapper';

// Ignorer des avertissements spécifiques pour éviter les erreurs dans la console
LogBox.ignoreLogs([
  'listeners.focus[0] is not a function',
  'Non-serializable values were found in the navigation state',
  'findDOMNode is deprecated in StrictMode',
]);

// Empêcher l'écran de démarrage de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

// Créer un client TanStack Query pour toute l'application
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60, // 1 heure (renommé de cacheTime à gcTime dans v4+)
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

/**
 * Layout racine de l'application
 * Fournit le Provider Redux et la configuration de navigation principale
 * Inclut un gestionnaire d'erreur global
 */
export default function RootLayout() {
  const [error, setError] = useState<Error | null>(null);

  const [loaded, errorFonts] = useFonts({
    'Arboria-Book': require('../assets/fonts/OnlineWebFonts_COM_ddd7c8d2d4a68d143440be787b1761ca/Arboria-Book/Arboria-Book.ttf'),
    'Arboria-Bold': require('../assets/fonts/OnlineWebFonts_COM_aa1ba8e2a1a8a89fbf375966553eb206/Arboria-Bold/Arboria-Bold.ttf'),
    'Arboria-Light': require('../assets/fonts/OnlineWebFonts_COM_6de75bde8a1de0c1fc321885e448e0c4/Arboria-Light/Arboria-Light.ttf'),
    'Arboria-Black': require('../assets/fonts/OnlineWebFonts_COM_2c27c8acf8fbff113e0dec45f5532c90/Arboria-Black/Arboria-Black.ttf'),
    'Arboria-Medium': require('../assets/fonts/OnlineWebFonts_COM_cf7f3e8a3232cb14e58c65c0cc79bedb/Arboria-Medium/Arboria-Medium.ttf'),
    'Arboria-Thin': require('../assets/fonts/OnlineWebFonts_COM_ae5c57a0ffedf1ded9de720e7718c33b/Arboria-Thin/Arboria-Thin.ttf'),
    'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Masquer l'écran de démarrage après le chargement des polices
  useEffect(() => {
    if (loaded || errorFonts) {
      SplashScreen.hideAsync();
    }
  }, [loaded, errorFonts]);

  // Intercepter les erreurs globales
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
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // @ts-ignore - Ignorer l'erreur TypeScript car nous adaptons le comportement pour RN
      window.addEventListener('error', errorHandler);
    }

    // Remplacer la console d'origine pour intercepter les erreurs
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Ignorer les avertissements sur findDOMNode qui est obsolète
      const errorMessage = args.join(' ');
      
      // Liste des erreurs à ignorer
      const ignoredErrors = [
        'findDOMNode', 
        'deprecated',
        'listeners.focus[0] is not a function',
        'Non-serializable values were found in the navigation state',
        'window.addEventListener is not a function'
      ];
      
      // Vérifier si l'erreur fait partie des erreurs à ignorer
      if (ignoredErrors.some(error => errorMessage.includes(error))) {
        // Ne pas afficher ces erreurs
        return;
      }
      
      // Détecter et gérer spécifiquement les erreurs IndexOf
      if (errorMessage.includes('indexOf') && errorMessage.includes('undefined')) {
        setError(new Error('Erreur d\'accès à indexOf sur un objet undefined'));
      }
      
      // Appeler la console d'origine pour les autres erreurs
      originalConsoleError(...args);
    };

    return () => {
      // Nettoyer les gestionnaires
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // @ts-ignore
        window.removeEventListener('error', errorHandler);
      }
      console.error = originalConsoleError;
    };
  }, []);

  const handleReset = () => {
    setError(null);
    // Recharger la page si possible
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  if (!loaded && !errorFonts) {
    return null;
  }

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

  // Composant de chargement pour PersistGate
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#06D001" />
      <Text style={styles.loadingText}>Chargement de vos données...</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={renderLoading()} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <PreopeningProvider>
              <AnimationProvider>
                <FirstConnectionProvider>
                  <SafeAreaProvider>
                    <FirstConnectionWrapper>
                      <RootLayoutNav />
                    </FirstConnectionWrapper>
                  </SafeAreaProvider>
                </FirstConnectionProvider>
              </AnimationProvider>
            </PreopeningProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </View>
  );
}

/**
 * Composant de navigation séparé qui utilise les hooks Redux en toute sécurité
 * Définit les routes principales et leur configuration
 */
function RootLayoutNav() {
  const pathname = usePathname();
  
  // Si le chemin commence par /course, /video ou /quiz, ne pas afficher le header du Stack parent
  const isNoHeaderRoute = pathname.startsWith('/course') || pathname.startsWith('/video') || pathname.startsWith('/quiz');
  
  // Désactiver les erreurs liées à la navigation
  useEffect(() => {
    // Patch pour éviter l'erreur "listeners.focus[0] is not a function"
    const patchNavigation = () => {
      // Utiliser any pour le global.navigation qui n'est pas typé par défaut
      // @ts-ignore - Ignorer l'erreur TypeScript car nous accédons à des propriétés internes de navigation
      if (typeof global !== 'undefined' && global.navigation) {
        // @ts-ignore - Ignorer l'erreur car nous modifions directement une API interne
        const original = global.navigation.addListener;
        // @ts-ignore - Ignorer les erreurs de type car nous patrons une API interne
        global.navigation.addListener = function(event: string, callback: Function) {
          // @ts-ignore - Ignorer l'erreur car nous accédons à des propriétés privées
          if (event === 'focus' && Array.isArray(this.listeners.focus)) {
            // S'assurer que les listeners sont toujours des fonctions
            // @ts-ignore - Ignorer l'erreur car nous filtrons des écouteurs internes
            this.listeners.focus = this.listeners.focus.filter((listener: any) => typeof listener === 'function');
          }
          return original.call(this, event, callback);
        };
      }
    };
    
    patchNavigation();
  }, []);
  
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: !isNoHeaderRoute, // Masquer le header pour les routes 'course', 'video' et 'quiz'
        headerStyle: {
          backgroundColor: '#0A0400',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontFamily: 'Arboria-Bold',
        },
        // Configuration pour une transition "gentle"
        animation: 'fade',
        animationDuration: 400, // Durée plus longue pour une transition plus douce
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen
        name="video"
        options={{
          headerShown: false, // Toujours masquer le header pour ces routes
        }}
      />
      <Stack.Screen
        name="course"
        options={{
          headerShown: false, // Toujours masquer le header pour ces routes
        }}
      />
      <Stack.Screen
        name="quiz"
        options={{
          headerShown: false, // Ajouter la route quiz avec headerShown: false
        }}
      />
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="opening"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="preopening"
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
        name="dodjeone"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(dodjeone)"
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'fade',
          animationDuration: 350,
        }}
      />
      <Stack.Screen
        name="(dodjelab)"
        options={{
          headerShown: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'fade',
          animationDuration: 350,
        }}
      />
      <Stack.Screen
        name="(settings)"
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'fade',
          animationDuration: 350,
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
