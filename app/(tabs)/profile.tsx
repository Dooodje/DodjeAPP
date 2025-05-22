import React from 'react';
import { View, StyleSheet } from 'react-native';
import Profile from '../../src/screens/profile/index';

/**
 * Page de profil utilisateur
 * Affiche les informations de l'utilisateur et ses statistiques
 */
export default function ProfilePage() {
  return (
    <View style={styles.container}>
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