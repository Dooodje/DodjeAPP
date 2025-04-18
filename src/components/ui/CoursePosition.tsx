import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { AnneauVector } from './vectors/AnneauVectors';
import { PastilleVector } from './vectors/PastilleVectors';

export type CoursePositionType = 'standard' | 'important' | 'special' | 'annexe';

export interface CoursePositionProps {
  title?: string;
  type?: CoursePositionType;
  onPress?: () => void;
  size: number;
  isActive: boolean;
  style?: ViewStyle;
}

export const CoursePosition: React.FC<CoursePositionProps> = ({
  title,
  type = 'standard',
  onPress,
  size = 60,
  isActive = false,
  style
}) => {
  // Convertit le type de CoursePosition en type pour PastilleVector
  const getPastilleType = (): 'parcours' | 'annexe' => {
    return type === 'annexe' ? 'annexe' : 'parcours';
  };

  // Détermine la couleur de l'anneau en fonction du type et de l'état actif
  const getRingColor = (): string => {
    if (isActive) {
      return '#06D001'; // Vert vif pour l'état actif
    }
    
    switch (type) {
      case 'important':
        return '#F3FF90'; // Jaune clair
      case 'special':
        return '#9BEC00'; // Vert lime
      case 'annexe':
        return '#059212'; // Vert foncé
      case 'standard':
      default:
        return '#F1E61C'; // Jaune doré (par défaut)
    }
  };

  // Détermine le type d'anneau en fonction du type de Course
  const getAnneauType = (): 'anneau1' | 'anneau2' | 'anneau3' | 'anneau5' => {
    switch (type) {
      case 'important':
        return 'anneau3';
      case 'special':
        return 'anneau5';
      case 'annexe':
        return 'anneau2';
      case 'standard':
      default:
        return 'anneau1';
    }
  };

  // Détermine la couleur de la pastille en fonction du type et de l'état actif
  const getPastilleBackgroundColor = (): string => {
    if (type === 'annexe') {
      return '#F1E61C'; // Jaune doré pour les annexes
    }
    return '#0A0400'; // Noir pour les parcours standards
  };

  const getPastilleBorderColor = (): string => {
    if (isActive) {
      return '#06D001'; // Vert vif pour l'état actif
    }
    return type === 'annexe' ? '#FFFFFF' : '#F1E61C'; // Blanc pour annexes, jaune pour autres
  };

  const getPastilleIconColor = (): string => {
    if (isActive) {
      return '#06D001'; // Vert vif pour l'état actif
    }
    return '#F3FF90'; // Jaune clair par défaut
  };

  // Calcule les tailles proportionnelles
  const anneauSize = size;
  const pastilleSize = size * 0.8;
  
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.button, { width: size, height: size }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Anneau extérieur */}
        <AnneauVector 
          size={anneauSize} 
          color={getRingColor()}
          type={getAnneauType()}
        />
        
        {/* Pastille centrale */}
        <View style={styles.pastilleContainer}>
          <PastilleVector
            type={getPastilleType()}
            size={pastilleSize}
            isActive={isActive}
            backgroundColor={getPastilleBackgroundColor()}
            borderColor={getPastilleBorderColor()}
            iconColor={getPastilleIconColor()}
          />
        </View>
      </TouchableOpacity>
      
      {/* Titre en dessous du bouton */}
      {title && (
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {title}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  pastilleContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    maxWidth: 100,
  },
}); 