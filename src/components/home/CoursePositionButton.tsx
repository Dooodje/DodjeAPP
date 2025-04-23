import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Parcours } from '../../types/firebase';
import theme from '../../config/theme';
import { AnneauVector } from '../ui/vectors/AnneauVectors';
import PastilleAnnexe from '../PastilleAnnexe';
import { PastilleParcoursDefault } from '../PastilleParcoursDefault';
import { PastilleParcoursVariant2 } from '../PastilleParcoursVariant2';
import { PastilleParcoursVariant3 } from '../PastilleParcoursVariant3';

interface CoursePositionButtonProps {
  parcours: Parcours;
  size?: number;
  isActive?: boolean;
  onPress: (parcoursId: string) => void;
  style?: ViewStyle;
}

const CoursePositionButton: React.FC<CoursePositionButtonProps> = ({
  parcours,
  size = 80,
  isActive = false,
  onPress,
  style
}) => {
  // Déterminer le type de positionnement
  const getPositionType = () => {
    if (parcours.isAnnexe || parcours.isAnnex) return 'annexe';
    if (parcours.isIntroduction) return 'important';
    if (parcours.isSpecial || parcours.isBonus) return 'special';
    return 'standard';
  };

  const positionType = getPositionType();

  // Déterminer le type d'anneau et les couleurs en fonction du type
  const getRingType = () => {
    switch (positionType) {
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

  const getPrimaryColor = () => {
    switch (positionType) {
      case 'important':
        return theme.colors.secondary.light;
      case 'special':
        return '#FF6B00';
      case 'annexe':
        return theme.colors.primary.dark;
      case 'standard':
      default:
        return theme.colors.primary.main;
    }
  };

  const getSecondaryColor = () => {
    switch (positionType) {
      case 'important':
        return theme.colors.primary.light;
      case 'special':
        return '#FF9A00';
      case 'annexe':
        return theme.colors.primary.main;
      case 'standard':
      default:
        return theme.colors.primary.light;
    }
  };

  // Calculer la taille relative des éléments
  const ringSize = size;
  const pastilleSize = size * 0.6;

  // Sélectionner le composant de pastille approprié en fonction du statut
  const renderPastille = () => {
    // Si c'est une annexe, utiliser PastilleAnnexe
    if (parcours.isAnnexe || parcours.isAnnex) {
      return <PastilleAnnexe width={pastilleSize} height={pastilleSize} />;
    }

    // Si le parcours est terminé, utiliser PastilleParcoursVariant2 (vert)
    if (parcours.isCompleted) {
      return <PastilleParcoursVariant2 style={{ width: pastilleSize, height: pastilleSize }} />;
    }

    // Si le parcours est débloqué mais pas terminé, utiliser PastilleParcoursDefault (jaune)
    if (isActive) {
      return <PastilleParcoursDefault style={{ width: pastilleSize, height: pastilleSize }} />;
    }

    // Si le parcours est bloqué, utiliser PastilleParcoursVariant3 (gris/désactivé)
    return <PastilleParcoursVariant3 style={{ width: pastilleSize, height: pastilleSize }} />;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: size, height: size }, style]}
      onPress={() => onPress(parcours.id)}
      activeOpacity={0.7}
    >
      {/* Anneau extérieur */}
      <AnneauVector 
        type={getRingType()} 
        size={ringSize} 
        color={getPrimaryColor()} 
        secondaryColor={getSecondaryColor()} 
      />
      
      {/* Pastille centrale */}
      <View style={styles.pastilleContainer}>
        {renderPastille()}
      </View>
      
      {/* Badge d'ordre si fourni */}
      {parcours.order !== undefined && (
        <View style={styles.orderBadge}>
          <Text style={styles.orderText}>{parcours.order}</Text>
        </View>
      )}
      
      {/* Titre en dessous si fourni */}
      {(parcours.titre || parcours.title) && (
        <View style={styles.titleContainer}>
          <Text style={styles.titleText} numberOfLines={2}>
            {parcours.titre || parcours.title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.5)',
      },
    }),
  },
  pastilleContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6B00',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  orderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  titleContainer: {
    position: 'absolute',
    bottom: -40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 5,
    width: 100,
    alignItems: 'center',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CoursePositionButton; 