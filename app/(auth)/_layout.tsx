import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Slot, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { getAuth } from 'firebase/auth';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Si l'utilisateur est authentifié et essaie d'accéder aux pages d'authentification
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  useEffect(() => {
    const auth = getAuth();
    console.log('État de l\'auth:', auth.currentUser ? 'Connecté' : 'Non connecté');
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#059212" />
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
}); 