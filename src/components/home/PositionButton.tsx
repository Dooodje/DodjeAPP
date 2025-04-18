import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Parcours } from '../../types/firebase';
import { CoursePosition, CoursePositionType } from '../ui/CoursePosition';

interface PositionButtonProps {
  id: string;
  x: number;
  y: number;
  order?: number;
  isAnnex?: boolean;
  onPress: (positionId: string, order?: number) => void;
  parcoursData?: Parcours; // Données du parcours associé
  imageWidth?: number; // Largeur de l'image de fond
  imageHeight?: number; // Hauteur de l'image de fond
  containerWidth?: number; // Largeur du conteneur
  containerHeight?: number; // Hauteur du conteneur
}

const PositionButton: React.FC<PositionButtonProps> = ({
  id,
  x,
  y,
  order,
  isAnnex = false,
  onPress,
  parcoursData,
  imageWidth = 0,
  imageHeight = 0,
  containerWidth = 0,
  containerHeight = 0,
}) => {
  // Calculer les positions absolues en fonction des dimensions de l'image
  const position = useMemo(() => {
    // Si les dimensions ne sont pas disponibles, utiliser les pourcentages relatifs à l'écran
    if (!imageWidth || !imageHeight || !containerWidth || !containerHeight) {
      return {
        left: `${x}%`,
        top: `${y}%`,
      };
    }

    // Calculer la position absolue en pixels par rapport à l'image
    const absoluteX = (x / 100) * imageWidth;
    const absoluteY = (y / 100) * imageHeight;

    // Calculer la marge horizontale si l'image est centrée
    const horizontalMargin = Math.max(0, (containerWidth - imageWidth) / 2);

    // Position finale en pixels
    return {
      left: horizontalMargin + absoluteX,
      top: absoluteY,
    };
  }, [x, y, imageWidth, imageHeight, containerWidth, containerHeight]);

  // Déterminer le type de position et si elle est active
  const { type, isActive } = useMemo(() => {
    // Si pas de données de parcours, utiliser les valeurs par défaut
    if (!parcoursData) {
      const defaultType: CoursePositionType = isAnnex ? 'annexe' : 'standard';
      return {
        type: defaultType,
        isActive: false
      };
    }

    // Vérifier d'abord si c'est une annexe
    if (isAnnex) {
      return {
        type: 'annexe' as CoursePositionType,
        isActive: parcoursData.status === 'completed'
      };
    }

    // En fonction du statut du parcours
    if (parcoursData.status === 'completed') {
      return {
        type: 'standard' as CoursePositionType,
        isActive: true
      };
    } else if (parcoursData.status === 'in_progress') {
      return {
        type: 'important' as CoursePositionType,
        isActive: false
      };
    } else if (parcoursData.status === 'blocked') {
      return {
        type: 'special' as CoursePositionType,
        isActive: false
      };
    } else {
      // Statut par défaut (available)
      return {
        type: 'standard' as CoursePositionType,
        isActive: false
      };
    }
  }, [parcoursData, isAnnex]);

  const handlePress = () => {
    onPress(id, order);
  };

  // Taille basée sur le type (plus petit pour les annexes)
  const size = isAnnex ? 40 : 80;

  return (
    <View
      style={[
        styles.container,
        {
          left: position.left,
          top: position.top,
          width: size,
          height: size,
        } as ViewStyle,
      ]}
    >
      <CoursePosition
        type={type}
        size={size}
        isActive={isActive}
        title={parcoursData?.titre || parcoursData?.title}
        onPress={handlePress}
        order={order}
        parcours={parcoursData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    zIndex: 20,
  } as ViewStyle,
});

export default PositionButton; 