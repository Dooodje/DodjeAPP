import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useParcoursVideos } from '@/hooks/useParcoursVideos';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { UserVideo } from '@/types/video';

// Définir des couleurs personnalisées pour l'interface
const appColors = {
  primary: '#06D001',
  dark: '#333333',
  white: '#FFFFFF',
  green: {
    500: '#06D001'
  },
  yellow: {
    500: '#F3FF90'
  },
  gray: {
    200: '#EEEEEE',
    400: '#B0B0B0',
    500: '#888888',
    600: '#666666'
  },
  error: '#FF5252'
};

interface ParcoursVideoListProps {
  parcoursId: string;
}

export const ParcoursVideoList: React.FC<ParcoursVideoListProps> = ({ parcoursId }) => {
  const { videos, loading, error, refresh, completedVideos, totalVideos } = useParcoursVideos(parcoursId);
  const router = useRouter();

  const handleVideoPress = (videoId: string) => {
    router.push(`/video/${videoId}`);
  };

  const renderVideoStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return <FontAwesome5 name="check-circle" size={20} color={appColors.green[500]} />;
      case 'in_progress':
        return <FontAwesome5 name="play-circle" size={20} color={appColors.yellow[500]} />;
      default:
        return <FontAwesome5 name="circle" size={20} color={appColors.gray[400]} />;
    }
  };

  const renderVideo = ({ item }: { item: UserVideo }) => (
    <TouchableOpacity
      style={styles.videoItem}
      onPress={() => handleVideoPress(item.videoId)}
    >
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{`Vidéo ${item.ordre}`}</Text>
        <Text style={styles.videoDuration}>
          {formatDuration(item.progress?.duration || 0)}
        </Text>
      </View>
      <View style={styles.statusContainer}>
        {renderVideoStatus(item.status)}
      </View>
    </TouchableOpacity>
  );

  // Format seconds to mm:ss
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={appColors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressText}>
          Progression: {completedVideos}/{totalVideos} vidéos terminées
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0}%` }
            ]} 
          />
        </View>
      </View>
      
      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.videoId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune vidéo disponible pour ce parcours</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: appColors.dark,
  },
  progressBar: {
    height: 8,
    backgroundColor: appColors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: appColors.primary,
    borderRadius: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: appColors.white,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: appColors.dark,
  },
  videoDuration: {
    fontSize: 14,
    color: appColors.gray[600],
  },
  statusContainer: {
    marginLeft: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: appColors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: appColors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: appColors.white,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: appColors.gray[500],
    fontSize: 16,
    marginTop: 20,
  },
});

export default ParcoursVideoList; 