import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoInfoProps } from '../../types/video';

export const VideoInfo: React.FC<VideoInfoProps> = ({ video, onUnlock }) => {
  const formatDuration = (duration: number | string): string => {
    // Si la durée est une chaîne de caractères
    if (typeof duration === 'string') {
      // Si la durée est déjà au format MM:SS, l'utiliser directement
      if (duration.includes(':')) {
        return duration;
      }
      
      // Si c'est une chaîne mais pas au format MM:SS, essayer de la convertir en nombre
      const durationNumber = parseFloat(duration);
      if (!isNaN(durationNumber)) {
        if (durationNumber <= 0) return '00:00';
        
        // Convertir en format MM:SS
        const minutes = Math.floor(durationNumber / 60);
        const seconds = Math.floor(durationNumber % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      
      // En cas d'échec, afficher une valeur par défaut
      return '00:00';
    }
    
    // Si la durée est un nombre (en secondes)
    if (isNaN(duration) || duration <= 0) {
      return '00:00';
    }
    
    // Convertir en format MM:SS
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{video.title}</Text>
      </View>

      <View style={styles.metadataContainer}>
        <View style={styles.metadataItem}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#FFFFFF" />
          <Text style={styles.metadataText}>
            Durée : {formatDuration(video.duration)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Résumé</Text>
        <Text style={styles.description}>{video.description}</Text>
      </View>

      {onUnlock && !video.isUnlocked && (
        <View style={styles.unlockContainer}>
          <Text style={styles.unlockTitle}>Cette vidéo n'est pas débloquée</Text>
          <TouchableOpacity style={styles.unlockButton} onPress={onUnlock}>
            <MaterialCommunityIcons name="lock-open" size={20} color="#FFFFFF" />
            <Text style={styles.unlockText}>Débloquer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'rgba(10, 4, 0, 0.8)',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  metadataContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 8,
    borderRadius: 5,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metadataText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 12,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 22,
  },
  unlockContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  unlockTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  unlockButton: {
    backgroundColor: '#059212',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  unlockText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 