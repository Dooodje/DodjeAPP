import { useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useCourseDetail, useCourseRealTimeUpdates, useCourseVideoProgress } from './queries/useCourseQueries';
import { useVideoProgress } from './queries/useVideoQueries';
import { useRouter } from 'expo-router';

/**
 * Hook optimisé pour la gestion des parcours avec TanStack Query
 */
export const useCourseOptimized = (courseId: string) => {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.uid;

  // Récupérer les détails du parcours
  const {
    data: course,
    isLoading,
    error,
    refetch: refetchCourse
  } = useCourseDetail(courseId);

  // Configurer les mises à jour en temps réel
  useCourseRealTimeUpdates(courseId);

  // Récupérer la progression des vidéos pour ce parcours
  const {
    data: videoProgressList = [],
    isLoading: isProgressLoading,
    refetch: refetchProgress
  } = useCourseVideoProgress(userId || '', courseId);

  // Calculer les statistiques de progression
  const videosWithProgress = useCallback(() => {
    if (!course || !course.videos || !Array.isArray(course.videos)) {
      return [];
    }

    // Créer une map des progressions
    const progressMap = new Map();
    videoProgressList.forEach(progress => {
      progressMap.set(progress.videoId, progress);
    });

    // Fusionner les vidéos avec leurs progressions
    return course.videos.map(video => {
      const progress = progressMap.get(video.id);
      return {
        ...video,
        progress: progress ? progress.progress : 0,
        completionStatus: progress ? progress.completionStatus : 'blocked',
        currentTime: progress ? progress.currentTime : 0,
        duration: progress ? progress.duration : 0
      };
    });
  }, [course, videoProgressList]);

  // Calculer le statut d'achèvement du parcours
  const calculateCourseCompletion = useCallback(() => {
    if (!course || !course.videos || !Array.isArray(course.videos) || course.videos.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const total = course.videos.length;
    const completed = videoProgressList.filter(progress => progress.completionStatus === 'completed').length;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  }, [course, videoProgressList]);

  // Naviguer vers une vidéo
  const navigateToVideo = useCallback((videoId: string) => {
    if (!videoId) return;
    router.push(`/video/${videoId}?courseId=${courseId}`);
  }, [router, courseId]);

  // Revenir à la page d'accueil
  const navigateToHome = useCallback(() => {
    router.push('/');
  }, [router]);

  // Rechargement complet des données
  const refreshData = useCallback(async () => {
    await Promise.all([
      refetchCourse(),
      refetchProgress()
    ]);
  }, [refetchCourse, refetchProgress]);

  // Formatage des vidéos avec le bon ordre pour l'affichage
  const sortedVideos = useCallback(() => {
    const videosWithProgressData = videosWithProgress();
    if (!videosWithProgressData.length) return [];

    return [...videosWithProgressData].sort((a, b) => {
      const orderA = a.order || a.ordre || 0;
      const orderB = b.order || b.ordre || 0;
      return orderA - orderB;
    });
  }, [videosWithProgress]);

  return {
    // Données
    course,
    videos: sortedVideos(),
    courseCompletion: calculateCourseCompletion(),
    isLoading: isLoading || isProgressLoading,
    error: error ? String(error) : null,
    
    // Actions
    navigateToVideo,
    navigateToHome,
    refreshData,
    
    // Utilitaires
    videosWithProgress,
    userId
  };
}; 