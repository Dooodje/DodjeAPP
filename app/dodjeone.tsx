import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { DodjeOneScreen } from '../src/screens/dodjeone';
import { useAuth } from '../src/hooks/useAuth';
import { AppRoute } from '../src/types/routes';

export default function DodjeOnePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Si l'authentification est en cours de chargement, afficher un indicateur de chargement
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9BEC00" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // Si l'utilisateur n'est pas authentifié, le rediriger vers la page de connexion
  if (!isAuthenticated) {
    router.replace('/(auth)/login' as AppRoute);
    return null;
  }

  return (
    <View style={styles.container}>
      <DodjeOneScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0400',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 15,
    fontSize: 16,
    fontFamily: 'Arboria-Book',
  },
}); 