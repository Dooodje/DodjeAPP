import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import { getHomeDesignWithParcours, homeService } from '../../services/home';
import { Section, Level } from '../../types/home';
import { useAuth } from '../useAuth';
import { usePreopeningContext } from '../../contexts/PreopeningContext';

// Clés de requête pour la gestion du cache
export const HOME_QUERY_KEYS = {
  homeDesign: (section: Section, level: Level, userId?: string) => 
    ['homeDesign', section, level, userId] as const,
};

/**
 * Hook personnalisé pour observer les données de la page d'accueil en temps réel
 */
export function useHomeDesign(section: Section, level: Level, userId?: string) {
  const [data, setData] = useState<{
    imageUrl: string;
    positions: Record<string, { x: number; y: number; order?: number; isAnnex: boolean }>;
    parcours?: Record<string, any>;
  } | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    console.log(`🔄 Configuration des listeners pour section=${section}, level=${level}, userId=${userId}`);
    
    setIsLoading(true);
    setError(null);

    // Nettoyer le listener précédent s'il existe
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      // Configurer le listener temps réel
      const unsubscribe = homeService.observeHomeDesignWithParcours(
        section,
        level,
        userId,
        (homeData) => {
          console.log(`✅ Données de la page d'accueil mises à jour:`, homeData);
          setData(homeData);
          setIsLoading(false);
          setError(null);
        }
      );

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      console.error('Erreur lors de la configuration du listener:', err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      setIsLoading(false);
    }

    // Fonction de nettoyage
    return () => {
      if (unsubscribeRef.current) {
        console.log('🧹 Nettoyage du listener useHomeDesign');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [section, level, userId]);

  // Nettoyer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        console.log('🧹 Nettoyage final du listener useHomeDesign');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    // Fonction pour forcer un rechargement (pour compatibilité avec l'ancien code)
    refetch: () => {
      console.log('🔄 Rechargement forcé des données de la page d\'accueil (listeners temps réel actifs)');
      // En mode temps réel, pas besoin de recharger manuellement
      // Les listeners se chargent automatiquement des mises à jour
    }
  };
}

/**
 * Hook pour observer les statistiques utilisateur en temps réel
 */
export function useUserStats(userId?: string) {
  const { isLoading: authLoading } = useAuth();
  const { isPreopeningComplete } = usePreopeningContext();
  const [data, setData] = useState<{ streak: number; dodji: number } | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // CONDITION PRINCIPALE: Attendre que le preopening soit complètement terminé
    if (!isPreopeningComplete) {
      console.log('⏳ useUserStats: En attente de la fin du preopening avant de créer les listeners...');
      return;
    }

    // Attendre que l'authentification soit complètement terminée
    if (authLoading) {
      console.log('🔐 useUserStats: Authentification en cours, attente...');
      return;
    }

    if (!userId) {
      console.log('👤 useUserStats: Aucun utilisateur connecté');
      setData(undefined);
      setIsLoading(false);
      setError(null);
      return;
    }

    console.log(`🔄 useUserStats: Preopening terminé - Configuration du listener pour les statistiques de l'utilisateur ${userId}`);
    
    setIsLoading(true);
    setError(null);

    // Nettoyer le listener précédent s'il existe
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      // Configurer le listener temps réel pour les statistiques
      const unsubscribe = homeService.observeUserStats(userId, (stats) => {
        console.log(`✅ useUserStats: Statistiques utilisateur mises à jour:`, stats);
        setData(stats);
        setIsLoading(false);
        setError(null);
      });

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      console.error('useUserStats: Erreur lors de la configuration du listener des statistiques:', err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      setIsLoading(false);
    }

    // Fonction de nettoyage
    return () => {
      if (unsubscribeRef.current) {
        console.log('🧹 useUserStats: Nettoyage du listener');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [userId, authLoading, isPreopeningComplete]);

  // Nettoyer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        console.log('🧹 useUserStats: Nettoyage final du listener');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error
  };
}

/**
 * Fonction pour précharger les designs de page d'accueil (pour compatibilité)
 * Note: Avec les listeners temps réel, le préchargement est moins critique
 */
export const prefetchHomeDesigns = async (queryClient: any, sections: Section[], levels: Level[]) => {
  console.log('📦 Préchargement des designs de page d\'accueil (mode temps réel)');
  // En mode temps réel, nous n'avons pas besoin de précharger autant
  // Les données seront automatiquement mises à jour via les listeners
}; 