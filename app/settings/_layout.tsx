import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';

export default function SettingsLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Rediriger vers la connexion si non authentifié
  React.useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0400' }}>
        <ActivityIndicator size="large" color="#059212" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0A0400',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontFamily: 'Arboria-Bold',
        },
        presentation: 'modal',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Paramètres',
        }}
      />
      <Stack.Screen
        name="subscription"
        options={{
          title: 'Gérer l\'abonnement',
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          title: 'Politique de confidentialité',
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          title: 'Conditions d\'utilisation',
        }}
      />
    </Stack>
  );
} 