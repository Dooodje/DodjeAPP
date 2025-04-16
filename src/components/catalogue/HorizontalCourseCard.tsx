import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Parcours } from '../../types/firebase';

interface HorizontalCourseCardProps {
  parcours: Parcours;
  isLocked?: boolean;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = 160;
const CARD_HEIGHT = 220;

const HorizontalCourseCard: React.FC<HorizontalCourseCardProps> = ({ 
  parcours, 
  isLocked = false, 
  onPress 
}) => {
  const themeColor = useMemo(() => {
    return parcours.theme === 'bourse' ? '#059212' : '#9BEC00';
  }, [parcours.theme]);

  const levelLabel = useMemo(() => {
    switch (parcours.level) {
      case 'debutant':
        return 'Débutant';
      case 'avance':
        return 'Avancé';
      case 'expert':
        return 'Expert';
      default:
        return parcours.level;
    }
  }, [parcours.level]);

  // Obtenir le nombre de vidéos
  const videosCount = useMemo(() => {
    // Utiliser videoCount s'il existe, sinon compter les vidéos
    if (parcours.videoCount !== undefined) {
      return parcours.videoCount;
    }
    
    // Vérifier si videoIds existe
    if (parcours.videoIds && Array.isArray(parcours.videoIds)) {
      return parcours.videoIds.length;
    }
    
    // Fallback: compter les vidéos dans le tableau videos
    if (!parcours.videos || !Array.isArray(parcours.videos)) {
      return 0;
    }
    return parcours.videos.length;
  }, [parcours]);

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: parcours.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Indicateur de thème */}
        <View 
          style={[
            styles.themeIndicator, 
            { backgroundColor: themeColor }
          ]}
        />
        
        {isLocked && (
          <View style={styles.lockedOverlay}>
            <Ionicons name="lock-closed" size={20} color="#FFF" />
          </View>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {parcours.titre || parcours.title}
        </Text>
        
        <View style={styles.metaContainer}>
          <Text style={styles.levelText}>
            {levelLabel}
          </Text>
          
          <Text style={styles.videosCount}>
            {videosCount} vidéo{videosCount > 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  themeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Arboria-Bold',
    fontSize: 14,
    color: '#FFF',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  levelText: {
    fontFamily: 'Arboria-Book',
    fontSize: 12,
    color: '#CCC',
  },
  videosCount: {
    fontFamily: 'Arboria-Book',
    fontSize: 12,
    color: '#999',
  },
});

export default HorizontalCourseCard; 