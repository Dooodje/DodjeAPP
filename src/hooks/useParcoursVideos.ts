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
      console.log('❌ useParcoursVideos - Pas d\'utilisateur ou de parcoursId:', { user: !!user, parcoursId });
      setState(prev => ({
        ...prev, 
        loading: false,
        error: !user ? 'User not authenticated' : 'No parcours ID provided',
      }));
      return;
    }

    console.log('🔄 useParcoursVideos - Début du chargement pour:', { userId: user.uid, parcoursId });
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const videos = await VideoStatusService.getUserVideosInParcours(user.uid, parcoursId);
      
      // Si aucune vidéo n'est trouvée, initialiser les vidéos du parcours
      if (videos.length === 0) {
        console.log('🔄 useParcoursVideos - Aucune vidéo trouvée, initialisation...');
        await VideoStatusService.initializeParcoursVideos(user.uid, parcoursId);
        // Récupérer à nouveau les vidéos après l'initialisation
        const initializedVideos = await VideoStatusService.getUserVideosInParcours(user.uid, parcoursId);
        console.log('📼 useParcoursVideos - Vidéos initialisées:', initializedVideos.map(v => ({
          videoId: v.videoId,
          status: v.completionStatus,
          progress: v.progress
        })));
        
        // Calculate completed videos
        const completedVideos = initializedVideos.filter(video => video.completionStatus === 'completed').length;
        console.log('✅ useParcoursVideos - Vidéos complétées:', completedVideos);
        
        setState({
          videos: initializedVideos,
          totalVideos: initializedVideos.length,
          completedVideos,
          loading: false,
          error: null,
        });
        return;
      }

      console.log('📼 useParcoursVideos - Vidéos récupérées:', videos.map(v => ({
        videoId: v.videoId,
        status: v.completionStatus,
        progress: v.progress
      })));
      
      // Calculate completed videos
      const completedVideos = videos.filter(video => video.completionStatus === 'completed').length;
      console.log('✅ useParcoursVideos - Vidéos complétées:', completedVideos);
      
      setState({
        videos,
        totalVideos: videos.length,
        completedVideos,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('❌ useParcoursVideos - Erreur:', error);
      
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
    console.log('🔄 useParcoursVideos - Rafraîchissement des données');
    fetchParcoursVideos();
  }, [fetchParcoursVideos]);

  return {
    ...state,
    refresh,
  };
} 