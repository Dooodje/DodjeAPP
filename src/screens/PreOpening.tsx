import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LogoDodje } from '../components/LogoDodje';

const PreOpening: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/opening');
    }, 3000); // 3 secondes

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <LogoDodje width={200} height={200} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400', // Même couleur de fond que Opening
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PreOpening; 