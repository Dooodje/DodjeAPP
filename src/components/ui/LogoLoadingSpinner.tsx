import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import LogoVert from '../LogoVert';

interface LogoLoadingSpinnerProps {
  size?: number;
  style?: any;
}

export const LogoLoadingSpinner: React.FC<LogoLoadingSpinnerProps> = ({
  size = 20,
  style
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startRotation = () => {
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => startRotation());
    };

    startRotation();
  }, [rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const logoScale = size / 20; // 20 est la taille par défaut du LogoVert

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [
              { rotate },
              { scale: logoScale }
            ],
          },
        ]}
      >
        <LogoVert />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 