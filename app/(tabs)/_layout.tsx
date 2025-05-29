import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { IlotMenu } from '../../src/components/IlotMenu';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LoadingProvider } from '../../src/contexts/LoadingContext';
import { GlobalLoadingOverlay } from '../../src/components/ui/GlobalLoadingOverlay';

const { width } = Dimensions.get('window');

// Routes de l'application
type AppRoute = '/' | '/profile' | '/dodjeplus' | '/boutique' | '/catalogue';

/**
 * Layout pour la section des onglets principaux de l'application
 * Ce composant définit la barre de navigation en forme d'îlot
 */
export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // Redirection vers la page d'authentification si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (isLoading) return;

    // Si l'utilisateur n'est pas authentifié, on le redirige vers la page de connexion
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fonction pour naviguer vers les différents onglets
  const navigateTo = (route: AppRoute) => {
    router.push(route);
  };
  
  // Nous utilisons un custom tab bar
  const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const pathname = usePathname(); // Obtenir la route actuelle
    
    return (
      <View style={styles.tabBarContainer}>
        <IlotMenu style={styles.ilotMenu} activeRoute={pathname} />
        {/* Zones tactiles pour la navigation */}
        <View style={styles.touchableContainer}>
          <TouchableOpacity 
            style={styles.touchableItem} 
            onPress={() => navigateTo('/profile')}
          />
          <TouchableOpacity 
            style={styles.touchableItem} 
            onPress={() => navigateTo('/dodjeplus')}
          />
          <TouchableOpacity 
            style={styles.touchableItem} 
            onPress={() => navigateTo('/')}
          />
          <TouchableOpacity 
            style={styles.touchableItem} 
            onPress={() => navigateTo('/boutique')}
          />
          <TouchableOpacity 
            style={styles.touchableItem} 
            onPress={() => navigateTo('/catalogue')}
          />
        </View>
      </View>
    );
  };

  return (
    <LoadingProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { 
            display: 'none', // Masquer complètement la barre d'onglets native
          },
        }}
        tabBar={props => <CustomTabBar {...props} />}
      >
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="dodjeplus" />
        <Tabs.Screen name="index" />
        <Tabs.Screen name="boutique" />
        <Tabs.Screen name="catalogue" />
      </Tabs>
      <GlobalLoadingOverlay />
    </LoadingProvider>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 100,
  },
  ilotMenu: {
    width: width - 40, // Ajuster la largeur en fonction de l'écran
  },
  touchableContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  touchableItem: {
    flex: 1,
    height: '100%',
  },
});
