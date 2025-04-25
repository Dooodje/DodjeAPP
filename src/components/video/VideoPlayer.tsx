import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Image, Animated } from 'react-native';
import { Video, ResizeMode, VideoFullscreenUpdateEvent } from 'expo-av';
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

  // Gérer le mode plein écran
  useEffect(() => {
    if (videoRef.current) {
      if (isFullscreen) {
        // Maintenir le mode portrait même lorsqu'on entre en plein écran
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).catch(err => {
          console.error('Erreur lors du maintien du mode portrait:', err);
        });
        
        videoRef.current.presentFullscreenPlayer().catch(err => {
          console.error('Erreur lors du passage en plein écran:', err);
        });
        
        // S'assurer que la vidéo est en lecture quand on passe en plein écran
        if (videoStarted && !isPlaying) {
          console.log('Forcer la lecture en mode plein écran');
          setIsPlaying(true);
          videoRef.current.playAsync().catch(err => {
            console.error('Erreur lors de la lecture forcée en plein écran:', err);
          });
        }
      } else {
        // Revenir en mode portrait lorsqu'on quitte le plein écran (déjà en portrait, mais on s'assure)
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).catch(err => {
          console.error('Erreur lors du retour en mode portrait:', err);
        });
        
        videoRef.current.dismissFullscreenPlayer().catch(err => {
          console.error('Erreur lors de la sortie du plein écran:', err);
        });
        
        // Mettre en pause la vidéo et afficher la miniature quand on quitte le plein écran
        if (videoStarted && isPlaying) {
          console.log('Mise en pause de la vidéo à la sortie du plein écran');
          setIsPlaying(false);
          // Sauvegarder la position actuelle pour une reprise ultérieure
          setSavedPosition(currentTime);
          videoRef.current.pauseAsync().catch(err => {
            console.error('Erreur lors de la mise en pause de la vidéo:', err);
          });
          // Forcer l'affichage de la miniature
          setVideoStarted(false);
        }
      }
    }
  }, [isFullscreen, setIsPlaying, videoStarted, isPlaying, currentTime]);

  // Nettoyer et réinitialiser l'orientation lors du démontage du composant
  useEffect(() => {
    return () => {
      // S'assurer que l'orientation reste en portrait lorsqu'on quitte la page vidéo
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

  // Démarrer la lecture de la vidéo uniquement au clic sur le bouton play
  const startVideo = () => {
    try {
      if (!videoRef.current) return;
      
      setVideoStarted(true);
      setIsPlaying(true);
      
      // Start tracking when video starts playing
      videoTracking.startTracking(0, duration);
      
      // Si nous avons une position sauvegardée, l'utiliser
      if (savedPosition > 0) {
        console.log(`Reprise de la vidéo à la position ${savedPosition.toFixed(2)}s`);
        videoRef.current.setPositionAsync(savedPosition * 1000).catch(err => {
          console.error('Erreur lors de la reprise à la position sauvegardée:', err);
        });
      }
      
      // S'assurer que l'orientation reste en portrait avant de passer en plein écran
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).catch(err => {
        console.error('Erreur lors du verrouillage en mode portrait:', err);
      });
      
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
          
          // Forcer la lecture après le passage en plein écran
          setTimeout(() => {
            if (videoRef.current) {
              console.log('Forcer la lecture après passage en plein écran');
              videoRef.current.playAsync().catch(err => {
                console.error('Erreur lors de la lecture forcée:', err);
              });
            }
          }, 500);
        }
      }, 300); // Petit délai pour permettre à la vidéo de se charger correctement
    } catch (error) {
      console.error('Erreur lors du démarrage de la vidéo:', error);
    }
  };

  // Gérer les mises à jour de l'état du plein écran (entrée/sortie)
  const onFullscreenUpdate = useCallback(
    (event: VideoFullscreenUpdateEvent) => {
      // Les états possibles sont:
      // - FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT: La vidéo va passer en plein écran
      // - FULLSCREEN_UPDATE_PLAYER_DID_PRESENT: La vidéo est passée en plein écran
      // - FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS: La vidéo va quitter le plein écran
      // - FULLSCREEN_UPDATE_PLAYER_DID_DISMISS: La vidéo a quitté le plein écran
      
      console.log(`Mise à jour du plein écran: ${event.fullscreenUpdate}`);

      // Maintenir l'orientation portrait pendant les transitions de plein écran
      if (event.fullscreenUpdate === FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT) {
        // Avant de passer en plein écran, s'assurer que l'orientation reste en portrait
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).catch(err => {
          console.error('Erreur lors du maintien du mode portrait pour le plein écran:', err);
        });
      } else if (event.fullscreenUpdate === FULLSCREEN_UPDATE_PLAYER_DID_PRESENT) {
        // Une fois en plein écran, s'assurer encore que l'orientation reste en portrait
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).catch(err => {
          console.error('Erreur lors du maintien du mode portrait après passage en plein écran:', err);
        });
      }

      if (event.fullscreenUpdate === FULLSCREEN_UPDATE_PLAYER_DID_DISMISS) {
        // L'utilisateur a quitté le mode plein écran manuellement
        console.log('Sortie du mode plein écran détectée');
        
        // Mettre à jour l'état dans Redux
        dispatch(setFullscreen(false));
        
        // Mettre en pause la vidéo
        if (videoRef.current) {
          videoRef.current.pauseAsync().catch(err => {
            console.error('Erreur lors de la mise en pause après sortie du plein écran:', err);
          });
        }
        
        // Revenir à l'état initial (thumbnail + bouton play)
        setVideoStarted(false);
        setIsPlaying(false);
        
        // Sauvegarder la position actuelle pour pouvoir reprendre plus tard
        if (videoRef.current) {
          videoRef.current.getStatusAsync().then(status => {
            if (status.isLoaded) {
              const currentPositionInSeconds = status.positionMillis / 1000;
              console.log(`Sauvegarde de la position actuelle: ${currentPositionInSeconds.toFixed(2)}s`);
              setSavedPosition(currentPositionInSeconds);
            }
          }).catch(err => {
            console.error('Erreur lors de la récupération de la position actuelle:', err);
          });
        }
      }
    },
    [dispatch]
  );

  // Gérer l'état de la vidéo lorsque l'utilisateur quitte le mode plein écran via le bouton back
  useEffect(() => {
    if (prevIsFullscreen && !isFullscreen) {
      // L'utilisateur a quitté le mode plein écran via le bouton back ou programmatiquement
      console.log('Sortie du mode plein écran via le state Redux détectée');
      
      // S'assurer que la vidéo est en pause
      if (videoRef.current) {
        videoRef.current.pauseAsync().catch(err => {
          console.error('Erreur lors de la mise en pause après sortie du plein écran:', err);
        });
      }
      
      // Réinitialiser l'interface utilisateur pour afficher la vignette avec le bouton play
      setVideoStarted(false);
      setIsPlaying(false);
      
      // Sauvegarder la position pour pouvoir reprendre plus tard
      if (videoRef.current) {
        videoRef.current.getStatusAsync().then(status => {
          if (status.isLoaded) {
            const currentPositionInSeconds = status.positionMillis / 1000;
            console.log(`Sauvegarde de la position lors de la sortie du plein écran: ${currentPositionInSeconds.toFixed(2)}s`);
            setSavedPosition(currentPositionInSeconds);
          }
        }).catch(err => {
          console.error('Erreur lors de la récupération de la position actuelle:', err);
        });
      }
    }
    
    // Mettre à jour la valeur précédente pour la prochaine comparaison
    setPrevIsFullscreen(isFullscreen);
  }, [isFullscreen, prevIsFullscreen]);

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

  // Modify handleProgress to update tracking position
  const handleProgress = useCallback((progress: number) => {
    if (!currentVideo) return;
    
    // Existing progress code
    // ... existing code ...
    
    // Update the tracking position
    videoTracking.updatePosition(currentTime, duration);
  }, [currentTime, duration, videoTracking, currentVideo]);
  
  // ... existing code ...
  
  // Modify togglePlayback to pause/resume tracking
  const togglePlayback = useCallback(() => {
    setIsPlaying(prev => !prev);
    
    // Update tracking based on new play state
    if (isPlaying) {
      videoTracking.pauseTracking();
    } else {
      videoTracking.startTracking(currentTime, duration);
    }
  }, [isPlaying, videoTracking, currentTime, duration]);
  
  // ... existing code ...
  
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
          onError={handleVideoError}
          onFullscreenUpdate={onFullscreenUpdate}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded) {
              // Update both local state and Redux state
              const newCurrentTime = status.positionMillis / 1000;
              const newDuration = status.durationMillis ? status.durationMillis / 1000 : 0;
              
              setCurrentTime(newCurrentTime);
              setDuration(newDuration);
              
              // Also update Redux state
              updateReduxCurrentTime(newCurrentTime);
              updateReduxDuration(newDuration);
              
              // Calculate progress percentage
              if (status.positionMillis > 0 && !status.didJustFinish) {
                const progress = status.durationMillis
                  ? (status.positionMillis / status.durationMillis) * 100
                  : 0;
                originalHandleProgress(progress);
                
                // Update tracking position with each status update
                videoTracking.updatePosition(newCurrentTime, newDuration);
              }
              
              // Handle video completion
              if (status.didJustFinish) {
                videoTracking.completeVideo();
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
}); 