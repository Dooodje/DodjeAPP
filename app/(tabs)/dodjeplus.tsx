import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Écran DodjePlus - Fonctionnalités supplémentaires (à développer)
 */
export default function DodjePlusScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DodjePlus</Text>
      <Text style={styles.subtitle}>Fonctionnalités supplémentaires à venir</Text>
      <Text style={styles.description}>
        Cette section est en cours de développement. Restez à l'écoute pour découvrir
        de nouvelles fonctionnalités exclusives bientôt disponibles!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0400',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#06D001',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 