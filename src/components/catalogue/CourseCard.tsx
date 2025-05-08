import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Parcours } from '../../types/firebase';
import { useRouter } from 'expo-router';

interface CourseCardProps {
  parcours: Parcours;
  isLocked?: boolean;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 24; // 2 colonnes avec padding

const CourseCard: React.FC<CourseCardProps> = ({ parcours, isLocked = false, onPress }) => {
  const router = useRouter();

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
    // Utiliser videoCount s'il existe
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

  const handlePress = () => {
    if (isLocked) return;
    
    if (onPress) {
      onPress();
    } else {
      router.push(`/course/${parcours.id}?from=catalogue`);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: parcours.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        {isLocked && (
          <View style={styles.lockedOverlay}>
            <Ionicons name="lock-closed" size={24} color="#FFF" />
          </View>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {parcours.titre || parcours.title}
        </Text>
        
        <View style={styles.infoContainer}>
          <View style={[styles.themeIndicator, { backgroundColor: themeColor }]}>
            <Text style={styles.themeText}>
              {parcours.theme === 'bourse' ? 'Bourse' : 'Crypto'}
            </Text>
          </View>
          
          <Text style={styles.levelText}>
            {levelLabel}
          </Text>
        </View>
        
        <Text style={styles.videosCount}>
          {videosCount} vidéo{videosCount > 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
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
  },
  title: {
    fontFamily: 'Arboria-Bold',
    fontSize: 16,
    color: '#FFF',
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  themeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  themeText: {
    fontFamily: 'Arboria-Book',
    fontSize: 12,
    color: '#000',
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
    marginTop: 4,
  },
});

export default CourseCard; 