import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LogoLoadingSpinner } from './LogoLoadingSpinner';

interface LoadingSpinnerProps {
  size?: 'small' | 'large' | number;
  color?: string;
  useClassicSpinner?: boolean; // Option pour utiliser l'ancien spinner
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#06D001',
  useClassicSpinner = false,
}) => {
  // Si on veut utiliser l'ancien spinner ou si la taille est 'small'
  if (useClassicSpinner || size === 'small') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size={size === 'small' ? 'small' : 'large'} color={color} />
      </View>
    );
  }

  // Sinon, utiliser le nouveau LogoLoadingSpinner
  const logoSize = typeof size === 'number' ? size : (size === 'large' ? 20 : 16);
  
  return (
    <LogoLoadingSpinner size={logoSize} style={styles.container} />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 