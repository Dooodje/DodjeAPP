import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Parcours } from '../types/firebase';

export type ThemeFilter = 'all' | 'bourse' | 'crypto';
export type LevelFilter = 'all' | 'debutant' | 'avance' | 'expert';

export const useCatalogue = () => {
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [filteredParcours, setFilteredParcours] = useState<Parcours[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [themeFilter, setThemeFilter] = useState<ThemeFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer tous les parcours depuis Firestore
  const fetchParcours = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const parcoursRef = collection(db, 'parcours');
      const parcoursSnapshot = await getDocs(parcoursRef);
      
      const parcoursData = parcoursSnapshot.docs.map(doc => {
        const data = doc.data();
        // S'assurer que videos est toujours défini comme un tableau
        return {
          id: doc.id,
          ...data,
          title: data.title || '',
          description: data.description || '',
          theme: data.theme || 'bourse',
          level: data.level || 'debutant',
          videos: Array.isArray(data.videos) ? data.videos : []
        };
      }) as Parcours[];
      
      setParcours(parcoursData);
      setFilteredParcours(parcoursData);
    } catch (err) {
      console.error('Erreur lors de la récupération des parcours:', err);
      setError('Impossible de charger le catalogue. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrer les parcours en fonction de la recherche et des filtres
  const filterParcours = useCallback(() => {
    if (!parcours.length) return;

    let result = [...parcours];

    // Filtrer par thème
    if (themeFilter !== 'all') {
      result = result.filter(item => item && item.theme === themeFilter);
    }

    // Filtrer par niveau
    if (levelFilter !== 'all') {
      result = result.filter(item => item && item.level === levelFilter);
    }

    // Filtrer par recherche textuelle
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(item => {
        // Vérifier que item existe et a les propriétés nécessaires
        if (!item) return false;
        
        // Vérifier si le titre contient la requête
        const titleMatch = typeof item.title === 'string' && item.title.toLowerCase().includes(query);
        
        // Vérifier si la description contient la requête
        const descriptionMatch = typeof item.description === 'string' && item.description.toLowerCase().includes(query);
        
        // Vérifier si un titre de vidéo contient la requête
        const videoMatch = Array.isArray(item.videos) && item.videos.some(video => {
          return video && typeof video.title === 'string' && video.title.toLowerCase().includes(query);
        });
        
        return titleMatch || descriptionMatch || videoMatch;
      });
    }

    setFilteredParcours(result);
  }, [parcours, searchQuery, themeFilter, levelFilter]);

  // Appliquer les filtres lorsque les dépendances changent
  useEffect(() => {
    filterParcours();
  }, [filterParcours, searchQuery, themeFilter, levelFilter]);

  // Charger les parcours au montage du composant
  useEffect(() => {
    fetchParcours();
  }, [fetchParcours]);

  // Hook de rechargement des données
  const refreshCatalogue = useCallback(async () => {
    await fetchParcours();
  }, [fetchParcours]);

  return {
    parcours: filteredParcours,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    themeFilter,
    setThemeFilter,
    levelFilter,
    setLevelFilter,
    refreshCatalogue
  };
}; 