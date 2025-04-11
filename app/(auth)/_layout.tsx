import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Slot, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';

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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0400' }}>
        <ActivityIndicator size="large" color="#059212" />
      </View>
    );
  }

  return <Slot />;
} 