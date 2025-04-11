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

export const useVideo = (videoId: string, userId: string) => {
  const dispatch = useDispatch();
  const router = useRouter();

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

        // Récupérer la progression de l'utilisateur
        if (userId) {
          try {
            const progress = await videoService.getVideoProgress(userId, videoId);
            if (progress) {
              video.progress = progress.progress;
              video.lastWatchedPosition = progress.lastWatchedPosition;
              video.lastWatchedDate = progress.lastWatchedDate;
            }
          } catch (progressErr) {
            console.error('Erreur lors de la récupération de la progression:', progressErr);
            // Ne pas bloquer le chargement de la vidéo si on n'a pas pu récupérer la progression
          }
        }

        dispatch(setCurrentVideo(video));

        // Récupérer la miniature de façon directe et sans attente
        if (video.courseId) {
          try {
            console.log(`🎓 Tentative de récupération de la miniature pour courseId=${video.courseId}`);
            const course = await courseService.getCourseById(video.courseId);
            
            if (course && course.thumbnail) {
              console.log(`✅ Miniature trouvée (thumbnail): ${course.thumbnail}`);
              dispatch(setThumbnailUrl(course.thumbnail));
            } else {
              console.log('⚠️ Pas de miniature trouvée pour ce parcours');
              dispatch(setThumbnailUrl(''));
            }
          } catch (err) {
            console.error('❌ Erreur lors de la récupération de la miniature:', err);
          }
        }
        
        // Terminer le chargement quelle que soit l'état de la miniature
        dispatch(setLoading(false));

        // Charger les vidéos connexes si courseId est défini
        try {
          const related = await videoService.getRelatedVideos(video.courseId, videoId);
          dispatch(setRelatedVideos(related));
        } catch (relatedErr) {
          console.error('Erreur lors de la récupération des vidéos liées:', relatedErr);
          // Ne pas bloquer le chargement de la vidéo principale si on n'a pas pu récupérer les vidéos liées
          dispatch(setRelatedVideos([]));
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

  // Mettre à jour la progression de la vidéo
  const handleProgress = useCallback((progress: number) => {
    if (videoId && userId && currentTime > 0) {
      dispatch(updateVideoProgress(progress));
      try {
        videoService.updateVideoProgress(userId, {
          videoId,
          progress,
          lastWatchedPosition: currentTime,
          lastWatchedDate: new Date()
        }).catch(err => console.error('Erreur lors de la mise à jour de la progression:', err));
      } catch (err) {
        console.error('Erreur lors de la mise à jour de la progression:', err);
      }
    }
  }, [videoId, userId, currentTime, dispatch]);

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
      router.replace(`/video/${id}`);
    }
  }, [router]);

  // Basculer lecture/pause
  const togglePlayback = useCallback(() => {
    dispatch(setPlaying(!isPlaying));
  }, [isPlaying, dispatch]);

  // Basculer le mode plein écran
  const toggleFullscreen = useCallback(() => {
    dispatch(setFullscreen(!isFullscreen));
  }, [isFullscreen, dispatch]);

  // Afficher/masquer les contrôles
  const toggleControls = useCallback(() => {
    dispatch(setShowControls(!showControls));
  }, [showControls, dispatch]);

  return {
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