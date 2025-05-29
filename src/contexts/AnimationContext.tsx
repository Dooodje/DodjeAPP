import React, { createContext, useContext, useState, useRef } from 'react';
import { View, Animated, Dimensions, Vibration, Text } from 'react-native';
import { Dodji } from '../components/SymboleBlanc';

const { width, height } = Dimensions.get('window');

interface FlyingDodji {
  id: string;
  translateX: Animated.Value;
  translateY: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
}

interface RewardText {
  id: string;
  x: number;
  y: number;
  count: number;
  opacity: Animated.Value;
  translateY: Animated.Value;
}

interface AnimationContextType {
  startFlyingDodjisAnimation: (startX?: number, startY?: number, count?: number) => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flyingDodjis, setFlyingDodjis] = useState<FlyingDodji[]>([]);
  const [rewardTexts, setRewardTexts] = useState<RewardText[]>([]);
  
  const startFlyingDodjisAnimation = (startX = width / 2, startY = height / 2, count = 5) => {
    console.log('🎭 AnimationProvider: Démarrage animation globale');
    console.log('🎭 AnimationProvider: Position de départ:', { startX, startY });
    console.log('🎭 AnimationProvider: Nombre de Dodjis gagnés:', count);
    
    // Créer le texte de récompense au point de départ
    const rewardText: RewardText = {
      id: `reward-${Date.now()}`,
      x: startX,
      y: startY,
      count: count,
      opacity: new Animated.Value(1),
      translateY: new Animated.Value(0),
    };
    
    setRewardTexts([rewardText]);
    
    // Animer le texte de récompense (fade out + montée)
    Animated.parallel([
      Animated.timing(rewardText.opacity, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(rewardText.translateY, {
        toValue: -50,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setRewardTexts([]);
    });
    
    // Calculer le nombre de Dodjis à animer (proportionnel mais limité)
    // Pour les petites récompenses (1-10) : 1:1
    // Pour les moyennes récompenses (11-50) : 1 Dodji pour 2-3 gagnés
    // Pour les grandes récompenses (51+) : 1 Dodji pour 5-10 gagnés
    let animatedCount;
    if (count <= 10) {
      animatedCount = count; // 1:1 pour les petites récompenses
    } else if (count <= 50) {
      animatedCount = Math.ceil(count / 3); // 1 pour 3
    } else {
      animatedCount = Math.min(Math.ceil(count / 10), 15); // 1 pour 10, max 15 Dodjis
    }
    
    console.log('🎭 AnimationProvider: Nombre de Dodjis à animer (calculé):', animatedCount);
    
    // Vibration immédiate
    try {
      console.log('🎭 AnimationProvider: Vibration déclenchée');
      Vibration.vibrate([0, 100, 50, 200, 50, 300]);
    } catch (error) {
      console.error('🎭 AnimationProvider: Erreur vibration:', error);
    }
    
    // Créer le nombre calculé de Dodjis volants
    const newDodjis: FlyingDodji[] = Array.from({ length: animatedCount }, (_, index) => ({
      id: `dodji-${Date.now()}-${index}`,
      translateX: new Animated.Value(startX - width / 2),
      translateY: new Animated.Value(startY - height / 2),
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
    }));
    
    setFlyingDodjis(newDodjis);
    
    // Animer chaque Dodji
    const animations = newDodjis.map((dodji, index) => {
      // Trajectoire vers la position de la cagnotte popup (plus haut sur l'écran)
      const targetX = (Math.random() - 0.5) * 100; // Centré horizontalement avec un peu de variation
      const targetY = -height * 0.35 + (Math.random() - 0.5) * 50; // Plus haut que le header, vers la cagnotte popup
      
      console.log(`🎭 AnimationProvider: Dodji ${index} - target:`, { targetX, targetY });
      
      // Durée adaptée au nombre de Dodjis pour ne pas dépasser 3 secondes
      const baseDuration = Math.max(800, Math.min(1500, 3000 / animatedCount * 2));
      const indexDelay = index * Math.min(100, 2000 / animatedCount);
      
      return Animated.parallel([
        Animated.timing(dodji.translateX, {
          toValue: targetX,
          duration: baseDuration + indexDelay,
          useNativeDriver: true,
        }),
        Animated.timing(dodji.translateY, {
          toValue: targetY,
          duration: baseDuration + indexDelay,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(dodji.scale, {
            toValue: 1.5,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(dodji.scale, {
            toValue: 0,
            duration: baseDuration + indexDelay - 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(dodji.opacity, {
          toValue: 0,
          duration: baseDuration + indexDelay,
          useNativeDriver: true,
        }),
      ]);
    });
    
    // Délai entre les Dodjis adapté pour ne pas dépasser 3 secondes
    const staggerDelay = Math.min(150, 2000 / animatedCount);
    
    // Lancer toutes les animations
    Animated.stagger(staggerDelay, animations).start(() => {
      console.log('🎭 AnimationProvider: Animation terminée, nettoyage');
      setFlyingDodjis([]);
    });
  };
  
  return (
    <AnimationContext.Provider value={{ startFlyingDodjisAnimation }}>
      {children}
      
      {/* Overlay global pour les animations */}
      {(flyingDodjis.length > 0 || rewardTexts.length > 0) && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: width,
            height: height,
            zIndex: 999999, // Z-index très élevé pour être au-dessus de tout
            pointerEvents: 'none',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Dodjis volants */}
          {flyingDodjis.map((dodji) => (
            <Animated.View
              key={dodji.id}
              style={{
                position: 'absolute',
                width: 30,
                height: 45,
                justifyContent: 'center',
                alignItems: 'center',
                transform: [
                  { translateX: dodji.translateX },
                  { translateY: dodji.translateY },
                  { scale: dodji.scale },
                ],
                opacity: dodji.opacity,
              }}
            >
              <Dodji width={30} height={45} />
            </Animated.View>
          ))}
          
          {/* Textes de récompense */}
          {rewardTexts.map((rewardText) => (
            <Animated.View
              key={rewardText.id}
              style={{
                position: 'absolute',
                left: rewardText.x - 50, // Centrer le texte
                top: rewardText.y - 30, // Positionner au-dessus du point de départ
                width: 100,
                alignItems: 'center',
                transform: [
                  { translateY: rewardText.translateY },
                ],
                opacity: rewardText.opacity,
              }}
            >
              <Text
                style={{
                  color: '#9BEC00',
                  fontSize: 18,
                  fontFamily: 'Arboria-Bold',
                  textAlign: 'center',
                  textShadowColor: 'rgba(0, 0, 0, 0.8)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                +{rewardText.count} Dodji
              </Text>
            </Animated.View>
          ))}
        </View>
      )}
    </AnimationContext.Provider>
  );
}; 