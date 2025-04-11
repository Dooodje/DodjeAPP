import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GlobalHeader } from '../../src/components/ui/GlobalHeader';

const { width } = Dimensions.get('window');

/**
 * Composant qui crée une barre de navigation en forme d'île ovale
 */
function TabBarBackground() {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBarBackground} />
    </View>
  );
}

/**
 * Layout pour la section des onglets principaux de l'application
 * Ce composant définit la barre de navigation du bas
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

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#06D001',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: { 
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          borderRadius: 30,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarShowLabel: false, // Cache les labels
        tabBarBackground: () => <TabBarBackground />,
        header: () => null, // Supprime l'ancien header
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="dodjeplus"
        options={{
          title: 'DodjePlus',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-circle" color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="boutique"
        options={{
          title: 'Boutique',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shopping" color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalogue"
        options={{
          title: 'Catalogue',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-variant" color={color} size={26} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#0A0400',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
