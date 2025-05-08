import { useCallback, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { Video, VideoCompletionStatus, VideoProgress } from '../types/video';
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
import * as ScreenOrientation from 'expo-screen-orientation';
import { 
  useVideoDetails, 
  useVideoProgress, 
  useRelatedVideos, 
  useNextVideo,
  useUpdateVideoProgressMutation,
  useMarkVideoAsCompletedMutation
} from './queries/useVideoQueries';

/**
 * Hook optimisé pour la gestion des vidéos avec TanStack Query
 */
export const useVideoOptimized = (videoId: string, userId: string) => {
  const dispatch = useDispatch();
  const router = useRouter();

  // Sélecteurs pour l'état Redux
  const {
    isPlaying,
    currentTime,
    duration,
    isFullscreen,
    showControls,
    adLoaded,
    adError
  } = useSelector((state: RootState) => state.video);

  // Utiliser les hooks TanStack Query pour récupérer les données
  const {
    data: currentVideo,
    isLoading: isVideoLoading,
    error: videoError,
    refetch: refetchVideo
  } = useVideoDetails(videoId);

  const {
    data: videoProgress,
    isLoading: isProgressLoading
  } = useVideoProgress(userId, videoId);

  const {
    data: relatedVideosData,
    isLoading: isRelatedLoading
  } = useRelatedVideos(currentVideo?.courseId, videoId);

  const {
    data: nextVideoData,
    isLoading: isNextLoading
  } = useNextVideo(currentVideo?.courseId, videoId);

  // Hooks de mutation pour les mises à jour
  const updateProgressMutation = useUpdateVideoProgressMutation();
  const markCompletedMutation = useMarkVideoAsCompletedMutation();

  // États locaux
  const [nextVideo, setNextVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(isVideoLoading || isProgressLoading || isRelatedLoading || isNextLoading);

  // Synchroniser l'état Redux avec les données de TanStack Query
  useEffect(() => {
    setIsLoading(isVideoLoading || isProgressLoading || isRelatedLoading || isNextLoading);
    
    // Mettre à jour l'état de chargement dans Redux
    dispatch(setLoading(isLoading));

    // En cas d'erreur, mettre à jour l'état d'erreur dans Redux
    if (videoError) {
      dispatch(setError(videoError instanceof Error ? videoError.message : String(videoError)));
    }
  }, [isVideoLoading, isProgressLoading, isRelatedLoading, isNextLoading, videoError, dispatch]);

  // Synchroniser les données vidéo avec Redux
  useEffect(() => {
    if (currentVideo) {
      // Mettre à jour l'objet Video sans inclure le champ progress qui cause des problèmes de typage
      dispatch(setCurrentVideo({
        ...currentVideo,
        lastWatchedPosition: videoProgress?.currentTime || 0
      }));

      // Calculer la progression pour Redux
      if (videoProgress) {
        // Mettre à jour la progression en pourcentage (0-100)
        dispatch(updateVideoProgress(videoProgress.progress));
      }

      // Mettre à jour la miniature
      if (currentVideo.thumbnail) {
        dispatch(setThumbnailUrl(currentVideo.thumbnail));
      }
    }
  }, [currentVideo, videoProgress, dispatch]);

  // Synchroniser les vidéos connexes avec Redux
  useEffect(() => {
    if (relatedVideosData) {
      dispatch(setRelatedVideos(relatedVideosData));
    }
  }, [relatedVideosData, dispatch]);

  // Synchroniser la vidéo suivante
  useEffect(() => {
    if (nextVideoData) {
      if ('isLastVideo' in nextVideoData) {
        setNextVideo(null);
      } else {
        setNextVideo(nextVideoData as Video);
      }
    } else {
      setNextVideo(null);
    }
  }, [nextVideoData]);

  // Fonctions de gestion de la lecture
  const handlePlay = useCallback(() => {
    dispatch(setPlaying(true));
  }, [dispatch]);

  const handlePause = useCallback(() => {
    dispatch(setPlaying(false));
  }, [dispatch]);

  const handleTimeUpdate = useCallback((time: number) => {
    dispatch(setCurrentTime(time));
  }, [dispatch]);

  const handleDurationChange = useCallback((newDuration: number) => {
    dispatch(setDuration(newDuration));
  }, [dispatch]);

  const handleFullscreenChange = useCallback((fullscreen: boolean) => {
    dispatch(setFullscreen(fullscreen));
    
    // Gestion de l'orientation de l'écran
    if (fullscreen) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  }, [dispatch]);

  const handleControlsToggle = useCallback((show: boolean) => {
    dispatch(setShowControls(show));
  }, [dispatch]);

  // Fonction optimisée pour mettre à jour la progression
  const handleUpdateProgress = useCallback((
    currentTime: number, 
    completionStatus: VideoCompletionStatus = 'unblocked'
  ) => {
    if (!userId || !videoId || !currentVideo) return;

    // Appeler la mutation
    updateProgressMutation.mutate({
      userId,
      videoId,
      currentTime,
      completionStatus
    });

    // Mettre à jour la position actuelle dans Redux
    dispatch(setCurrentTime(currentTime));
    
    // Calculer la progression en pourcentage
    if (duration > 0) {
      const progressPercentage = Math.min(Math.round((currentTime / duration) * 100), 100);
      dispatch(updateVideoProgress(progressPercentage));
    }
  }, [userId, videoId, currentVideo, duration, updateProgressMutation, dispatch]);

  // Fonction pour marquer une vidéo comme complétée
  const markVideoAsCompleted = useCallback(() => {
    if (!userId || !videoId) return;

    markCompletedMutation.mutate({
      userId,
      videoId
    });

    // Mettre à jour le pourcentage de progression à 100%
    dispatch(updateVideoProgress(100));
  }, [userId, videoId, markCompletedMutation, dispatch]);

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      dispatch(resetVideo());
    };
  }, [dispatch]);

  // Conversion de la durée au format MM:SS en secondes
  const convertDurationToSeconds = (duration: string): number => {
    if (!duration) return 0;
    
    const parts = duration.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      return minutes * 60 + seconds;
    }
    return 0;
  };

  return {
    // État
    videoId,
    currentVideo,
    nextVideo,
    relatedVideos: relatedVideosData || [],
    isPlaying,
    currentTime,
    duration,
    isLoading,
    error: videoError ? String(videoError) : null,
    isFullscreen,
    showControls,
    adLoaded,
    adError,
    progress: videoProgress?.progress || 0,
    
    // Actions de mise à jour
    handlePlay,
    handlePause,
    handleTimeUpdate,
    handleDurationChange,
    handleFullscreenChange,
    handleControlsToggle,
    handleUpdateProgress,
    markVideoAsCompleted,
    
    // Utilitaires
    convertDurationToSeconds,
    
    // Rechargement des données
    refetchVideo
  };
}; 