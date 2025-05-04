import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Constantes pour les dimensions
const { width: screenWidth } = Dimensions.get('window');
const DEFAULT_BUTTON_SIZE = 60; // Taille par défaut du bouton
// Valeurs approximatives pour le header incluant la StatusBar
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : 24; // Valeur fixe pour Android
const HEADER_HEIGHT = 60; // Hauteur approximative du header sans StatusBar

interface VideoButtonProps {
  id: string;
  title: string;
  duration: number | string;
  completionStatus: 'blocked' | 'unblocked' | 'completed';
  order: number;
  positionX: number; // Position X en pourcentage (0-100)
  positionY: number; // Position Y en pourcentage (0-100)
  imageWidth: number; // Largeur de l'image d'arrière-plan
  imageHeight: number; // Hauteur de l'image d'arrière-plan
  onPress: (videoId: string) => void;
}

const VideoButton: React.FC<VideoButtonProps> = ({
  id,
  title,
  duration,
  completionStatus,
  order,
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
      console.warn(`Dimensions d'image invalides pour le bouton vidéo: ${imageWidth}x${imageHeight}. Utilisation des valeurs par défaut.`);
    }
    
    // Convertir les pourcentages en pixels absolus par rapport à l'image
    const absoluteX = (positionX / 100) * validImageWidth;
    const absoluteY = (positionY / 100) * validImageHeight;
    
    // Centrer le bouton sur le point exact
    const left = absoluteX - (DEFAULT_BUTTON_SIZE / 2);
    const top = absoluteY - (DEFAULT_BUTTON_SIZE / 2);
    
    // Log pour débogage
    console.log(`VideoButton (${id}): Position relative=${positionX}%,${positionY}%, Dimensions image=${validImageWidth}x${validImageHeight}, Position absolue=${left},${top}`);
    
    return { 
      left,
      top
    };
  }, [id, positionX, positionY, imageWidth, imageHeight]);

  // Déterminer le style du bouton en fonction du statut
  const buttonStyle = useMemo(() => {
    if (completionStatus === 'completed') {
      return styles.completedButton;
    } else if (completionStatus === 'unblocked') {
      return styles.unlockedButton;
    } else {
      return styles.blockedButton;
    }
  }, [completionStatus]);

  // Format de la durée
  const formattedDuration = useMemo(() => {
    if (typeof duration === 'string') {
      return duration;
    }
    
    // Convertir les secondes en format MM:SS
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [duration]);

  // Icône en fonction du statut
  const icon = useMemo(() => {
    if (completionStatus === 'completed') {
      return <MaterialIcons name="check-circle" size={24} color="#06D001" />;
    } else if (completionStatus === 'unblocked') {
      return <MaterialIcons name="play-circle-filled" size={24} color="#FFF" />;
    } else {
      return <MaterialIcons name="lock" size={24} color="#AAA" />;
    }
  }, [completionStatus]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, buttonStyle, position]}
      onPress={() => onPress(id)}
      disabled={completionStatus === 'blocked'}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.orderNumber}>{order}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.duration}>{formattedDuration}</Text>
      </View>
      <View style={styles.iconContainer}>
        {icon}
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
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  blockedButton: {
    backgroundColor: 'rgba(100, 100, 100, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  unlockedButton: {
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    borderWidth: 1,
    borderColor: '#06D001',
  },
  completedButton: {
    backgroundColor: 'rgba(6, 208, 1, 0.2)',
    borderWidth: 2,
    borderColor: '#06D001',
  },
  contentContainer: {
    position: 'absolute',
    top: DEFAULT_BUTTON_SIZE + 5,
    width: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    left: -(120 - DEFAULT_BUTTON_SIZE) / 2, // Centrer par rapport au bouton
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  orderNumber: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    position: 'absolute',
    top: -35,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  title: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
    maxWidth: 100,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  duration: {
    color: '#AAA',
    fontSize: 10,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoButton; 