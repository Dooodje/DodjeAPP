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
 * Hook pour récupérer les détails d'un parcours
 */
export function useCourseDetail(courseId: string) {
  const queryClient = useQueryClient();

  return useQuery<CourseData, Error, CourseData>({
    queryKey: COURSE_QUERY_KEYS.detail(courseId),
    queryFn: async () => {
      const courseData = await courseService.getCourseById(courseId);
      
      if (!courseData) {
        throw new Error('Parcours non trouvé');
      }
      
      // Assurer une structure de données cohérente
      return {
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
    },
    // Mettre en cache pendant 10 minutes
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook pour configurer l'observateur Firestore pour les mises à jour en temps réel d'un parcours
 */
export function useCourseRealTimeUpdates(courseId: string) {
  const queryClient = useQueryClient();
  
  React.useEffect(() => {
    // Configurer un observateur Firestore pour les mises à jour en temps réel
    const unsubscribe = courseService.observeParcoursDetail(courseId, (updatedData) => {
      // Récupérer les données actuelles du cache
      const currentData = queryClient.getQueryData<CourseData>(COURSE_QUERY_KEYS.detail(courseId));
      
      if (currentData) {
        // Mettre à jour le cache avec les nouvelles données
        queryClient.setQueryData(COURSE_QUERY_KEYS.detail(courseId), {
          ...currentData,
          ...updatedData
        });
      }
    });
    
    // Nettoyer l'observateur quand le composant est démonté
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [courseId, queryClient]);
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