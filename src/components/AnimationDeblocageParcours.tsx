import React, { useEffect, useRef } from 'react';
import { View, Animated, Vibration } from 'react-native';
import { Vector } from './Vector';

interface AnimationDeblocageParcoursProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onAnimationComplete: () => void;
}

export const AnimationDeblocageParcours: React.FC<AnimationDeblocageParcoursProps> = ({
  isVisible,
  position,
  onAnimationComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const explosionScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Démarrer l'animation de déblocage
      startUnlockAnimation();
    } else {
      // Reset des valeurs
      scaleAnim.setValue(1);
      opacityAnim.setValue(1);
      rotateAnim.setValue(0);
      explosionScale.setValue(0);
    }
  }, [isVisible]);

  const startUnlockAnimation = () => {
    console.log('🔓 Démarrage animation déblocage parcours');
    console.log('📍 Position de l\'animation:', position);
    
    // Vibration pour le feedback
    try {
      Vibration.vibrate([0, 100, 50, 150, 50, 200]);
    } catch (error) {
      console.error('Erreur vibration:', error);
    }

    // Séquence d'animation améliorée (2.5 secondes au total)
    Animated.sequence([
      // Phase 1: Gonflement progressif avec vibration (1.5 secondes)
      Animated.parallel([
        // Gonflement progressif du cadenas
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.4,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.6,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.8,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 2.0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Vibration intense du cadenas
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 80,
            useNativeDriver: true,
          }),
        ]),
      ]),
      
      // Phase 2: Explosion spectaculaire (1 seconde)
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 5,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(explosionScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      
      // Phase 3: Effet de rémanence (400ms)
      Animated.timing(explosionScale, {
        toValue: 1.5,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('🔓 Animation déblocage terminée');
      onAnimationComplete();
    });
  };

  if (!isVisible) return null;

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg'],
  });

  return (
    <View
      style={{
        position: 'absolute',
        left: position.x - 30, // Centrer sur la position
        top: position.y - 30,
        width: 60,
        height: 60,
        zIndex: 999999,
        pointerEvents: 'none',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Cadenas qui vibre et explose */}
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            { rotate: rotateInterpolate },
          ],
          opacity: opacityAnim,
        }}
      >
        <Vector width={40} height={40} color="#F3FF90" />
      </Animated.View>

      {/* Effet d'explosion (cercles concentriques multiples) */}
      <Animated.View
        style={{
          position: 'absolute',
          top: -25,
          left: -25,
          width: 100,
          height: 100,
          borderRadius: 50,
          borderWidth: 4,
          borderColor: '#9BEC00',
          transform: [{ scale: explosionScale }],
          opacity: opacityAnim,
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          top: -50,
          left: -50,
          width: 150,
          height: 150,
          borderRadius: 75,
          borderWidth: 3,
          borderColor: '#F3FF90',
          transform: [{ scale: explosionScale }],
          opacity: opacityAnim,
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          top: -75,
          left: -75,
          width: 200,
          height: 200,
          borderRadius: 100,
          borderWidth: 2,
          borderColor: '#9BEC00',
          transform: [{ scale: explosionScale }],
          opacity: opacityAnim,
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 250,
          height: 250,
          borderRadius: 125,
          borderWidth: 1,
          borderColor: '#F3FF90',
          transform: [{ scale: explosionScale }],
          opacity: opacityAnim,
        }}
      />
    </View>
  );
}; 