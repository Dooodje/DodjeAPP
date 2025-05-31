import React, { useEffect, useRef } from 'react';
import { View, ViewStyle, StyleSheet, Text, Animated } from 'react-native';
import Icon1Svg from '../assets/IlotMenuIcon1.svg';
import Icon2Svg from '../assets/IlotMenuIcon2.svg';
import Icon3Svg from '../assets/IlotMenuIcon3.svg';
import Icon4Svg from '../assets/IlotMenuIcon4.svg';
import Icon5Svg from '../assets/IlotMenuIcon5.svg';
import HomeV2 from './HomeV2';
import BoutiqueV2 from './BoutiqueV2';
import LabV2 from './LabV2';
import ProfilV2 from './ProfilV2';
import CataV2 from './CataV2';
import { useWelcomePackBadge } from '../contexts/WelcomePackContext';

interface IlotMenuProps {
  style?: ViewStyle;
  activeRoute?: string; // Route actuelle pour déterminer quelle icône est active
}

export const IlotMenu: React.FC<IlotMenuProps> = ({ style, activeRoute }) => {
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

  // Fonction pour déterminer si une icône est active selon la route
  const isIconActive = (iconIndex: number): boolean => {
    if (!activeRoute) return false;
    
    // Mapping des routes vers les icônes (ajustez selon votre logique)
    const routeToIconMap: { [key: string]: number } = {
      '/profile': 0,
      '/dodjeplus': 1, 
      '/': 2, // Page d'accueil
      '/boutique': 3,
      '/catalogue': 4,
    };
    
    return routeToIconMap[activeRoute] === iconIndex;
  };

  // Composant pour une icône avec effet de verre optionnel
  const IconWithGlassEffect: React.FC<{ 
    IconComponent: React.FC<any>, 
    isActive: boolean,
    isHomeIcon?: boolean,
    isBoutiqueIcon?: boolean,
    isLabIcon?: boolean,
    isProfilIcon?: boolean,
    isCatalogueIcon?: boolean
  }> = ({ IconComponent, isActive, isHomeIcon = false, isBoutiqueIcon = false, isLabIcon = false, isProfilIcon = false, isCatalogueIcon = false }) => {
    if (isActive) {
      return (
        <View style={styles.iconContainer}>
          {isHomeIcon ? (
            <HomeV2 />
          ) : isBoutiqueIcon ? (
            <BoutiqueV2 />
          ) : isLabIcon ? (
            <LabV2 />
          ) : isProfilIcon ? (
            <ProfilV2 />
          ) : isCatalogueIcon ? (
            <CataV2 />
          ) : (
            <IconComponent 
              width={24} 
              height={24} 
              color="#9BEC00" // Couleur principale du dégradé pour l'icône active
              fill="#9BEC00"
              style={styles.activeIcon}
            />
          )}
        </View>
      );
    }
    
    return (
      <View style={styles.iconContainer}>
        {isHomeIcon ? (
          <IconComponent width={24} height={24} />
        ) : isBoutiqueIcon ? (
          <View style={styles.boutiqueIconWrapper}>
            <IconComponent width={24} height={24} />
            {/* Badge rouge pour l'icône boutique non active avec animation - conditionnel */}
            {showBadge && (
              <Animated.View style={[
                styles.boutiqueBadge,
                {
                  transform: [{ scale: bounceAnim }]
                }
              ]}>
                <Text style={styles.boutiqueBadgeText}>!</Text>
              </Animated.View>
            )}
          </View>
        ) : isLabIcon ? (
          <IconComponent width={24} height={24} />
        ) : isProfilIcon ? (
          <IconComponent width={24} height={24} />
        ) : isCatalogueIcon ? (
          <IconComponent width={24} height={24} />
        ) : (
          <IconComponent width={24} height={24} />
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.background} />
      <View style={styles.content}>
        <IconWithGlassEffect 
          IconComponent={Icon1Svg} 
          isActive={isIconActive(0)}
          isProfilIcon={true}
        />
        <IconWithGlassEffect 
          IconComponent={Icon2Svg} 
          isActive={isIconActive(1)}
          isLabIcon={true}
        />
        <IconWithGlassEffect 
          IconComponent={Icon3Svg} 
          isActive={isIconActive(2)}
          isHomeIcon={true}
        />
        <IconWithGlassEffect 
          IconComponent={Icon4Svg} 
          isActive={isIconActive(3)}
          isBoutiqueIcon={true}
        />
        <IconWithGlassEffect 
          IconComponent={Icon5Svg} 
          isActive={isIconActive(4)}
          isCatalogueIcon={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 408,
    position: 'relative',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 40,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 50,
    padding: 20,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIcon: {
    // Effet de lueur pour simuler l'aspect "verre"
    shadowColor: '#9BEC00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  boutiqueIconWrapper: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boutiqueBadge: {
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
  boutiqueBadgeText: {
    fontSize: 10,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 12,
  },
}); 