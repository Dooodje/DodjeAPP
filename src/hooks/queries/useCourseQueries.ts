import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../../services/course';
import { videoTrackingService } from '../../services/firebase/videoTrackingService';
import React from 'react';

// Interface pour les données de cours structurées
interface CourseData {
  id: string;
  title: string;
  titre: string;
  description: string;
  videos: Array<{
    id: string;
    title?: string;
    titre?: string;
    duration?: number;
    duree?: number;
    order?: number;
    ordre?: number;
  }>;
  thumbnail: string;
  design: {
    backgroundImageUrl?: string;
    positions: Record<string, any>;
  };
}

// Clés pour les requêtes
export const COURSE_QUERY_KEYS = {
  all: ['courses'],
  detail: (courseId: string) => ['courses', 'detail', courseId],
  progress: (userId: string, courseId: string) => ['courses', 'progress', userId, courseId],
  videos: {
    all: (courseId: string) => ['courses', 'videos', courseId],
    progress: (userId: string, courseId: string) => ['courses', 'videos', 'progress', userId, courseId]
  }
};

/**
 * Hook optimisé pour récupérer les détails d'un parcours avec cache intelligent
 */
export function useCourseDetail(courseId: string) {
  return useQuery<CourseData, Error, CourseData>({
    queryKey: COURSE_QUERY_KEYS.detail(courseId),
    queryFn: async () => {
      console.log(`🔍 useCourseDetail: Récupération du parcours ${courseId}`);
      const courseData = await courseService.getCourseById(courseId);
      
      if (!courseData) {
        throw new Error('Parcours non trouvé');
      }
      
      // Assurer une structure de données cohérente
      const structuredData: CourseData = {
        id: courseData.id,
        title: courseData.title || courseData.titre || '',
        titre: courseData.titre || courseData.title || '',
        description: courseData.description || '',
        videos: courseData.videos || [],
        thumbnail: courseData.thumbnail || courseData.thumbnailUrl || '',
        design: {
          backgroundImageUrl: courseData.design?.backgroundImageUrl || '',
          positions: courseData.design?.positions || {}
        }
      };
      
      console.log(`✅ useCourseDetail: Parcours ${courseId} structuré avec ${structuredData.videos.length} vidéos`);
      return structuredData;
    },
    // Cache plus agressif pour améliorer les performances
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    // Retry moins agressif pour éviter les appels répétés
    retry: 1,
    retryDelay: 1000,
    // Désactiver le refetch automatique pour économiser les ressources
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/**
 * Hook pour forcer le rafraîchissement d'un parcours (utile après des modifications)
 */
export function useRefreshCourse() {
  const queryClient = useQueryClient();
  
  return (courseId: string) => {
    console.log(`🔄 Rafraîchissement forcé du parcours ${courseId}`);
    // Vider le cache du service
    courseService.clearCache(courseId);
    // Invalider et refetch la requête
    queryClient.invalidateQueries({
      queryKey: COURSE_QUERY_KEYS.detail(courseId)
    });
  };
}

/**
 * Hook pour récupérer les progrès des vidéos pour un cours
 */
export function useCourseVideoProgress(userId: string, courseId: string) {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.videos.progress(userId, courseId),
    queryFn: async () => {
      // Récupérer la progression de toutes les vidéos du cours
      if (!userId || !courseId) return [];
      
      return await videoTrackingService.getProgressForCourse(userId, courseId);
    },
    // Désactiver la requête si les paramètres sont invalides
    enabled: !!userId && !!courseId,
    // Mettre en cache pendant 5 minutes
    staleTime: 5 * 60 * 1000,
    // Maintenir en vie pendant 10 minutes
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook mutation pour mettre à jour la progression d'une vidéo
 */
export function useUpdateVideoProgressMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      videoId, 
      currentTime, 
      duration, 
      metadata 
    }: { 
      userId: string; 
      videoId: string; 
      currentTime: number; 
      duration: number; 
      metadata?: { 
        courseId?: string; 
        videoTitle?: string; 
        videoSection?: string;
      }
    }) => {
      await videoTrackingService.updateProgress(
        userId,
        videoId,
        currentTime,
        duration,
        metadata
      );
    },
    onSuccess: (_, variables) => {
      // Si courseId est fourni, invalider la requête de progression du cours
      if (variables.metadata?.courseId) {
        queryClient.invalidateQueries({
          queryKey: COURSE_QUERY_KEYS.videos.progress(
            variables.userId, 
            variables.metadata.courseId
          )
        });
      }
    }
  });
} 