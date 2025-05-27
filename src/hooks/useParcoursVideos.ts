import { useCallback, useEffect, useState, useRef } from 'react';
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
 * Hook temps réel pour gérer les statuts des vidéos d'un parcours spécifique
 * @param parcoursId - L'ID du parcours
 * @returns L'état des vidéos et une fonction de rafraîchissement
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
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Fonction pour initialiser les vidéos si nécessaire
  const initializeVideosIfNeeded = useCallback(async () => {
    if (!user || !parcoursId) return;

    try {
      console.log('🔄 useParcoursVideos - Vérification de l\'initialisation pour:', { userId: user.uid, parcoursId });
      const videos = await VideoStatusService.getUserVideosInParcours(user.uid, parcoursId);
      
      // Si aucune vidéo n'est trouvée, initialiser les vidéos du parcours
      if (videos.length === 0) {
        console.log('🔄 useParcoursVideos - Aucune vidéo trouvée, initialisation...');
        await VideoStatusService.initializeParcoursVideos(user.uid, parcoursId);
      }
    } catch (error) {
      console.error('❌ useParcoursVideos - Erreur lors de l\'initialisation:', error);
    }
  }, [user, parcoursId]);

  useEffect(() => {
    if (!user || !parcoursId) {
      console.log('❌ useParcoursVideos - Pas d\'utilisateur ou de parcoursId:', { user: !!user, parcoursId });
      setState(prev => ({
        ...prev, 
        loading: false,
        error: !user ? 'User not authenticated' : 'No parcours ID provided',
        videos: [],
        totalVideos: 0,
        completedVideos: 0
      }));
      return;
    }

    console.log(`🔄 useParcoursVideos - Configuration du listener pour userId=${user.uid}, parcoursId=${parcoursId}`);
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Nettoyer le listener précédent s'il existe
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Initialiser les vidéos si nécessaire avant de configurer le listener
    initializeVideosIfNeeded().then(() => {
      try {
        // Configurer le listener temps réel
        const unsubscribe = VideoStatusService.observeUserVideosInParcours(
          user.uid,
          parcoursId,
          (videos) => {
            console.log('📼 useParcoursVideos - Vidéos mises à jour en temps réel:', videos.map(v => ({
              videoId: v.videoId,
              status: v.completionStatus,
              progress: v.progress
            })));
            
            // Calculer les vidéos complétées
            const completedVideos = videos.filter(video => video.completionStatus === 'completed').length;
            console.log('✅ useParcoursVideos - Vidéos complétées:', completedVideos);
            
            setState({
              videos,
              totalVideos: videos.length,
              completedVideos,
              loading: false,
              error: null,
            });
          }
        );

        unsubscribeRef.current = unsubscribe;
      } catch (err) {
        console.error('❌ useParcoursVideos - Erreur lors de la configuration du listener:', err);
        
        // Amélioration de la gestion des erreurs
        let errorMessage = 'Failed to fetch videos';
        
        if (err instanceof Error) {
          const errorString = err.toString();
          
          if (errorString.includes('requires an index')) {
            errorMessage = 'Database index is being created. Please try again in a few minutes.';
          } else {
            errorMessage = err.message;
          }
        }
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          videos: [],
          totalVideos: 0,
          completedVideos: 0
        }));
      }
    });

    // Fonction de nettoyage
    return () => {
      if (unsubscribeRef.current) {
        console.log('🧹 useParcoursVideos - Nettoyage du listener');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user, parcoursId, initializeVideosIfNeeded]);

  // Nettoyer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        console.log('🧹 useParcoursVideos - Nettoyage final du listener');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  // Fonction de rafraîchissement (pour compatibilité)
  const refresh = useCallback(() => {
    console.log('🔄 useParcoursVideos - Rafraîchissement des données (listeners temps réel actifs)');
    // En mode temps réel, pas besoin de recharger manuellement
    // Les listeners se chargent automatiquement des mises à jour
  }, []);

  return {
    ...state,
    refresh,
  };
} 