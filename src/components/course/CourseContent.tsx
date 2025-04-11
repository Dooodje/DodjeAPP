import React, { useEffect, useRef, useCallback, memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CourseContent as CourseContentType, ContentType } from '../../types/course';
import { MediaError } from '../ui/MediaError';

const { width } = Dimensions.get('window');

interface CourseContentProps {
  content: CourseContentType;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (position: number) => void;
  onComplete: () => void;
}

const VideoPlayer = memo(({ 
  videoRef, 
  videoUrl, 
  isPlaying, 
  currentTime, 
  duration, 
  onPlayPause, 
  onSeek, 
  onComplete 
}: {
  videoRef: React.RefObject<Video>;
  videoUrl: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (position: number) => void;
  onComplete: () => void;
}) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }
  }, [isPlaying]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const handleError = useCallback((error: string) => {
    setError(error);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    if (videoRef.current) {
      videoRef.current.reloadAsync();
    }
  }, []);

  if (error) {
    return (
      <View style={styles.videoContainer}>
        <MediaError error={error} onRetry={handleRetry} />
      </View>
    );
  }

  return (
    <View style={styles.videoContainer}>
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.video}
        resizeMode="contain"
        useNativeControls
        isLooping={false}
        shouldPlay={isPlaying}
        positionMillis={currentTime * 1000}
        onPlaybackStatusUpdate={status => {
          if (status.isLoaded) {
            onSeek(status.positionMillis / 1000);
            if (status.didJustFinish) {
              onComplete();
            }
          } else if (status.error) {
            handleError('Une erreur est survenue lors du chargement de la vidéo');
          }
        }}
      />
      <View style={styles.videoControls}>
        <TouchableOpacity onPress={onPlayPause} style={styles.playButton}>
          <MaterialCommunityIcons
            name={isPlaying ? 'pause' : 'play'}
            size={32}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
});

export const CourseContent = memo<CourseContentProps>(({
  content,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  onComplete,
}) => {
  const videoRef = useRef<Video>(null);

  const renderContent = useCallback(() => {
    switch (content.type) {
      case 'video':
        return (
          <VideoPlayer
            videoRef={videoRef}
            videoUrl={content.videoUrl || ''}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={onPlayPause}
            onSeek={onSeek}
            onComplete={onComplete}
          />
        );

      case 'quiz':
        return (
          <View style={styles.quizContainer}>
            <Text style={styles.quizTitle}>Quiz</Text>
            <Text style={styles.quizDescription}>{content.description}</Text>
            {/* TODO: Implémenter le composant Quiz */}
          </View>
        );

      case 'exercise':
        return (
          <View style={styles.exerciseContainer}>
            <Text style={styles.exerciseTitle}>Exercice</Text>
            <Text style={styles.exerciseDescription}>{content.description}</Text>
            {/* TODO: Implémenter le composant Exercise */}
          </View>
        );

      default:
        return null;
    }
  }, [content, isPlaying, currentTime, duration, onPlayPause, onSeek, onComplete]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{content.title}</Text>
      {renderContent()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'Arboria-Bold',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  playButton: {
    marginRight: 16,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Arboria-Medium',
  },
  quizContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Arboria-Bold',
  },
  quizDescription: {
    fontSize: 16,
    color: '#A0A0A0',
    lineHeight: 24,
    fontFamily: 'Arboria-Book',
  },
  exerciseContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Arboria-Bold',
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#A0A0A0',
    lineHeight: 24,
    fontFamily: 'Arboria-Book',
  },
}); 