import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videoService } from '../../services/video';
import { videoTrackingService } from '../../services/firebase/videoTrackingService';
import { Video, VideoProgress } from '../../types/video';

// Clés de requête pour les vidéos
export const VIDEO_QUERY_KEYS = {
  all: ['videos'],
  detail: (videoId: string) => ['videos', 'detail', videoId],
  related: (courseId: string, videoId: string) => ['videos', 'related', courseId, videoId],
  progress: (userId: string, videoId: string) => ['videos', 'progress', userId, videoId],
  next: (courseId: string, currentVideoId: string) => ['videos', 'next', courseId, currentVideoId],
};

/**
 * Hook pour récupérer les détails d'une vidéo
 */
export function useVideoDetails(videoId: string) {
  return useQuery({
    queryKey: VIDEO_QUERY_KEYS.detail(videoId),
    queryFn: async () => {
      const video = await videoService.getVideoById(videoId);
      if (!video) {
        throw new Error('Vidéo non trouvée');
      }
      return video;
    },
    enabled: !!videoId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook pour récupérer la progression d'une vidéo
 */
export function useVideoProgress(userId: string, videoId: string) {
  return useQuery({
    queryKey: VIDEO_QUERY_KEYS.progress(userId, videoId),
    queryFn: async () => {
      if (!userId || !videoId) return null;
      
      return await videoTrackingService.getProgress(userId, videoId);
    },
    enabled: !!userId && !!videoId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook pour récupérer les vidéos liées à une vidéo actuelle
 */
export function useRelatedVideos(courseId: string | undefined, currentVideoId: string) {
  return useQuery({
    queryKey: VIDEO_QUERY_KEYS.related(courseId || 'unknown', currentVideoId),
    queryFn: async () => {
      if (!courseId) return [];
      
      return await videoService.getRelatedVideos(courseId, currentVideoId);
    },
    enabled: !!courseId && !!currentVideoId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook pour récupérer la vidéo suivante
 */
export function useNextVideo(courseId: string | undefined, currentVideoId: string) {
  return useQuery({
    queryKey: VIDEO_QUERY_KEYS.next(courseId || 'unknown', currentVideoId),
    queryFn: async () => {
      if (!courseId) return null;
      
      return await videoService.getNextVideo(courseId, currentVideoId);
    },
    enabled: !!courseId && !!currentVideoId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook mutation pour mettre à jour la progression vidéo
 */
export function useUpdateVideoProgressMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      videoId,
      currentTime,
      completionStatus
    }: {
      userId: string;
      videoId: string;
      currentTime: number;
      completionStatus: 'blocked' | 'unblocked' | 'completed';
    }) => {
      await videoService.updateVideoProgress(
        userId,
        videoId,
        { currentTime, completionStatus }
      );
    },
    onSuccess: (_, variables) => {
      // Invalider la requête de progression pour cette vidéo
      queryClient.invalidateQueries({
        queryKey: VIDEO_QUERY_KEYS.progress(variables.userId, variables.videoId),
      });
      
      // Si la vidéo est marquée comme complétée, nous pourrions avoir besoin d'invalider d'autres requêtes
      if (variables.completionStatus === 'completed') {
        // Invalider toutes les requêtes liées aux vidéos pour actualiser les statuts
        queryClient.invalidateQueries({
          queryKey: VIDEO_QUERY_KEYS.all,
        });
      }
    },
  });
}

/**
 * Hook mutation pour marquer une vidéo comme complétée
 */
export function useMarkVideoAsCompletedMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      videoId
    }: {
      userId: string;
      videoId: string;
    }) => {
      await videoService.markVideoAsCompleted(userId, videoId);
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes liées à cette vidéo
      queryClient.invalidateQueries({
        queryKey: VIDEO_QUERY_KEYS.progress(variables.userId, variables.videoId),
      });
      
      // Invalider toutes les requêtes de vidéos pour actualiser les statuts
      queryClient.invalidateQueries({
        queryKey: VIDEO_QUERY_KEYS.all,
      });
    },
  });
} 