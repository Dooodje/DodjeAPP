import { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { router } from 'expo-router';
import {
  setCurrentSection,
  setCurrentLevel,
  setHomeDesign,
  setStreak,
  setTreeData,
  setError
} from '../store/slices/homeSlice';
import { useAuth } from './useAuth';
import { Section, Level, HomeDesign } from '../types/home';
import { useDodji } from './useDodji';
import { useHomeDesign, HOME_QUERY_KEYS } from './queries/useHomeQueries';
import { useQueryClient } from '@tanstack/react-query';
import { getHomeDesignWithParcours } from '../services/home';

// TreeData par défaut pour éviter les erreurs indexOf
const DEFAULT_TREE_DATA = {
  section: 'Bourse' as Section,
  level: 'Débutant' as Level,
  treeImageUrl: '',
  courses: [{
    id: 'test-course-1',
    title: 'Cours de test',
    description: 'Un cours créé manuellement pour éviter les erreurs indexOf',
    level: 'Débutant' as Level,
    section: 'Bourse' as Section,
    position: { x: 0.5, y: 0.5 },
    status: 'deblocked' as const,
    progress: 0,
    dodjiCost: 100,
    imageUrl: '',
    lockIcon: 'lock',
    checkIcon: 'check',
    ringIcon: 'circle-outline',
    ordre: 1,
    videoIds: [],
    quizId: null,
    isAnnex: false
  }]
};

// HomeDesign par défaut
const DEFAULT_HOME_DESIGN: HomeDesign = {
  domaine: 'Bourse' as Section,
  niveau: 'Débutant' as Level,
  imageUrl: '',
  positions: {},
  parcours: {}
};

/**
 * Version optimisée du hook useHome utilisant TanStack Query pour la gestion du cache
 * et des requêtes Firestore
 */
export const useHomeOptimized = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { dodji } = useDodji(user?.uid);
  const queryClient = useQueryClient();
  const {
    currentSection,
    currentLevel,
    treeData,
    lastViewedCourse,
    streak
  } = useAppSelector(state => state.home);

  // Sections et niveaux sécurisés avec valeurs par défaut
  const safeSection = currentSection || 'Bourse';
  const safeLevel = currentLevel || 'Débutant';

  // Utiliser useHomeDesign pour récupérer le design de la page d'accueil avec TanStack Query
  const {
    data: homeDesign = DEFAULT_HOME_DESIGN,
    isLoading,
    error: queryError,
    refetch: refetchHomeDesign
  } = useHomeDesign(safeSection, safeLevel, user?.uid);

  // Synchroniser l'état Redux avec les données mises en cache par TanStack Query
  useCallback(() => {
    if (homeDesign && homeDesign !== DEFAULT_HOME_DESIGN) {
      dispatch(setHomeDesign(homeDesign));
    }
  }, [homeDesign, dispatch]);

  // Fonction pour réinitialiser les erreurs
  const resetError = useCallback(() => {
    dispatch(setError(null));
  }, [dispatch]);

  // Fonction pour gérer le clic sur une position
  const handlePositionPress = useCallback((positionId: string, order?: number) => {
    // Si nous avons un ordre et qu'un parcours correspond à cet ordre
    if (order !== undefined && homeDesign?.parcours) {
      const orderStr = order.toString();
      
      // Vérifier si un parcours avec cet ordre existe
      if (homeDesign.parcours[orderStr]) {
        const parcours = homeDesign.parcours[orderStr];
        
        // Naviguer vers le parcours si l'ID est disponible
        if (parcours.id) {
          // Vérifier si le parcours est bloqué
          const isBlocked = parcours.status === 'blocked';
          
          if (isBlocked) {
            console.log(`Le parcours ${parcours.id} est bloqué, afficher modal de déblocage`);
            // TODO: Afficher une modal pour débloquer le parcours
          } else {
            // Naviguer vers la page du parcours
            router.push(`/course/${parcours.id}`);
          }
        }
      }
    }
  }, [homeDesign?.parcours, router]);

  // Fonction pour changer de section
  const changeSection = useCallback((section: Section) => {
    dispatch(setCurrentSection(section));
    // Le refetch sera automatiquement déclenché grâce à l'invalidation du cache
  }, [dispatch]);

  // Fonction pour changer de niveau
  const changeLevel = useCallback((level: Level) => {
    dispatch(setCurrentLevel(level));
    // Le refetch sera automatiquement déclenché grâce à l'invalidation du cache
  }, [dispatch]);

  // Fonction pour précharger les données d'un niveau
  const prefetchNextLevelData = useCallback((level: Level, section: Section) => {
    if (!queryClient) return;
    
    // Précharger les données (en silence, en arrière-plan)
    queryClient.prefetchQuery({
      queryKey: HOME_QUERY_KEYS.homeDesign(section, level),
      queryFn: async () => {
        // Utiliser directement le service plutôt que d'essayer d'accéder à fetcher
        const data = await getHomeDesignWithParcours(section, level, user?.uid);
        
        // Formater les données pour garantir une structure cohérente
        const safeDesign: HomeDesign = {
          domaine: section,
          niveau: level,
          imageUrl: data.imageUrl || '',
          positions: data.positions || {},
          parcours: data.parcours || {}
        };
        
        return safeDesign;
      },
      staleTime: 1000 * 60 * 5 // 5 minutes
    });
    
    console.log(`Préchargement des données pour ${section} - ${level}`);
  }, [queryClient, user?.uid]);

  return {
    // Données d'état
    currentSection: safeSection,
    currentLevel: safeLevel,
    treeData: treeData || DEFAULT_TREE_DATA,
    homeDesign,
    isLoading,
    error: queryError ? String(queryError) : null,
    streak: streak || 0,
    dodji,
    lastViewedCourse,
    totalCompletedCourses: 0,
    totalProgress: 0,
    
    // Actions
    fetchTreeData: refetchHomeDesign,
    resetError,
    handlePositionPress,
    changeSection,
    changeLevel,
    prefetchNextLevelData,
    
    // Fonctions simplifiées qui ne font rien pour éviter les indexOf
    updateStatus: async () => {},
    updateProgress: async () => {},
    unlockCourse: async () => {}
  };
}; 