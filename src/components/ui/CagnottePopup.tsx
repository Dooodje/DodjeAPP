import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import SymbolBlancComponent from '../SymboleBlanc';

const { width, height } = Dimensions.get('window');

interface CagnottePopupProps {
  visible: boolean;
  initialAmount: number;
  finalAmount: number;
  rewardAmount: number;
  onAnimationComplete: () => void;
}

export const CagnottePopup: React.FC<CagnottePopupProps> = ({
  visible,
  initialAmount,
  finalAmount,
  rewardAmount,
  onAnimationComplete,
}) => {
  const animatedAmount = useRef(new Animated.Value(initialAmount)).current;
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  // Animations pour le compteur comme dans GlobalHeader
  const counterScaleAnimation = useRef(new Animated.Value(1)).current;
  const colorAnimation = useRef(new Animated.Value(0)).current;
  const [currentDisplayAmount, setCurrentDisplayAmount] = useState(initialAmount);

  useEffect(() => {
    if (visible) {
      console.log('🎭 CagnottePopup: Animation démarrée de', initialAmount, 'à', finalAmount);
      
      // Reset des animations du compteur
      counterScaleAnimation.setValue(1);
      colorAnimation.setValue(0);
      
      // Animation d'apparition de la cagnotte
      Animated.parallel([
        Animated.spring(scaleAnimation, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Démarrer l'animation du compteur après l'apparition
        startCounterAnimation();
      });
    } else {
      // Reset des valeurs
      scaleAnimation.setValue(0);
      opacityAnimation.setValue(0);
      animatedAmount.setValue(initialAmount);
      counterScaleAnimation.setValue(1);
      colorAnimation.setValue(0);
      setCurrentDisplayAmount(initialAmount);
    }
  }, [visible, initialAmount, finalAmount]);

  const startCounterAnimation = () => {
    console.log('🎭 CagnottePopup: Animation compteur démarrée');
    
    // Animation du compteur qui se déroule
    const listener = animatedAmount.addListener(({ value }) => {
      setCurrentDisplayAmount(Math.floor(value));
    });

    // Animation de scale pour attirer l'attention (comme dans GlobalHeader)
    Animated.sequence([
      Animated.timing(counterScaleAnimation, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(counterScaleAnimation, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animation de couleur (jaune -> vert -> jaune) comme dans GlobalHeader
    Animated.sequence([
      Animated.timing(colorAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(colorAnimation, {
        toValue: 0,
        duration: 1700,
        useNativeDriver: false,
      }),
    ]).start();

    Animated.timing(animatedAmount, {
      toValue: finalAmount,
      duration: 2000, // 2 secondes pour correspondre à l'animation des Dodjis
      useNativeDriver: false,
    }).start(() => {
      animatedAmount.removeListener(listener);
      setCurrentDisplayAmount(finalAmount);
      
      // Attendre un peu puis fermer
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onAnimationComplete();
        });
      }, 1000);
    });
  };

  if (!visible) return null;

  return (
    <View style={styles.modalContainer}>
      {/* Overlay avec opacité 10% */}
      <View style={styles.overlay}>
        {/* Cagnotte positionnée en haut comme dans GlobalHeader */}
        <Animated.View
          style={[
            styles.cagnotteContainer,
            {
              transform: [{ scale: scaleAnimation }],
              opacity: opacityAnimation,
            },
          ]}
        >
          {/* Design exactement comme dans GlobalHeader */}
          <View style={styles.pointsContainer}>
            <Animated.View style={{ transform: [{ scale: counterScaleAnimation }] }}>
              <Animated.Text 
                style={[
                  styles.pointsText,
                  {
                    color: colorAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['#F1E61C', '#9BEC00'], // Jaune -> Vert comme dans GlobalHeader
                    }),
                  }
                ]}
              >
                {currentDisplayAmount}
              </Animated.Text>
            </Animated.View>
            <View style={styles.symbolContainer}>
              <SymbolBlancComponent width={32} height={32} />
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    zIndex: 999998, // Z-index élevé mais légèrement inférieur aux Dodjis volants
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // 90% d'opacité pour que la page derrière soit à 10%
    justifyContent: 'flex-start', // Alignement en haut
    alignItems: 'center',
    paddingTop: height * 0.15, // Position plus haute sur l'écran (15% du haut)
  },
  cagnotteContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Fond plus opaque
    borderRadius: 25,
    padding: 30, // Plus de padding pour agrandir
    shadowColor: '#9BEC00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, // Surbrillance plus subtile
    shadowRadius: 15,
    elevation: 15,
  },
  // Styles exactement comme dans GlobalHeader
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5, // Réduire la marge
  },
  pointsText: {
    color: '#F1E61C',
    fontSize: 32, // Plus gros pour la cagnotte agrandie
    fontFamily: 'Arboria-Bold',
    marginRight: 8,
  },
  symbolContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
}); 