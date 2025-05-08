import React from 'react';
import { View, StyleSheet } from 'react-native';

interface QuizProgressProps {
  current: number;
  total: number;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({ current, total }) => {
  const progress = (current / total) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.progressBackground}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 75,
  },
  progressBackground: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#06D001',
    borderRadius: 10,
  },
}); 