import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import VideoOn from '../../components/VideoOn';
import VideoOff from '../../components/VideoOff';
import VideoLock from '../../components/VideoLock';
import LockMarron from '../../components/LockMarron';
import CustomModal from '../ui/CustomModal';

// Constantes pour les dimensions
const { width: screenWidth } = Dimensions.get('window');
const DEFAULT_BUTTON_SIZE = 78;
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
  const [isModalVisible, setIsModalVisible] = useState(false);

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
      return <VideoOn width={24} height={24} />;
    } else if (completionStatus === 'unblocked') {
      return <VideoOff width={24} height={24} />;
    } else {
      return <MaterialIcons name="lock" size={24} color="#AAA" />;
    }
  }, [completionStatus]);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.container, buttonStyle, position]}
        onPress={() => {
          if (completionStatus === 'blocked') {
            setIsModalVisible(true);
          } else {
            onPress(id);
          }
        }}
      >
        {completionStatus === 'completed' ? (
          <VideoOn width={DEFAULT_BUTTON_SIZE} height={DEFAULT_BUTTON_SIZE} />
        ) : completionStatus === 'unblocked' ? (
          <VideoOff width={DEFAULT_BUTTON_SIZE} height={DEFAULT_BUTTON_SIZE} />
        ) : (
          <View style={styles.blockedContainer}>
            <VideoOff width={DEFAULT_BUTTON_SIZE} height={DEFAULT_BUTTON_SIZE} color="#7C6354" />
            <View style={styles.vectorContainer}>
              <LockMarron width={DEFAULT_BUTTON_SIZE * 0.55} height={DEFAULT_BUTTON_SIZE * 0.55} />
            </View>
          </View>
        )}
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>

      <CustomModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Vidéo verrouillée 🔒"
        message="Vous devez d'abord terminer les vidéos précédentes pour accéder à celle-ci."
        buttonText="Compris"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: DEFAULT_BUTTON_SIZE,
    height: DEFAULT_BUTTON_SIZE,
    borderRadius: DEFAULT_BUTTON_SIZE / 2,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  blockedContainer: {
    position: 'relative',
    width: DEFAULT_BUTTON_SIZE,
    height: DEFAULT_BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vectorContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    transform: [{ translateY: -2 }],
    zIndex: 2,
  },
  blockedButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  unlockedButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  completedButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  contentContainer: {
    position: 'absolute',
    top: DEFAULT_BUTTON_SIZE + 10,
    width: 180,
    backgroundColor: 'transparent',
    alignItems: 'center',
    left: -(180 - DEFAULT_BUTTON_SIZE) / 2,
  },
  title: {
    fontFamily: 'Arboria-Bold',
    fontSize: 18,
    color: '#FFF',
    maxWidth: 180,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 15,
    opacity: 0.8,
    lineHeight: 24,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoButton; 