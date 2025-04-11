import React, { useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface PageTransitionProps {
  children: React.ReactNode;
  isVisible?: boolean;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isVisible = true
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: isVisible ? 0 : 50,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, [isVisible]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 