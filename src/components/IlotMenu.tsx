import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import Icon1Svg from '../assets/IlotMenuIcon1.svg';
import Icon2Svg from '../assets/IlotMenuIcon2.svg';
import Icon3Svg from '../assets/IlotMenuIcon3.svg';
import Icon4Svg from '../assets/IlotMenuIcon4.svg';
import Icon5Svg from '../assets/IlotMenuIcon5.svg';

interface IlotMenuProps {
  style?: ViewStyle;
  activeRoute?: string; // Route actuelle pour déterminer quelle icône est active
}

export const IlotMenu: React.FC<IlotMenuProps> = ({ style, activeRoute }) => {
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
    isActive: boolean 
  }> = ({ IconComponent, isActive }) => {
    if (isActive) {
      return (
        <View style={styles.iconContainer}>
          <IconComponent 
            width={24} 
            height={24} 
            color="#9BEC00" // Couleur principale du dégradé pour l'icône active
            fill="#9BEC00"
            style={styles.activeIcon}
          />
        </View>
      );
    }
    
    return (
      <View style={styles.iconContainer}>
        <IconComponent width={24} height={24} />
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
        />
        <IconWithGlassEffect 
          IconComponent={Icon2Svg} 
          isActive={isIconActive(1)} 
        />
        <IconWithGlassEffect 
          IconComponent={Icon3Svg} 
          isActive={isIconActive(2)} 
        />
        <IconWithGlassEffect 
          IconComponent={Icon4Svg} 
          isActive={isIconActive(3)} 
        />
        <IconWithGlassEffect 
          IconComponent={Icon5Svg} 
          isActive={isIconActive(4)} 
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
}); 