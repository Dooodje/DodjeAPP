import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useVideo } from '../../hooks/useVideo';
import { VideoControls } from './VideoControls';
import { VideoInfo } from './VideoInfo';
import { RelatedVideos } from './RelatedVideos';
import { VideoSettings } from './VideoSettings';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const { width } = Dimensions.get('window');

interface VideoPlayerProps {
  videoId: string;
  userId: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, userId }) => {
  const videoRef = useRef<Video>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('Auto');
  const [isSubtitleEnabled, setIsSubtitleEnabled] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const router = useRouter();

  const {
    currentVideo,
    relatedVideos,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    error,
    isFullscreen,
    showControls,
    thumbnailUrl,
    handleProgress,
    handleUnlock,
    handleVideoSelect,
    togglePlayback,
    toggleFullscreen,
    toggleControls,
    setPlaying,
    setCurrentTime,
    setDuration
  } = useVideo(videoId, userId);

  // Log IMMÉDIAT dans le rendu pour comprendre le problème
  console.log('📽️ RENDU VideoPlayer | isLoading:', isLoading, '| currentVideo:', currentVideo?.id, '| videoStarted:', videoStarted, '| isUnlocked:', currentVideo?.isUnlocked, '| thumbnailUrl:', thumbnailUrl);

  // Assurons-nous que videoStarted est toujours false quand on change de vidéo
  useEffect(() => {
    console.log('Video ID changée, réinitialisation de videoStarted à false');
    setVideoStarted(false);
  }, [videoId]);

  // Gérer la lecture/pause
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        console.log('Vidéo en lecture, masquer la miniature');
        setVideoStarted(true);
        videoRef.current.playAsync().catch(err => {
          console.error('Erreur lors de la lecture de la vidéo:', err);
          setVideoError('Erreur lors de la lecture de la vidéo');
        });
      } else {
        videoRef.current.pauseAsync().catch(err => {
          console.error('Erreur lors de la mise en pause de la vidéo:', err);
        });
      }
    }
  }, [isPlaying]);

  // Gérer le mode plein écran
  useEffect(() => {
    if (videoRef.current) {
      if (isFullscreen) {
        videoRef.current.presentFullscreenPlayer().catch(err => {
          console.error('Erreur lors du passage en plein écran:', err);
        });
      } else {
        videoRef.current.dismissFullscreenPlayer().catch(err => {
          console.error('Erreur lors de la sortie du plein écran:', err);
        });
      }
    }
  }, [isFullscreen]);

  // Gérer la vitesse de lecture
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.setRateAsync(playbackSpeed, true).catch(err => {
        console.error('Erreur lors du changement de vitesse de lecture:', err);
      });
    }
  }, [playbackSpeed]);

  // Effet de montage/démontage pour le debug
  useEffect(() => {
    console.log('🟢 VideoPlayer MONTÉ avec videoId=', videoId);
    
    return () => {
      console.log('🟡 VideoPlayer DÉMONTÉ pour videoId=', videoId);
    };
  }, []);

  // Si la miniature ne charge pas après 3 secondes, démarrer automatiquement la vidéo
  useEffect(() => {
    if (!videoStarted && currentVideo && currentVideo.isUnlocked) {
      console.log('⏱️ Configuration du timeout pour démarrage automatique en cas d\'échec de chargement de la miniature');
      const timer = setTimeout(() => {
        console.log('⏰ Timeout déclenché: démarrage automatique de la vidéo');
        setVideoStarted(true);
        setPlaying(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [videoStarted, currentVideo, setPlaying]);

  // Force le démarrage de la vidéo après le premier rendu
  useEffect(() => {
    if (currentVideo && currentVideo.isUnlocked && !videoStarted) {
      console.log('🚀 FORCER le démarrage de la vidéo sans attendre la miniature');
      // Démarrage quasi-immédiat
      setTimeout(() => {
        setVideoStarted(true);
        setPlaying(true);
      }, 100);
    }
  }, [currentVideo, videoStarted]);

  const handleBack = () => {
    router.back();
  };

  // Gérer les erreurs de chargement de vidéo
  const handleVideoError = (error: any) => {
    console.error('Erreur de lecture vidéo:', error);
    setVideoError('Une erreur est survenue lors du chargement de la vidéo');
  };

  // Démarrer la lecture de la vidéo
  const startVideo = () => {
    console.log('Démarrage de la vidéo, masquage de la miniature...');
    setVideoStarted(true);
    setPlaying(true);
  };

  if (isLoading && !currentVideo) {
    console.log('⏳ Affichage du spinner de chargement');
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error || videoError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || videoError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
            <Text style={styles.retryText}>Retourner en arrière</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!currentVideo) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Vidéo non trouvée</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
            <Text style={styles.retryText}>Retourner en arrière</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Afficher directement l'écran de déblocage si la vidéo n'est pas débloquée
  if (currentVideo && !currentVideo.isUnlocked) {
    console.log('🔒 Vidéo verrouillée, affichage de l\'écran de déblocage');
    return (
      <View style={styles.container}>
        <View style={styles.videoContainer}>
          {thumbnailUrl ? (
            <Image 
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Chargement...</Text>
            </View>
          )}
        </View>
        
        <View style={styles.content}>
          <VideoInfo
            video={currentVideo}
            onUnlock={handleUnlock}
          />
        </View>
      </View>
    );
  }

  // Vérifier si l'URL de la vidéo est valide et l'afficher avec un log
  const videoSource = currentVideo.videoUrl 
    ? { uri: currentVideo.videoUrl } 
    : undefined;
  
  console.log('🎬 Source vidéo:', videoSource?.uri);
  
  if (!videoSource) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>L'URL de la vidéo est invalide</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
            <Text style={styles.retryText}>Retourner en arrière</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreen]}>
      <View style={styles.videoContainer} onTouchStart={toggleControls}>
        {/* Vidéo en arrière-plan, masquée jusqu'à ce qu'on clique sur play */}
        <Video
          ref={videoRef}
          source={videoSource}
          style={styles.video}
          useNativeControls={false}
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          shouldPlay={videoStarted && isPlaying}
          isMuted={false}
          onError={handleVideoError}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded) {
              setCurrentTime(status.positionMillis / 1000);
              setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
              if (status.positionMillis > 0 && status.durationMillis) {
                handleProgress((status.positionMillis / status.durationMillis) * 100);
              }
            }
          }}
        />

        {/* Overlay de miniature avec bouton play, visible jusqu'à ce qu'on clique */}
        {!videoStarted && (
          <View style={styles.thumbnailContainer}>
            {/* Image de miniature (fixe, pas d'animation) */}
            {thumbnailUrl ? (
              <Image 
                source={{ uri: thumbnailUrl }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>Chargement de la vidéo...</Text>
              </View>
            )}
            
            {/* Bouton play centré sur la miniature */}
            <TouchableOpacity 
              style={styles.playButtonOverlay}
              onPress={() => {
                console.log('Démarrage de la vidéo sur clic du bouton play');
                setVideoStarted(true);
                setPlaying(true);
              }}
            >
              <MaterialCommunityIcons name="play-circle" size={72} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
        
        <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
          <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        {showControls && (
          <VideoControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            isFullscreen={isFullscreen}
            onPlayPause={togglePlayback}
            onSeek={(time) => {
              if (videoRef.current) {
                videoRef.current.setPositionAsync(time * 1000).catch(err => {
                  console.error('Erreur lors du changement de position:', err);
                });
              }
            }}
            onFullscreen={toggleFullscreen}
            onBack={() => {}}
            onSettings={() => setShowSettings(true)}
          />
        )}
      </View>

      <View style={styles.content}>
        <VideoInfo
          video={currentVideo}
          onUnlock={handleUnlock}
        />
        {relatedVideos && relatedVideos.length > 0 && (
          <RelatedVideos
            videos={relatedVideos}
            onVideoSelect={handleVideoSelect}
          />
        )}
      </View>

      <VideoSettings
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        quality={quality}
        onQualityChange={setQuality}
        playbackSpeed={playbackSpeed}
        onPlaybackSpeedChange={setPlaybackSpeed}
        isSubtitleEnabled={isSubtitleEnabled}
        onSubtitleToggle={() => setIsSubtitleEnabled(!isSubtitleEnabled)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  fullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#059212',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  thumbnailContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  placeholderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 15,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    backgroundColor: '#059212',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 