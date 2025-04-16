import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Video } from '../../types/video';

interface NextVideoProps {
  video: Video | null;
  onPress: (videoId: string) => void;
  onUnlock?: () => void;
}

export const NextVideo: React.FC<NextVideoProps> = ({ video, onPress, onUnlock }) => {
  if (!video) {
    console.log('NextVideo: video est null');
    return null;
  }

  if (!video.id) {
    console.log('NextVideo: video.id est manquant', video);
    return null;
  }

  console.log('NextVideo: Affichage de la vidéo suivante:', video.id, video.title);

  // Formater la durée en minutes
  const formatDuration = (seconds: number): string => {
    if (!seconds) return '0 minute';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  const isLocked = !video.isUnlocked;
  const durationText = typeof video.duration === 'number' 
    ? formatDuration(video.duration) 
    : typeof video.duration === 'string' 
      ? video.duration 
      : '0 minute';

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Vidéo suivante</Text>
      
      <TouchableOpacity 
        style={styles.nextVideoCard}
        onPress={() => video.id && onPress(video.id)}
        disabled={isLocked}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {video.title || 'Vidéo sans titre'}
          </Text>
          <Text style={styles.videoDuration}>
            {durationText} • {video.description || 'Aucune description'}
          </Text>
        </View>
        
        {isLocked ? (
          <TouchableOpacity 
            style={styles.unlockButton} 
            onPress={onUnlock}
          >
            <Text style={styles.unlockButtonText}>Débloquer maintenant</Text>
            <View style={styles.coinContainer}>
              <Text style={styles.coinText}>100</Text>
              <MaterialCommunityIcons name="circle" size={16} color="#F3FF90" />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.watchButton} 
            onPress={() => video.id && onPress(video.id)}
          >
            <Text style={styles.watchButtonText}>Lecture</Text>
            <MaterialCommunityIcons name="play" size={16} color="#000" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.dodjeOneButton}>
          <Text style={styles.dodjeOneButtonText}>Dodje One</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  nextVideoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  contentContainer: {
    marginBottom: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  videoDuration: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  unlockButton: {
    backgroundColor: '#9BEC00',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  unlockButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinText: {
    color: '#000000',
    fontWeight: 'bold',
    marginRight: 4,
  },
  watchButton: {
    backgroundColor: '#9BEC00',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  watchButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  dodjeOneButton: {
    backgroundColor: '#242424',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dodjeOneButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
}); 