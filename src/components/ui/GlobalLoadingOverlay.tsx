import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useLoading } from '../../contexts/LoadingContext';
import { LogoLoadingSpinner } from './LogoLoadingSpinner';

const { width, height } = Dimensions.get('screen');

export const GlobalLoadingOverlay: React.FC = () => {
  const { isInitialLoading } = useLoading();

  if (!isInitialLoading) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <LogoLoadingSpinner />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0400',
    zIndex: 999999,
  },
}); 