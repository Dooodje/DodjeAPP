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
              video.progress = progress.progress;
              video.lastWatchedPosition = progress.lastWatchedPosition;
              video.lastWatchedDate = progress.lastWatchedDate;
            }
          } catch (progressErr) {
            console.error('Erreur lors de la récupération de la progression:', progressErr);
            // Ne pas bloquer le chargement de la vidéo si on n'a pas pu récupérer la progression
          }
        }

        // TEMPORAIREMENT: on considère que toutes les vidéos sont débloquées pour les tests
        console.log('⚠️ Mode test: toutes les vidéos sont considérées comme débloquées');
        video.isUnlocked = true;

        /* Commenté pour les tests
        // Vérifier si c'est la première vidéo du parcours (ordre 0 ou 1)
        // Si c'est le cas, on la débloque automatiquement
        if (video.order === 0 || video.order === 1) {
          console.log('🔓 Première vidéo du parcours, on la débloque automatiquement');
          video.isUnlocked = true;
          
          // Débloquer également dans la base de données si l'utilisateur est connecté
          if (userId) {
            try {
              await videoService.unlockVideo(userId, videoId);
            } catch (unlockErr) {
              console.error('Erreur lors du déblocage automatique de la première vidéo:', unlockErr);
              // Ne pas bloquer le chargement de la vidéo si on n'a pas pu la débloquer
            }
          }
        } else {
          // Vérifier si la vidéo est déjà débloquée
          try {
            if (userId) {
              const isUnlocked = await videoService.isVideoUnlocked(userId, videoId);
              video.isUnlocked = isUnlocked;
            }
          } catch (unlockCheckErr) {
            console.error('Erreur lors de la vérification du statut de déverrouillage:', unlockCheckErr);
            // Par défaut, considérer que la vidéo n'est pas débloquée
            video.isUnlocked = false;
          }
        }
        */

        dispatch(setCurrentVideo(video));

        // Récupérer la miniature directement depuis le document de la vidéo
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