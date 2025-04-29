import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ProgressRingTest } from '../src/components/test/ProgressRingTest';

/**
 * Page de test pour visualiser les anneaux de progression
 */
export default function TestProgressRingScreen() {
  return (
    <View style={styles.container}>
      <ProgressRingTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
}); 