import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Section, Level, HomeDesign } from '../../types/home';
import { getHomeDesignWithParcours } from '../../services/home';

// Clés pour les requêtes
export const HOME_QUERY_KEYS = {
  home: 'home',
  homeDesign: (section: Section, level: Level) => 
    ['home', 'design', section, level],
};

/**
 * Hook pour récupérer le design de la page d'accueil avec les parcours
 * Utilise TanStack Query pour mettre en cache et optimiser les requêtes
 */
export function useHomeDesign(
  section: Section,
  level: Level,
  userId?: string,
  options = {}
) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: HOME_QUERY_KEYS.homeDesign(section, level),
    queryFn: async () => {
      const data = await getHomeDesignWithParcours(section, level, userId);
      
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
    // Rendre l'initialisation des données plus rapide
    placeholderData: () => {
      // Essayer de réutiliser les données d'une autre section ou niveau comme valeur temporaire
      const cachedDesigns = queryClient.getQueriesData<HomeDesign>({
        queryKey: ['home', 'design']
      });
      
      // Trouver le design mis en cache le plus récent
      if (cachedDesigns.length > 0) {
        return cachedDesigns[0][1];
      }
      
      // Valeur par défaut à utiliser si aucune donnée n'est mise en cache
      return {
        domaine: section,
        niveau: level,
        imageUrl: '',
        positions: {},
        parcours: {}
      };
    },
    refetchOnMount: true, // Toujours récupérer les données à jour lors du montage
    ...options
  });
}

/**
 * Fonction pour précharger les designs de la page d'accueil
 * Peut être appelée lors de l'initialisation de l'application ou de la navigation
 */
export function prefetchHomeDesigns(
  queryClient: any,
  userId?: string
) {
  // Précharger les sections/niveaux les plus courants
  const sections: Section[] = ['Bourse', 'Crypto'];
  const levels: Level[] = ['Débutant', 'Avancé'];
  
  // Précharger chaque combinaison avec une priorité basse
  sections.forEach(section => {
    levels.forEach(level => {
      queryClient.prefetchQuery({
        queryKey: HOME_QUERY_KEYS.homeDesign(section, level),
        queryFn: () => getHomeDesignWithParcours(section, level, userId),
        staleTime: 10 * 60 * 1000, // 10 minutes
        cacheTime: 15 * 60 * 1000, // 15 minutes
      });
    });
  });
} 