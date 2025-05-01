import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Image, Animated } from 'react-native';
import { Video, ResizeMode, VideoFullscreenUpdateEvent, Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setFullscreen, resetVideo } from '../../store/slices/videoSlice';
import { useVideo } from '../../hooks/useVideo';
import { VideoControls } from './VideoControls';
import { VideoInfo } from './VideoInfo';
import { RelatedVideos } from './RelatedVideos';
import { VideoSettings } from './VideoSettings';
import { NextVideo } from '../../components/NextVideo';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import * as ScreenOrientation from 'expo-screen-orientation';
import { videoService } from '../../services/video';
import { useVideoTracking } from '../../hooks/useVideoTracking';
import { VideoProgress } from '../../types/video';
import { videoTrackingService } from '../../services/firebase/videoTrackingService';

const { width, height } = Dimensions.get('window');

// Constantes pour les états de plein écran d'Expo AV
const FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT = 0;
const FULLSCREEN_UPDATE_PLAYER_DID_PRESENT = 1;
const FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS = 2;
const FULLSCREEN_UPDATE_PLAYER_DID_DISMISS = 3;

interface VideoPlayerProps {
  videoId: string;
  userId: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId: initialVideoId, userId }) => {
  // État interne pour l'ID de la vidéo (permet de changer de vidéo sans recharger la page)
  const [currentVideoId, setCurrentVideoId] = useState(initialVideoId);
  
  const videoRef = useRef<Video>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('Auto');
  const [isSubtitleEnabled, setIsSubtitleEnabled] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const [savedPosition, setSavedPosition] = useState<number>(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const dispatch = useDispatch();
  const [prevIsFullscreen, setPrevIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

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

  // Get data from useVideo hook but rename the setter functions
  const {
    currentVideo,
    relatedVideos,
    nextVideo,
    isLoading,
    error,
    isFullscreen,
    showControls,
    thumbnailUrl,
    handleProgress: originalHandleProgress,
    handleUnlock,
    handleVideoSelect: originalHandleVideoSelect,
    togglePlayback: originalTogglePlayback,
    toggleFullscreen,
    toggleControls,
    setCurrentTime: updateReduxCurrentTime,
    setDuration: updateReduxDuration
  } = useVideo(currentVideoId, userId);

  // Add the video tracking hook
  const videoTracking = useVideoTracking(
    currentVideo?.id || initialVideoId,
    {
      courseId: currentVideo?.courseId || '',
      videoTitle: currentVideo?.title || currentVideo?.titre || '',
      videoSection: ''
    },
    1000 // Track every second for more accurate progress
  );

  // Log pour faciliter le débogage
  useEffect(() => {
    console.log(`🔄 VideoPlayer: ID vidéo actuelle changée: ${currentVideoId}`);
  }, [currentVideoId]);

  // Handler personnalisé pour charger directement une nouvelle vidéo sans navigation
  const handleVideoSelect = useCallback((id: string) => {
    if (id) {
      console.log('🎬 Chargement direct de la vidéo suivante, ID:', id);
      
      // Arrêter la lecture et réinitialiser l'état
      if (videoRef.current) {
        videoRef.current.pauseAsync().catch(err => {
          console.error('Erreur lors de la mise en pause:', err);
        });
      }
      
      // Réinitialiser les états pour la nouvelle vidéo
      setVideoStarted(false);
      setIsPlaying(false);
      setSavedPosition(0);
      setVideoError(null);
      
      // Changer l'ID de la vidéo actuelle - cela déclenchera un rechargement via useVideo
      setCurrentVideoId(id);
      
      // Mettre à jour l'URL dans le navigateur sans rechargement (pour rendre l'historique cohérent)
      try {
        window.history.pushState({videoId: id}, '', `/video/${id}`);
        console.log('✅ URL mise à jour avec le nouvel ID sans rechargement');
      } catch (historyErr) {
        console.warn('⚠️ Impossible de mettre à jour l\'URL:', historyErr);
      }
    } else {
      console.error('❌ ID vidéo manquant dans handleVideoSelect');
    }
  }, []);

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

  // Gérer le démarrage de la vidéo
  const startVideo = useCallback(async () => {
    try {
      console.log('Démarrage de la vidéo en plein écran paysage');
      
      // Vérifier si le composant est toujours monté
      if (!videoRef.current) {
        console.log('Le composant vidéo n\'est plus monté');
        return;
      }

      // Charger la dernière position de lecture
      if (currentVideo?.lastWatchedPosition) {
        console.log(`Reprise de la lecture à ${currentVideo.lastWatchedPosition}s`);
        await videoRef.current.setPositionAsync(currentVideo.lastWatchedPosition * 1000);
      }

      setVideoStarted(true);
      setIsPlaying(true);
      
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT)
          .catch(async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
          });
      } catch (orientationError) {
        console.log('Impossible de forcer l\'orientation:', orientationError);
      }
      
      dispatch(setFullscreen(true));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (videoRef.current) {
        await videoRef.current.presentFullscreenPlayer()
          .catch(async (err) => {
            console.log('Erreur lors du passage en plein écran, nouvelle tentative:', err);
            await new Promise(resolve => setTimeout(resolve, 500));
            if (videoRef.current) {
              return videoRef.current.presentFullscreenPlayer();
            }
          });
      }
    } catch (error) {
      console.error('Erreur lors du démarrage de la vidéo:', error);
      setVideoStarted(true);
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.playAsync().catch(console.error);
      }
    }
  }, [dispatch, currentVideo]);

  // Sauvegarder la progression de la vidéo
  const saveVideoProgress = useCallback(async () => {
    if (!videoRef.current || !userId || !currentVideo?.id) return;

    try {
      // Vérifier d'abord le statut existant dans Firestore
      const existingProgress = await videoService.getVideoProgress(userId, currentVideo.id);
      
      const status = await videoRef.current.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        const currentPositionInSeconds = status.positionMillis / 1000;
        const completionPercentage = (currentPositionInSeconds / status.durationMillis) * 100;
        
        // Garder le statut 'completed' s'il était déjà atteint
        let completionStatus: VideoProgress['completionStatus'] = 
          existingProgress?.completionStatus === 'completed' ? 'completed' : 'unblocked';
        
        // Sinon, vérifier si on atteint le seuil de 90%
        if (completionPercentage >= 90) {
          completionStatus = 'completed';
        }

        console.log(`Sauvegarde de la position: ${currentPositionInSeconds.toFixed(2)}s (${completionPercentage.toFixed(1)}%), statut: ${completionStatus}`);
        
        await videoService.updateVideoProgress(userId, currentVideo.id, {
          currentTime: currentPositionInSeconds,
          completionStatus
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la progression:', error);
    }
  }, [userId, currentVideo?.id]);

  // Gérer les mises à jour de l'état du plein écran (entrée/sortie)
  const onFullscreenUpdate = useCallback(
    async (event: VideoFullscreenUpdateEvent) => {
      console.log(`Mise à jour du plein écran: ${event.fullscreenUpdate}`);

      if (event.fullscreenUpdate === FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT) {
        try {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT)
            .catch(async () => {
              await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
            });
        } catch (orientationError) {
          console.log('Impossible de forcer l\'orientation:', orientationError);
        }
      } else if (event.fullscreenUpdate === FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS) {
        try {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
            .catch(async () => {
              await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
            });
        } catch (orientationError) {
          console.log('Impossible de forcer l\'orientation portrait:', orientationError);
        }

        // Sauvegarder la progression uniquement à la sortie du plein écran
        if (videoRef.current && userId && currentVideo?.id) {
          try {
            const status = await videoRef.current.getStatusAsync();
            if (status.isLoaded && status.durationMillis) {
              const currentPositionInSeconds = status.positionMillis / 1000;
              const durationInSeconds = status.durationMillis / 1000;
              
              console.log(`Sauvegarde de la position finale: ${currentPositionInSeconds.toFixed(2)}s/${durationInSeconds.toFixed(2)}s`);
              
              await videoTrackingService.updateProgress(
                userId,
                currentVideo.id,
                currentPositionInSeconds,
                durationInSeconds,
                {
                  courseId: currentVideo.courseId || '',
                  videoTitle: currentVideo.title || currentVideo.titre || '',
                  videoSection: ''
                }
              );
            }
          } catch (error) {
            console.error('Erreur lors de la sauvegarde de la progression:', error);
          }
        }
        
        dispatch(setFullscreen(false));
        setIsPlaying(false);
      } else if (event.fullscreenUpdate === FULLSCREEN_UPDATE_PLAYER_DID_DISMISS) {
        console.log('Sortie du mode plein écran détectée');
        
        if (videoRef.current) {
          try {
            await videoRef.current.pauseAsync();
          } catch (pauseError) {
            console.log('Erreur lors de la mise en pause:', pauseError);
          }
        }
        
        setVideoStarted(false);
        setIsPlaying(false);
      }
    },
    [dispatch, userId, currentVideo?.id]
  );

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
    console.log('🟢 VideoPlayer MONTÉ avec videoId=', currentVideoId);
    
    return () => {
      console.log('🟡 VideoPlayer DÉMONTÉ pour videoId=', currentVideoId);
    };
  }, [currentVideoId]);

  const handleBack = () => {
    router.back();
  };

  // Gérer les erreurs de chargement de vidéo
  const handleVideoError = (error: any) => {
    console.error('Erreur de lecture vidéo:', error);
    setVideoError('Une erreur est survenue lors du chargement de la vidéo');
  };

  // Nettoyer lors du démontage du composant
  useEffect(() => {
    return () => {
      // Sauvegarder la progression avant de démonter
      saveVideoProgress();
      
      // Réinitialiser l'orientation
      const resetOrientation = async () => {
        try {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
            .catch(async () => {
              try {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
              } catch {
                await ScreenOrientation.unlockAsync();
              }
            });
        } catch (error) {
          console.log('Erreur lors de la réinitialisation de l\'orientation:', error);
        }
      };
      
      resetOrientation();
    };
  }, [saveVideoProgress]);

  // Gérer l'état de la vidéo lorsque l'utilisateur quitte le mode plein écran via le bouton back
  useEffect(() => {
    if (prevIsFullscreen && !isFullscreen) {
      console.log('Sortie du mode plein écran via le state Redux détectée');
      
      const handleFullscreenExit = async () => {
        try {
          // Mettre en pause la vidéo
          if (videoRef.current) {
            await videoRef.current.pauseAsync();
          }
          
          // Sauvegarder la position actuelle
          if (videoRef.current) {
            const status = await videoRef.current.getStatusAsync();
            if (status.isLoaded) {
              const currentPositionInSeconds = status.positionMillis / 1000;
              console.log(`Sauvegarde de la position lors de la sortie du plein écran: ${currentPositionInSeconds.toFixed(2)}s`);
              setSavedPosition(currentPositionInSeconds);
            }
          }
          
          // Revenir à l'état initial avec la miniature
          setVideoStarted(false);
          setIsPlaying(false);
          
          // S'assurer que l'orientation est en portrait
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
            .catch(async () => {
              await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
            });
        } catch (error) {
          console.log('Erreur lors de la gestion de la sortie du plein écran:', error);
        }
      };

      handleFullscreenExit();
    }
    
    setPrevIsFullscreen(isFullscreen);
  }, [isFullscreen, prevIsFullscreen, videoRef]);

  // Au début du composant, ajouter un useEffect pour logger la vidéo suivante
  useEffect(() => {
    if (nextVideo) {
      console.log('📱 Vidéo suivante disponible:', nextVideo.id, nextVideo.title);
      console.log('📱 Thumbnail de la vidéo suivante:', nextVideo.thumbnail);
      console.log('📱 Durée de la vidéo suivante:', nextVideo.duree);
    } else {
      console.log('📱 Aucune vidéo suivante disponible');
    }
  }, [nextVideo]);

  // Supprimer les mises à jour continues de la progression
  const onPlaybackStatusUpdate = useCallback((status: any) => {
    if (status.isLoaded) {
      const newCurrentTime = status.positionMillis / 1000;
      const newDuration = status.durationMillis ? status.durationMillis / 1000 : 0;
      
      // Mise à jour locale uniquement pour l'affichage
      setCurrentTime(newCurrentTime);
      setDuration(newDuration);
      
      // Ne plus mettre à jour Redux à chaque frame
      // updateReduxCurrentTime(newCurrentTime);
      // updateReduxDuration(newDuration);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        saveVideoProgress();
      }
    }
  }, []);

  // Initialiser le son au montage du composant
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('Configuration audio initialisée avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation audio:', error);
      }
    };

    initializeAudio();
  }, []);

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

  // Vérifier si l'URL de la vidéo est valide 
  const videoSource = currentVideo?.videoUrl 
    ? { uri: currentVideo.videoUrl } 
    : undefined;
  
  console.log('🎬 Source vidéo:', videoSource?.uri);

  // URL de fallback pour une vidéo de démonstration
  const fallbackUrl = 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4';
  const effectiveVideoSource = videoSource || { uri: fallbackUrl };
  
  console.log('🎬 Source vidéo effective:', effectiveVideoSource.uri);
  
  // Forcer l'URL de miniature pour tester - à supprimer en production
  const customThumbnail = "https://i.imgur.com/example-thumbnail.jpg"; // Remplacer par l'URL réelle du caméléon
  const useThumbnail = thumbnailUrl || customThumbnail;
  
  if (!videoSource) {
    console.warn('⚠️ URL vidéo originale non définie, utilisation de la vidéo de fallback:', fallbackUrl);
  }

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreen]}>
      <View style={styles.videoContainer} onTouchStart={toggleControls}>
        {/* Si la vidéo n'a pas démarré, afficher la miniature avec un bouton play */}
        {!videoStarted && useThumbnail ? (
          <View style={styles.thumbnailContainer}>
            <Image 
              source={{ uri: useThumbnail }}
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
          source={effectiveVideoSource}
          style={[styles.video, !videoStarted && { opacity: 0, height: 0 }]}
          useNativeControls={false}
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          shouldPlay={videoStarted && isPlaying}
          isMuted={false}
          volume={1.0}
          onError={handleVideoError}
          onFullscreenUpdate={onFullscreenUpdate}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
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
            onPlayPause={originalTogglePlayback}
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
          {/* Titre principal de la vidéo */}
          <Text style={styles.title} numberOfLines={2}>
            {currentVideo?.titre || currentVideo?.title || "Titre non disponible"}
          </Text>
        
          {/* Affichage de la durée */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ color: '#FFFFFF' }}>
              Durée : {currentVideo?.duree || (typeof currentVideo?.duration === 'number' 
                ? `${Math.floor(currentVideo.duration / 60)} minutes` 
                : currentVideo?.duration || '5 minutes')}
            </Text>
          </View>
          
          {/* Section Résumé */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#FFFFFF',
              marginBottom: 8,
            }}>Résumé</Text>
            <Text style={{
              color: '#FFFFFF',
              lineHeight: 22,
            }}>{currentVideo.description}</Text>
          </View>
          
          {/* Section vidéo suivante */}
          {nextVideo ? (
            <>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#FFFFFF',
                marginTop: 24,
                marginBottom: 8,
              }}>Vidéo suivante</Text>
              <NextVideo 
                video={nextVideo} 
                onNavigate={handleVideoSelect}
                courseId={currentVideo?.courseId}
              />
            </>
          ) : (
            <Text style={{
              fontSize: 16,
              color: '#AAAAAA',
              marginTop: 24,
              marginBottom: 8,
            }}>Aucune vidéo suivante disponible</Text>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  },
  closeButton: {
    position: 'absolute',
    top: 45,
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
}); 