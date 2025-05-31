import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { useLoading } from '../../contexts/LoadingContext';
import { LogoLoadingSpinner } from './LogoLoadingSpinner';

const { width, height } = Dimensions.get('screen');

export const GlobalLoadingOverlay: React.FC = () => {
  const { isInitialLoading } = useLoading();
  
  // Animation pour l'overlay
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  // État local pour contrôler la visibilité du composant
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    if (isInitialLoading) {
      // Afficher l'overlay immédiatement
      setIsVisible(true);
      overlayOpacity.setValue(1);
    } else if (isVisible) {
      // Animation de fermeture douce
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 500, // 500ms pour une transition douce
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }
  }, [isInitialLoading, isVisible, overlayOpacity]);

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <LogoLoadingSpinner />
    </Animated.View>
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