import { useCallback, useEffect, useState } from 'react';
import { VideoStatusService } from '@/services/businessLogic/VideoStatusService';
import { useAuth } from './useAuth';
import { UserVideo } from '@/types/video';

interface ParcoursVideosState {
  videos: UserVideo[];
  totalVideos: number;
  completedVideos: number;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to manage video statuses for a specific parcours
 * @param parcoursId - The ID of the parcours
 * @returns The state of the videos and a refresh function
 */
export function useParcoursVideos(parcoursId: string | undefined) {
  const { user } = useAuth();
  const [state, setState] = useState<ParcoursVideosState>({
    videos: [],
    totalVideos: 0,
    completedVideos: 0,
    loading: true,
    error: null,
  });

  const fetchParcoursVideos = useCallback(async () => {
    if (!user || !parcoursId) {
      setState(prev => ({
        ...prev, 
        loading: false,
        error: !user ? 'User not authenticated' : 'No parcours ID provided',
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const videos = await VideoStatusService.getUserVideosInParcours(user.uid, parcoursId);
      
      // Calculate completed videos
      const completedVideos = videos.filter(video => video.status === 'completed').length;
      
      setState({
        videos,
        totalVideos: videos.length,
        completedVideos,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching parcours videos:', error);
      
      // Amélioration de la gestion des erreurs
      let errorMessage = 'Failed to fetch videos';
      
      // Vérifier s'il s'agit d'une erreur Firebase
      if (error instanceof Error) {
        const errorString = error.toString();
        
        // Vérifier s'il s'agit d'une erreur d'index
        if (errorString.includes('requires an index')) {
          errorMessage = 'Database index is being created. Please try again in a few minutes.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        // Fournir des valeurs par défaut pour éviter les erreurs d'UI
        videos: [],
        totalVideos: 0,
        completedVideos: 0
      }));
    }
  }, [user, parcoursId]);

  // Initial fetch
  useEffect(() => {
    fetchParcoursVideos();
  }, [fetchParcoursVideos]);

  // Provide a way to refresh the data
  const refresh = useCallback(() => {
    fetchParcoursVideos();
  }, [fetchParcoursVideos]);

  return {
    ...state,
    refresh,
  };
} 