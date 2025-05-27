import { useEffect, useCallback, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { videoService } from '../services/video';
import { courseService } from '../services/course';
import { Video, VideoProgress, RelatedVideo, VideoCompletionStatus } from '../types/video';
import {
  setCurrentVideo,
  setRelatedVideos,
  setPlaying,
  setCurrentTime,
  setDuration,
  setLoading,
  setError,
  setFullscreen,
  setShowControls,
  setAdLoaded,
  setAdError,
  updateVideoProgress,
  setThumbnailUrl,
  resetVideo
} from '../store/slices/videoSlice';
import { RootState } from '../store';
import { videoTrackingService } from '../services/firebase/videoTrackingService';
import * as ScreenOrientation from 'expo-screen-orientation';

export const useVideo = (videoId: string, userId: string) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [nextVideo, setNextVideo] = useState<Video | null>(null);

  // Références pour stocker les fonctions de désabonnement
  const unsubscribeVideoRef = useRef<(() => void) | null>(null);
  const unsubscribeProgressRef = useRef<(() => void) | null>(null);
  const unsubscribeRelatedRef = useRef<(() => void) | null>(null);
  const unsubscribeNextVideoRef = useRef<(() => void) | null>(null);

  // Sélecteurs pour l'état Redux
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
    adLoaded,
    adError,
    thumbnailUrl
  } = useSelector((state: RootState) => state.video);

  // Configurer les listeners en temps réel
  useEffect(() => {
    if (!videoId) {
      dispatch(setError('ID de vidéo manquant'));
      return;
    }

    console.log(`🔍 useVideo - Configuration des listeners en temps réel pour la vidéo ${videoId}`);
    
    // Réinitialiser l'état avant de configurer les nouveaux listeners
    dispatch(setLoading(true));
    dispatch(setThumbnailUrl(''));
    dispatch(setPlaying(false));
    dispatch(setError(null));

    // 1. Observer la vidéo en temps réel
    const unsubscribeVideo = videoService.observeVideoById(videoId, async (video) => {
      if (!video) {
        dispatch(setError('Vidéo non trouvée'));
        dispatch(setLoading(false));
        return;
      }

      console.log(`✅ useVideo - Données vidéo mises à jour reçues pour ${videoId}`);

      // S'assurer que la durée est correctement définie
      if (video.duree && typeof video.duree === 'string') {
        console.log(`⏱️ Conversion de la durée string en secondes: ${video.duree}`);
        const durationParts = video.duree.split(':');
        if (durationParts.length === 2) {
          const minutes = parseInt(durationParts[0], 10);
          const seconds = parseInt(durationParts[1], 10);
          video.duration = minutes * 60 + seconds;
        }
      }
      
      console.log(`⏱️ Durée finale de la vidéo: ${video.duration} secondes`);

      // Toutes les vidéos sont considérées comme débloquées
      video.isUnlocked = true;

      dispatch(setCurrentVideo(video));

      // Mettre à jour la miniature
      if (video.thumbnail) {
        console.log(`🖼️ Miniature trouvée dans la vidéo: ${video.thumbnail}`);
        dispatch(setThumbnailUrl(video.thumbnail));
      } else {
        console.log(`⚠️ Aucune miniature trouvée dans la vidéo`);
        dispatch(setThumbnailUrl(''));
      }

      dispatch(setLoading(false));
    });

    unsubscribeVideoRef.current = unsubscribeVideo;

    // 2. Observer la progression de l'utilisateur en temps réel (si userId est disponible)
    if (userId) {
      const unsubscribeProgress = videoService.observeVideoProgress(userId, videoId, (progress) => {
        if (progress && currentVideo) {
          console.log(`✅ useVideo - Progression mise à jour reçue pour ${videoId}:`, progress);
          
          // Mettre à jour la progression dans la vidéo courante
          const updatedVideo = {
            ...currentVideo,
            progress: {
              currentTime: progress.currentTime,
              duration: progress.duration,
              completionStatus: progress.completionStatus as VideoCompletionStatus,
              lastUpdated: progress.lastUpdated,
              percentage: (progress.currentTime / progress.duration) * 100,
              metadata: {
                videoId: videoId,
                courseId: currentVideo.courseId,
                videoSection: '',
                videoTitle: currentVideo.title || currentVideo.titre || '',
                progress: (progress.currentTime / progress.duration) * 100
              }
            },
            lastWatchedPosition: progress.currentTime
          };
          
          dispatch(setCurrentVideo(updatedVideo));
          console.log('Last watched time updated:', progress.currentTime);
        }
      });

      unsubscribeProgressRef.current = unsubscribeProgress;
    }

    // Nettoyer lors du démontage du composant
    return () => {
      console.log('🧹 useVideo - Nettoyage des listeners');
      if (unsubscribeVideoRef.current) {
        unsubscribeVideoRef.current();
        unsubscribeVideoRef.current = null;
      }
      if (unsubscribeProgressRef.current) {
        unsubscribeProgressRef.current();
        unsubscribeProgressRef.current = null;
      }
      if (unsubscribeRelatedRef.current) {
        unsubscribeRelatedRef.current();
        unsubscribeRelatedRef.current = null;
      }
      if (unsubscribeNextVideoRef.current) {
        unsubscribeNextVideoRef.current();
        unsubscribeNextVideoRef.current = null;
      }
      dispatch(resetVideo());
    };
  }, [videoId, userId, dispatch]);

  // 3. Observer les vidéos liées quand la vidéo courante est chargée
  useEffect(() => {
    if (currentVideo?.courseId) {
      console.log(`🔍 useVideo - Configuration du listener des vidéos liées pour le cours ${currentVideo.courseId}`);
      
      const unsubscribeRelated = videoService.observeRelatedVideos(
        currentVideo.courseId, 
        videoId, 
        (relatedVideos) => {
          console.log(`✅ useVideo - ${relatedVideos.length} vidéos liées mises à jour`);
          dispatch(setRelatedVideos(relatedVideos));
        }
      );

      unsubscribeRelatedRef.current = unsubscribeRelated;

      return () => {
        if (unsubscribeRelatedRef.current) {
          unsubscribeRelatedRef.current();
          unsubscribeRelatedRef.current = null;
        }
      };
    }
  }, [currentVideo?.courseId, videoId, dispatch]);

  // 4. Observer la prochaine vidéo en temps réel quand la vidéo courante est chargée
  useEffect(() => {
    if (currentVideo?.courseId) {
      console.log(`🔍 useVideo - Configuration du listener de la prochaine vidéo pour le cours ${currentVideo.courseId}`);
      
      const unsubscribeNextVideo = videoService.observeNextVideo(
        currentVideo.courseId, 
        videoId, 
        (nextVideoResult) => {
          if (nextVideoResult) {
            // Vérifier si c'est la dernière vidéo avec un quiz
            if ('isLastVideo' in nextVideoResult) {
              console.log('⏭️ observeNextVideo - Dernière vidéo avec quiz détectée');
              setNextVideo(null);
              return;
            }
            
            // C'est une vidéo normale
            const videoNext = nextVideoResult as Video;
            const completeNextVideo: Video = {
              ...videoNext,
              isUnlocked: true,
              id: videoNext.id || '',
              title: videoNext.title || 'Vidéo sans titre',
              titre: videoNext.titre || videoNext.title || 'Vidéo sans titre',
              description: videoNext.description || 'Aucune description disponible',
              videoUrl: videoNext.videoUrl || '',
              duration: videoNext.duration || 0,
              duree: videoNext.duree || '00:00',
              thumbnail: videoNext.thumbnail || '',
              courseId: currentVideo.courseId
            };
            
            console.log('⏭️ observeNextVideo - Prochaine vidéo mise à jour:', completeNextVideo.title);
            setNextVideo(completeNextVideo);
          } else {
            console.log('⏭️ observeNextVideo - Aucune prochaine vidéo trouvée');
            setNextVideo(null);
          }
        }
      );

      unsubscribeNextVideoRef.current = unsubscribeNextVideo;

      return () => {
        if (unsubscribeNextVideoRef.current) {
          unsubscribeNextVideoRef.current();
          unsubscribeNextVideoRef.current = null;
        }
      };
    }
  }, [currentVideo?.courseId, videoId]);

  // Convertir la durée de format "MM:SS" en secondes
  const convertDurationToSeconds = (duration: string): number => {
    if (!duration) return 0;
    const [minutes, seconds] = duration.split(':').map(Number);
    return (minutes * 60) + seconds;
  };

  // Gérer la progression de la vidéo
  const handleProgress = useCallback(async (currentTime: number) => {
    if (!currentVideo) return;
    
    // Update the state
    dispatch(setCurrentTime(currentTime));
    
    // Calculate progress percentage
    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
    
    // Update Redux state
    dispatch(updateVideoProgress(progressPercentage));
    
    // Check for completion threshold (90%)
    const VIDEO_COMPLETION_THRESHOLD = 90;
    const completionStatus: VideoProgress['completionStatus'] = 
      progressPercentage >= VIDEO_COMPLETION_THRESHOLD ? 'completed' : 'unblocked';

    try {
      await videoService.updateVideoProgress(userId, currentVideo.id, {
        currentTime,
        completionStatus
      });
      
      await videoTrackingService.updateProgress(
        userId,
        videoId,
        currentTime,
        duration,
        {
          courseId: currentVideo.courseId || '',
          videoTitle: currentVideo.title || currentVideo.titre || '',
          videoSection: ''
        }
      );
    } catch (err) {
      console.error('Error updating video progress:', err);
    }
  }, [currentVideo, dispatch, duration, userId, videoId]);

  // Add function to save final progress when user leaves the page
  const saveProgress = useCallback(async () => {
    if (!userId || !currentVideo?.id || currentTime <= 0 || duration <= 0) return;
    
    try {
      const progressPercentage = (currentTime / duration) * 100;
      const completionStatus: VideoProgress['completionStatus'] = 
        progressPercentage >= 90 ? 'completed' : 'unblocked';

      await videoService.updateVideoProgress(userId, currentVideo.id, {
        currentTime,
        completionStatus
      });
      
      await videoTrackingService.updateProgress(
        userId,
        currentVideo.id,
        currentTime,
        duration,
        {
          courseId: currentVideo.courseId || '',
          videoTitle: currentVideo.title || currentVideo.titre || '',
          videoSection: ''
        }
      );
      
      console.log('Video progress saved successfully');
    } catch (error) {
      console.error('Failed to save video progress:', error);
    }
  }, [userId, currentVideo, currentTime, duration]);

  // Add cleanup effect to save progress on unmount
  useEffect(() => {
    return () => {
      saveProgress();
    };
  }, [saveProgress]);

  // Marquer la vidéo comme débloquée
  const handleUnlock = useCallback(async () => {
    if (!currentVideo || !userId || !videoId) {
      console.error('❌ Impossible de débloquer la vidéo: données manquantes', { currentVideo, userId, videoId });
      return;
    }
    
    console.log('🔑 Tentative de déblocage de la vidéo', videoId, 'pour utilisateur', userId);
    console.log('État actuel de la vidéo:', currentVideo);
    
    if (!currentVideo.isUnlocked) {
      try {
        console.log('🔓 Appel à unlockVideo');
        await videoService.unlockVideo(userId, videoId);
        console.log('✅ Vidéo débloquée avec succès');
        
        // Mettre à jour l'état local avec la vidéo débloquée
        dispatch(setCurrentVideo({ ...currentVideo, isUnlocked: true }));
        
        // Attendre un peu pour s'assurer que le state est mis à jour
        setTimeout(() => {
          console.log('🔄 État après déblocage:', { ...currentVideo, isUnlocked: true });
        }, 500);
      } catch (err) {
        console.error('❌ Erreur lors du déblocage de la vidéo:', err);
        dispatch(setError(err instanceof Error ? err.message : 'Erreur lors du déblocage de la vidéo'));
      }
    } else {
      console.log('ℹ️ Vidéo déjà débloquée');
    }
  }, [currentVideo, userId, videoId, dispatch]);

  // Changer de vidéo
  const handleVideoSelect = useCallback((id: string) => {
    if (id) {
      console.log('🔍 handleVideoSelect - Changement de vidéo vers ID:', id);
      
      // Vérifier que l'ID existe dans la base de données
      videoService.getVideoById(id).then(checkVideo => {
        if (checkVideo) {
          console.log('✅ Vidéo cible vérifiée - Existe avec URL:', checkVideo.videoUrl);
        } else {
          console.warn('⚠️ La vidéo cible n\'existe pas dans la base de données');
        }
      }).catch(err => {
        console.error('❌ Erreur lors de la vérification de la vidéo cible:', err);
      });
      
      try {
        console.log('🔄 Tentative de navigation vers /video/' + id);
        
        // Enregistrer l'ID dans sessionStorage pour debug (pour vérifier qu'il est correct)
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('lastVideoNavigation', id);
            console.log('📝 ID vidéo enregistré dans sessionStorage');
          } catch (storageError) {
            console.warn('⚠️ Impossible d\'utiliser sessionStorage:', storageError);
          }
        }
        
        // Tenter d'abord avec push
        router.push(`/video/${id}`);
        console.log('✅ Navigation réussie avec router.push vers /video/' + id);
      } catch (error) {
        console.error('❌ Erreur avec router.push:', error);
        
        // Si push échoue, essayer avec replace
        try {
          console.log('🔄 Tentative avec router.replace');
          router.replace(`/video/${id}`);
          console.log('✅ Navigation réussie avec router.replace');
        } catch (replaceError) {
          console.error('❌ Échec de la navigation avec router.replace:', replaceError);
          
          // Dernière solution: rafraîchir la page avec URL
          console.log('🔄 Tentative avec window.location');
          if (typeof window !== 'undefined') {
            window.location.href = `/video/${id}`;
          }
        }
      }
    } else {
      console.error('❌ ID de vidéo manquant dans handleVideoSelect');
    }
  }, [router]);

  // Basculer lecture/pause
  const togglePlayback = useCallback(() => {
    dispatch(setPlaying(!isPlaying));
  }, [isPlaying, dispatch]);

  // Basculer le mode plein écran
  const toggleFullscreen = useCallback(async () => {
    try {
      if (isFullscreen) {
        // Quitter le plein écran
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        dispatch(setFullscreen(false));
      } else {
        // Passer en plein écran
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
        dispatch(setFullscreen(true));
      }
    } catch (error) {
      console.error('Erreur lors du basculement du mode plein écran:', error);
    }
  }, [isFullscreen, dispatch]);

  // Afficher/masquer les contrôles
  const toggleControls = useCallback(() => {
    dispatch(setShowControls(!showControls));
  }, [showControls, dispatch]);

  return {
    currentVideo,
    relatedVideos,
    nextVideo,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    error,
    isFullscreen,
    showControls,
    adLoaded,
    adError,
    thumbnailUrl,
    handleProgress,
    handleUnlock,
    handleVideoSelect,
    togglePlayback,
    toggleFullscreen,
    toggleControls,
    setPlaying: (playing: boolean) => dispatch(setPlaying(playing)),
    setCurrentTime: (time: number) => dispatch(setCurrentTime(time)),
    setDuration: (duration: number) => dispatch(setDuration(duration)),
    setFullscreen: (fullscreen: boolean) => dispatch(setFullscreen(fullscreen)),
    setShowControls: (show: boolean) => dispatch(setShowControls(show)),
    setAdLoaded: (loaded: boolean) => dispatch(setAdLoaded(loaded)),
    setAdError: (error: string | null) => dispatch(setAdError(error))
  };
}; 