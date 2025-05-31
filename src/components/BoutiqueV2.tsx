import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import BoutiqueV2Svg from '../assets/BoutiqueV2.svg';
import { useWelcomePackBadge } from '../contexts/WelcomePackContext';

interface BoutiqueV2Props {
  style?: any;
}

const BoutiqueV2: React.FC<BoutiqueV2Props> = ({ style }) => {
  // Animation pour le badge
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const { showBadge } = useWelcomePackBadge();

  // Effet de rebond répétitif
  useEffect(() => {
    if (!showBadge) return;

    const createBounceAnimation = () => {
      return Animated.sequence([
        // Premier rebond
        Animated.timing(bounceAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        // Deuxième rebond
        Animated.timing(bounceAnim, {
          toValue: 1.2,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        // Pause avant le prochain cycle
        Animated.delay(1460), // 2000ms total - 540ms d'animation = 1460ms de pause
      ]);
    };

    const startAnimation = () => {
      Animated.loop(createBounceAnimation()).start();
    };

    startAnimation();

    return () => {
      bounceAnim.stopAnimation();
    };
  }, [bounceAnim, showBadge]);

  return (
    <View style={[styles.container, style]}>
      <BoutiqueV2Svg width={26} height={30} />
      
      {/* Badge rouge avec point d'exclamation et animation - conditionnel */}
      {showBadge && (
        <Animated.View style={[
          styles.badge,
          {
            transform: [{ scale: bounceAnim }]
          }
        ]}>
          <Text style={styles.badgeText}>!</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#FF4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 12,
  },
});

export default BoutiqueV2; 