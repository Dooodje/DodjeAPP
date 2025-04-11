import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Constantes pour les dimensions
const { width: screenWidth } = Dimensions.get('window');
const DEFAULT_BUTTON_SIZE = 70; // Légèrement plus grand que les boutons vidéo

interface QuizButtonProps {
  id: string;
  title?: string;
  positionX: number; // Position X en pourcentage (0-100)
  positionY: number; // Position Y en pourcentage (0-100)
  imageWidth: number; // Largeur de l'image d'arrière-plan
  imageHeight: number; // Hauteur de l'image d'arrière-plan
  onPress: (quizId: string) => void;
}

const QuizButton: React.FC<QuizButtonProps> = ({
  id,
  title = 'Quiz Final',
  positionX,
  positionY,
  imageWidth,
  imageHeight,
  onPress
}) => {
  // Calculer la position absolue en pixels
  const position = useMemo(() => {
    // Valider les dimensions
    const validImageWidth = imageWidth > 0 ? imageWidth : screenWidth;
    const validImageHeight = imageHeight > 0 ? imageHeight : screenWidth * 2;
    
    if (imageWidth <= 0 || imageHeight <= 0) {
      console.warn(`Dimensions d'image invalides pour le bouton quiz: ${imageWidth}x${imageHeight}. Utilisation des valeurs par défaut.`);
    }
    
    // Convertir les pourcentages en pixels
    const x = (positionX / 100) * validImageWidth;
    const y = (positionY / 100) * validImageHeight;
    
    // Log pour débogage
    console.log(`QuizButton (${id}): Position relative=${positionX}%,${positionY}%, Dimensions image=${validImageWidth}x${validImageHeight}, Position absolue=${x},${y}`);
    
    return { 
      left: x - (DEFAULT_BUTTON_SIZE / 2),  // Centrer le bouton horizontalement
      top: y - (DEFAULT_BUTTON_SIZE / 2)    // Centrer le bouton verticalement
    };
  }, [id, positionX, positionY, imageWidth, imageHeight]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.container, position]}
      onPress={() => onPress(id)}
    >
      <View style={styles.quizIcon}>
        <MaterialIcons name="quiz" size={36} color="#FFFFFF" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle}>Testez vos connaissances</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: DEFAULT_BUTTON_SIZE,
    height: DEFAULT_BUTTON_SIZE,
    borderRadius: DEFAULT_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(255, 193, 7, 0.9)', // Couleur jaune distinctive
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Plus élevé que les vidéos pour être au-dessus
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  quizIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    position: 'absolute',
    top: DEFAULT_BUTTON_SIZE + 5,
    width: 140,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    left: -(140 - DEFAULT_BUTTON_SIZE) / 2, // Centrer par rapport au bouton
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.5)',
  },
  title: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
    maxWidth: 120,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: 'rgba(255, 193, 7, 0.9)',
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  }
});

export default QuizButton; 