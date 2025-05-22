import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Image, Animated, ScrollView } from 'react-native';
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
import { VideoProgress, VideoCompletionStatus } from '@/types/video';
import { videoTrackingService } from '../../services/firebase/videoTrackingService';
import { useVideoAutoNext } from '@/hooks/useVideoAutoNext';

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

interface CurrentVideo {
  id: string;
  courseId: string;
  section?: string;
  title?: string;
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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

  // Utiliser le hook useVideoAutoNext
  const {
    nextVideoId,
    isLastVideo,
    quizId,
    countdown
  } = useVideoAutoNext({
    videoId: currentVideoId,
    parcoursId: currentVideo?.courseId || '',
    isCompleted: currentVideo?.progress?.completionStatus === 'completed' || false
  });

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

  // Changer de vidéo
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
      
      // Mettre à jour l'URL dans le navigateur sans rechargement
      try {
        router.push(`/video/${id}`);
        console.log('✅ URL mise à jour avec le nouvel ID');
      } catch (routerErr) {
        console.warn('⚠️ Impossible de mettre à jour l\'URL:', routerErr);
      }
    } else {
      console.error('❌ ID vidéo manquant dans handleVideoSelect');
    }
  }, [router]);

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
        let completionStatus: VideoCompletionStatus = 
          existingProgress?.completionStatus === 'completed' ? 'completed' : 'unblocked';
        
        // Marquer comme complété si 90% ou plus de la vidéo a été visionnée
        if (completionPercentage >= 90) {
          completionStatus = 'completed';
        }

        console.log(`Sauvegarde de la position: ${currentPositionInSeconds.toFixed(2)}s (${completionPercentage.toFixed(1)}%), statut: ${completionStatus}`);
        
        const progress: VideoProgress = {
          currentTime: currentPositionInSeconds,
          duration: status.durationMillis / 1000,
          completionStatus,
          lastUpdated: new Date(),
          percentage: completionPercentage,
          metadata: {
            videoId: currentVideo.id,
            courseId: currentVideo.courseId,
            videoSection: '',
            videoTitle: currentVideo.title || currentVideo.titre || '',
            progress: Math.round(completionPercentage)
          }
        };
        
        await videoService.updateVideoProgress(userId, currentVideo.id, progress);
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

  if (!videoSource) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>URL de la vidéo non disponible</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
            <Text style={styles.retryText}>Retourner en arrière</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  // Forcer l'URL de miniature pour tester - à supprimer en production
  const useThumbnail = thumbnailUrl;

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreen]}>
      <TouchableOpacity style={styles.fixedCloseButton} onPress={handleBack}>
        <MaterialCommunityIcons name="close" size={24} color="white" />
      </TouchableOpacity>
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.videoContainer} onTouchStart={toggleControls}>
          {/* Si la vidéo n'a pas démarré, afficher la miniature avec un bouton play */}
          {!videoStarted && useThumbnail ? (
            <View style={styles.thumbnailContainer}>
              <Image 
                source={{ uri: useThumbnail }}
                style={styles.thumbnail}
                resizeMode="contain"
                onLoad={(event) => {
                  const { width, height } = event.nativeEvent.source;
                  if (width && height) {
                    const imageStyle = {
                      width: '100%',
                      height: undefined,
                      aspectRatio: width / height,
                    };
                    event.target.setNativeProps({ style: imageStyle });
                  }
                }}
              />
              <TouchableOpacity 
                style={[styles.playButton, { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -40 }, { translateY: -40 }] }]} 
                onPress={startVideo}
              >
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
            <Text style={styles.title} numberOfLines={3}>
              {currentVideo?.titre || currentVideo?.title || "Titre non disponible"}
            </Text>
          
            {/* Affichage de la durée */}
            <View style={styles.durationContainer}>
              <Text style={styles.duration}>
                Durée : {(() => {
                  let minutes;
                  if (typeof currentVideo?.duration === 'number') {
                    minutes = Math.ceil(currentVideo.duration / 60);
                  } else if (currentVideo?.duree) {
                    // Si la durée est au format "X minutes"
                    const match = currentVideo.duree.match(/(\d+)/);
                    minutes = match ? parseInt(match[0]) : 1;
                  } else {
                    minutes = 1;
                  }
                  return `${minutes}min`;
                })()}
              </Text>
            </View>

            {/* Bouton de lecture */}
            {!videoStarted && (
              <TouchableOpacity style={styles.startButton} onPress={startVideo}>
                <Text style={styles.startButtonText}>Lecture</Text>
                <MaterialCommunityIcons name="play" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            
            {/* Section Résumé */}
            <View style={{ marginBottom: 32 }}>
              <Text style={styles.sectionTitle}>Résumé</Text>
              <View>
                <Text 
                  style={styles.sectionContent}
                  numberOfLines={isDescriptionExpanded ? undefined : 3}
                  ellipsizeMode="clip"
                  onTextLayout={({ nativeEvent: { lines } }) => {
                    // Mettre à jour la visibilité du bouton "Plus" uniquement si le texte a plus de 3 lignes
                    if (lines.length > 3 && !isDescriptionExpanded) {
                      setIsDescriptionExpanded(false);
                    }
                  }}
                >
                  {currentVideo.description}
                </Text>
                {!isDescriptionExpanded && currentVideo.description && currentVideo.description.length > 100 && (
                  <TouchableOpacity 
                    style={styles.expandButton}
                    onPress={() => setIsDescriptionExpanded(true)}
                  >
                    <Text style={styles.expandButtonText}>...afficher plus</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {/* Section vidéo suivante */}
            {nextVideo || (isLastVideo && quizId) ? (
              <>
                <NextVideo 
                  video={nextVideo} 
                  onNavigate={handleVideoSelect}
                  courseId={currentVideo?.courseId}
                  isLastVideo={isLastVideo}
                  quizId={quizId || undefined}
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
      </ScrollView>
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
    width: '100%',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
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
    fontSize: 32,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -1.6,
    lineHeight: 38,
    textAlign: 'center',
  },
  durationContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  duration: {
    color: '#FFFFFF',
    fontFamily: 'Arboria-Medium',
    fontSize: 14,
    lineHeight: 14,
    letterSpacing: 0,
    textAlign: 'center',
    fontWeight: '400',
  },
  startButton: {
    backgroundColor: '#9BEC00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 100,
    width: '100%',
    marginBottom: 24,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Arboria-Medium',
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: '400',
  },
  sectionContent: {
    color: '#FFFFFF',
    fontFamily: 'Helvetica Neue',
    fontSize: 15,
    lineHeight: 15,
    letterSpacing: 0,
    fontWeight: '400',
  },
  fixedCloseButton: {
    position: 'absolute',
    top: 45,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  expandButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  expandButtonText: {
    color: '#F3FF90',
    fontSize: 14,
    fontFamily: 'Arboria-Medium',
  },
}); 