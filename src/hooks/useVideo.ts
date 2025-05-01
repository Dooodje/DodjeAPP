import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { videoService } from '../services/video';
import { courseService } from '../services/course';
import { Video, VideoProgress, RelatedVideo } from '../types/video';
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

  // Charger la vidéo et les vidéos connexes
  useEffect(() => {
    const loadVideo = async () => {
      try {
        if (!videoId) {
          dispatch(setError('ID de vidéo manquant'));
          return;
        }
        
        // Réinitialiser l'état avant de charger la nouvelle vidéo
        dispatch(setLoading(true));
        dispatch(setThumbnailUrl('')); // Réinitialiser la miniature avec une chaîne vide
        dispatch(setPlaying(false)); // Assurons-nous que la vidéo est en pause
        
        const video = await videoService.getVideoById(videoId);
        
        if (!video) {
          dispatch(setError('Vidéo non trouvée'));
          return;
        }

        // S'assurer que la durée est correctement définie
        if (video.duree) {
          // Si le champ duree existe, l'utiliser en priorité
          console.log(`⏱️ Utilisation de la durée du document: ${video.duree}`);
          video.duration = video.duree;
        } else if (typeof video.duration === 'string') {
          // Si la durée est stockée sous forme de chaîne (ex: "04:56"), la convertir en secondes
          console.log(`⏱️ Conversion de la durée string en secondes: ${video.duration}`);
          const durationParts = video.duration.split(':');
          if (durationParts.length === 2) {
            const minutes = parseInt(durationParts[0], 10);
            const seconds = parseInt(durationParts[1], 10);
            video.duration = minutes * 60 + seconds;
          }
        }
        
        console.log(`⏱️ Durée finale de la vidéo: ${video.duration} secondes`);

        // Récupérer la progression de l'utilisateur
        if (userId) {
          try {
            const progress = await videoService.getVideoProgress(userId, videoId);
            if (progress) {
              video.progress = progress.percentage;
              video.lastWatchedPosition = progress.currentTime;
              console.log('Last watched time:', progress.currentTime);
            }
          } catch (progressErr) {
            console.error('Erreur lors de la récupération de la progression:', progressErr);
            // Ne pas bloquer le chargement de la vidéo si on n'a pas pu récupérer la progression
          }
        }

        // Toutes les vidéos sont considérées comme débloquées
        video.isUnlocked = true;

        dispatch(setCurrentVideo(video));

        // Mettre à jour la miniature directement depuis le document de la vidéo
        try {
          // Utiliser directement le champ thumbnail du document vidéo
          if (video.thumbnail) {
            console.log(`🖼️ Miniature trouvée dans la vidéo: ${video.thumbnail}`);
            dispatch(setThumbnailUrl(video.thumbnail));
          } else {
            console.log(`⚠️ Aucune miniature trouvée dans la vidéo`);
            dispatch(setThumbnailUrl(''));
          }
        } catch (thumbnailErr) {
          console.error(`❌ Erreur lors de la récupération de la miniature:`, thumbnailErr);
          dispatch(setThumbnailUrl(''));
        }
        
        // Terminer le chargement de la vidéo
        dispatch(setLoading(false));

        // Charger les vidéos connexes si courseId est défini
        try {
          const related = await videoService.getRelatedVideos(video.courseId, videoId);
          dispatch(setRelatedVideos(related));
          
          // Charger la prochaine vidéo du parcours
          console.log('⏭️ Tentative de récupération de la prochaine vidéo pour courseId:', video.courseId, ', videoId:', videoId);
          console.log('⏭️ Les données de la vidéo actuelle:', video);
          
          const next = await videoService.getNextVideo(video.courseId, videoId);
          console.log('⏭️ Résultat de getNextVideo:', next);
          
          if (next) {
            // URL de fallback pour une vidéo de démonstration
            const fallbackUrl = 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4';
            
            // S'assurer que la vidéo suivante a toutes les propriétés nécessaires
            const completeNextVideo = {
              ...next,
              isUnlocked: true, // On considère toutes les vidéos débloquées
              // Ajouter les propriétés requises qui pourraient manquer
              id: next.id || '',
              title: next.title || 'Vidéo sans titre',
              titre: next.titre || next.title || 'Vidéo sans titre', // Assurer la compatibilité du titre
              description: next.description || 'Aucune description disponible',
              videoUrl: next.videoUrl || fallbackUrl, // Utiliser URL fallback si absente
              duration: next.duration || 0,
              duree: next.duree || (typeof next.duration === 'string' ? next.duration : '00:00'), // Assurer la compatibilité du format de durée
              thumbnail: next.thumbnail || '', // S'assurer que thumbnail est présent
              courseId: video.courseId
            };
            
            // Convertir les valeurs pour s'assurer de la compatibilité
            if (typeof completeNextVideo.duration === 'string') {
              const durationParts = completeNextVideo.duration.split(':');
              if (durationParts.length === 2) {
                const minutes = parseInt(durationParts[0], 10);
                const seconds = parseInt(durationParts[1], 10);
                completeNextVideo.duration = minutes * 60 + seconds;
              }
            }
            
            console.log('⏭️ Prochaine vidéo formatée:', JSON.stringify(completeNextVideo));
            console.log('⏭️ URL vidéo suivante:', completeNextVideo.videoUrl);
            console.log('⏭️ Durée formatée:', completeNextVideo.duree);
            console.log('⏭️ Miniature:', completeNextVideo.thumbnail);
            setNextVideo(completeNextVideo);
          } else {
            console.log('⏭️ Aucune prochaine vidéo trouvée');
            setNextVideo(null);
          }
        } catch (relatedErr) {
          console.error('Erreur lors de la récupération des vidéos liées:', relatedErr);
          // Ne pas bloquer le chargement de la vidéo principale si on n'a pas pu récupérer les vidéos liées
          dispatch(setRelatedVideos([]));
          setNextVideo(null);
        }
      } catch (err) {
        console.error('Erreur lors du chargement de la vidéo:', err);
        dispatch(setError(err instanceof Error ? err.message : 'Une erreur est survenue'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (videoId) {
      loadVideo();
    }

    return () => {
      dispatch(resetVideo());
    };
  }, [videoId, userId, dispatch]);

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