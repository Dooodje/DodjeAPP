import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Image, Animated } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setFullscreen } from '../../store/slices/videoSlice';
import { useVideo } from '../../hooks/useVideo';
import { VideoControls } from './VideoControls';
import { VideoInfo } from './VideoInfo';
import { RelatedVideos } from './RelatedVideos';
import { VideoSettings } from './VideoSettings';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width, height } = Dimensions.get('window');

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
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const dispatch = useDispatch();

  // Animation de pulsation pour le bouton play
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

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
    if (videoRef.current && videoStarted) {
      if (isPlaying) {
        console.log('Vidéo en lecture, masquer la miniature');
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
  }, [isPlaying, videoStarted]);

  // Gérer le mode plein écran
  useEffect(() => {
    if (videoRef.current) {
      if (isFullscreen) {
        // Passer en mode paysage lorsqu'on entre en plein écran
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(err => {
          console.error('Erreur lors du passage en mode paysage:', err);
        });
        
        videoRef.current.presentFullscreenPlayer().catch(err => {
          console.error('Erreur lors du passage en plein écran:', err);
        });
      } else {
        // Revenir en mode portrait lorsqu'on quitte le plein écran
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).catch(err => {
          console.error('Erreur lors du retour en mode portrait:', err);
        });
        
        videoRef.current.dismissFullscreenPlayer().catch(err => {
          console.error('Erreur lors de la sortie du plein écran:', err);
        });
      }
    }
  }, [isFullscreen]);

  // Nettoyer et réinitialiser l'orientation lors du démontage du composant
  useEffect(() => {
    return () => {
      // Réinitialiser l'orientation en portrait lorsqu'on quitte la page vidéo
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).catch(err => {
        console.error('Erreur lors de la réinitialisation en mode portrait:', err);
      });
    };
  }, []);

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

  // Démarrage automatique désactivé - La vidéo ne démarre qu'au clic sur le bouton play

  const handleBack = () => {
    router.back();
  };

  // Gérer les erreurs de chargement de vidéo
  const handleVideoError = (error: any) => {
    console.error('Erreur de lecture vidéo:', error);
    setVideoError('Une erreur est survenue lors du chargement de la vidéo');
  };

  // Démarrer la lecture de la vidéo uniquement au clic sur le bouton play
  const startVideo = () => {
    console.log('Démarrage de la vidéo au clic sur le bouton play');
    setVideoStarted(true);
    setPlaying(true);
    
    // Passer en mode plein écran immédiatement
    setTimeout(() => {
      if (videoRef.current) {
        console.log('Passage en mode plein écran automatique');
        // Activer le plein écran via le state
        dispatch(setFullscreen(true));
        // Forcer également l'API native de la vidéo pour le mode plein écran
        videoRef.current.presentFullscreenPlayer().catch(err => {
          console.error('Erreur lors du passage en plein écran:', err);
        });
      }
    }, 300); // Petit délai pour permettre à la vidéo de se charger correctement
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
  // TEMPORAIREMENT DÉSACTIVÉ: on considère que toutes les vidéos sont débloquées pour les tests
  /*
  if (currentVideo && !currentVideo.isUnlocked) {
    console.log('🔒 Vidéo verrouillée, affichage de l\'écran de déblocage');
    return (
      <View style={styles.container}>
        <View style={styles.videoContainer}>
          {thumbnailUrl ? (
            <View style={styles.thumbnailContainer}>
              <Image 
                source={{ uri: thumbnailUrl }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
                <MaterialCommunityIcons name="close" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.lockedOverlay} onPress={handleUnlock}>
                <MaterialCommunityIcons name="lock" size={50} color="white" />
                <Text style={styles.lockedText}>Touchez pour débloquer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Chargement...</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
                <MaterialCommunityIcons name="close" size={24} color="white" />
              </TouchableOpacity>
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
  */

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
        {/* Si la vidéo n'a pas démarré, afficher la miniature avec un bouton play */}
        {!videoStarted && thumbnailUrl ? (
          <View style={styles.thumbnailContainer}>
            <Image 
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton} onPress={startVideo}>
              <Animated.View style={{ 
                transform: [{ scale: pulseAnim }],
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MaterialCommunityIcons name="play" size={70} color="white" />
              </Animated.View>
            </TouchableOpacity>
          </View>
        ) : !videoStarted ? (
          <View style={styles.placeholderContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.placeholderText}>Chargement...</Text>
            <TouchableOpacity style={styles.playButton} onPress={startVideo}>
              <Animated.View style={{ 
                transform: [{ scale: pulseAnim }],
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MaterialCommunityIcons name="play" size={70} color="white" />
              </Animated.View>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Vidéo en arrière-plan, masquée jusqu'à ce qu'on clique sur play */}
        <Video
          ref={videoRef}
          source={videoSource}
          style={[styles.video, !videoStarted && { opacity: 0 }]}
          useNativeControls={false}
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          shouldPlay={videoStarted && isPlaying}
          onError={handleVideoError}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded) {
              setCurrentTime(status.positionMillis / 1000);
              setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
              
              // Mettre à jour la progression si la vidéo est en lecture et a progressé
              if (status.positionMillis > 0 && !status.didJustFinish) {
                const progress = status.durationMillis
                  ? (status.positionMillis / status.durationMillis) * 100
                  : 0;
                handleProgress(progress);
              }
            }
          }}
        />
        
        {/* Bouton de fermeture affiché uniquement lorsque la vidéo est en cours de lecture */}
        {videoStarted && showControls && (
          <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
            <MaterialCommunityIcons name="close" size={24} color="white" />
          </TouchableOpacity>
        )}

        {/* Contrôles de lecture (affiché uniquement pendant la lecture et quand showControls est true) */}
        {videoStarted && showControls && (
          <VideoControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            isFullscreen={isFullscreen}
            onPlayPause={togglePlayback}
            onSeek={(time) => {
              if (videoRef.current) {
                videoRef.current.setPositionAsync(time * 1000).catch(err => {
                  console.error('Erreur lors de la recherche:', err);
                });
              }
            }}
            onFullscreen={toggleFullscreen}
            onBack={handleBack}
            onSettings={() => setShowSettings(true)}
          />
        )}
        
        {/* Ombre en bas de la vidéo pour améliorer la visibilité du texte */}
        {videoStarted && (
          <View style={styles.videoOverlay} pointerEvents="none" />
        )}
      </View>

      {/* Paramètres de lecture (affiché uniquement quand showSettings est true) */}
      {videoStarted && showSettings && (
        <VideoSettings
          visible={showSettings}
          playbackSpeed={playbackSpeed}
          quality={quality}
          isSubtitleEnabled={isSubtitleEnabled}
          onPlaybackSpeedChange={setPlaybackSpeed}
          onQualityChange={setQuality}
          onSubtitleToggle={() => setIsSubtitleEnabled(!isSubtitleEnabled)}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Informations sur la vidéo - affichées en permanence sauf en mode plein écran */}
      {!isFullscreen && (
        <View style={styles.content}>
          <VideoInfo video={currentVideo} />
          {/* Vidéos connexes (affichées uniquement quand la vidéo a démarré) */}
          {videoStarted && (
            <RelatedVideos videos={relatedVideos} onVideoSelect={handleVideoSelect} />
          )}
        </View>
      )}
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
    zIndex: 999,
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
    backgroundColor: '#0A0400',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#06D001',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    fontSize: 16,
    color: '#fff',
  },
  thumbnailContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 10,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 18,
  },
  playButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 12,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 11,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  lockedText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
  videoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
}); 