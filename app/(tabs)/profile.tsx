import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalHeader } from '../../src/components/ui/GlobalHeader';
import Profile from '../../src/screens/profile/index';

/**
 * Page de profil utilisateur
 * Affiche les informations de l'utilisateur et ses statistiques
 */
export default function ProfilePage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <GlobalHeader
        title="PROFIL"
        showBackButton={false}
      />
      <Profile />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
}); 