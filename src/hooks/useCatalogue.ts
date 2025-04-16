import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Parcours } from '../types/firebase';

export type ThemeFilter = 'all' | 'bourse' | 'crypto';
export type LevelFilter = 'all' | 'debutant' | 'avance' | 'expert';

interface CatalogueData {
  featured: Parcours | null;
  byCourse: Parcours[];
  byTheme: {
    bourse: Parcours[];
    crypto: Parcours[];
  };
  byLevel: {
    debutant: Parcours[];
    avance: Parcours[];
    expert: Parcours[];
  };
  recent: Parcours[];
  popular: Parcours[];
}

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
      
      const parcoursDataRaw = parcoursSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Vérifier si videoIds existe et calculer le nombre de vidéos
        const videoCount = data.videoCount || 
                           (Array.isArray(data.videoIds) ? data.videoIds.length : 0) || 
                           (Array.isArray(data.videos) ? data.videos.length : 0);
        
        // Utiliser le champ thumbnail s'il existe, sinon utiliser imageUrl
        const thumbnailUrl = data.thumbnail || data.imageUrl || '';
        
        // S'assurer que videos est toujours défini comme un tableau
        return {
          id: doc.id,
          ...data,
          title: data.title || '',
          titre: data.titre || data.title || '',
          description: data.description || '',
          theme: data.theme || 'bourse',
          level: data.level || 'debutant',
          imageUrl: thumbnailUrl, // Utiliser thumbnail comme imageUrl
          videoCount: videoCount,
          videos: Array.isArray(data.videos) ? data.videos : [],
          // Ajouter des valeurs par défaut pour les propriétés requises
          order: data.order || 0,
          position: data.position || { x: 0, y: 0 },
          quiz: data.quiz || { id: '', title: '', description: '', questions: [], position: { x: 0, y: 0 } }
        };
      });
      
      // Conversion typée pour éviter les erreurs TS
      const parcoursData = parcoursDataRaw as unknown as Parcours[];
      
      console.log('Parcours récupérés:', parcoursData.map(p => ({
        id: p.id,
        titre: p.titre || p.title,
        thumbnail: p.imageUrl,
        videoCount: p.videoCount
      })));
      
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
        const titreMatch = typeof item.titre === 'string' && item.titre.toLowerCase().includes(query);
        
        // Vérifier si la description contient la requête
        const descriptionMatch = typeof item.description === 'string' && item.description.toLowerCase().includes(query);
        
        // Vérifier si un titre de vidéo contient la requête
        const videoMatch = Array.isArray(item.videos) && item.videos.some(video => {
          return video && typeof video.title === 'string' && video.title.toLowerCase().includes(query);
        });
        
        return titleMatch || titreMatch || descriptionMatch || videoMatch;
      });
    }

    setFilteredParcours(result);
  }, [parcours, searchQuery, themeFilter, levelFilter]);

  // Données organisées pour l'affichage style Netflix
  const organizedData = useMemo<CatalogueData>(() => {
    const validParcours = Array.isArray(filteredParcours) 
      ? filteredParcours.filter(p => p && typeof p === 'object' && 'id' in p)
      : [];
      
    if (!validParcours.length) {
      return {
        featured: null,
        byCourse: [],
        byTheme: { bourse: [], crypto: [] },
        byLevel: { debutant: [], avance: [], expert: [] },
        recent: [],
        popular: []
      };
    }
    
    // Sélectionner un parcours en vedette (le premier par défaut, ou un aléatoire)
    const featured = validParcours[0];
    
    // Parcours par thème
    const bourse = validParcours.filter(p => p.theme === 'bourse');
    const crypto = validParcours.filter(p => p.theme === 'crypto');
    
    // Parcours par niveau
    const debutant = validParcours.filter(p => p.level === 'debutant');
    const avance = validParcours.filter(p => p.level === 'avance');
    const expert = validParcours.filter(p => p.level === 'expert');
    
    // Pour les parcours récents et populaires, on simule ici
    // Dans un cas réel, il faudrait des champs de date et de popularité dans Firestore
    const recent = [...validParcours].sort(() => Math.random() - 0.5).slice(0, 5);
    const popular = [...validParcours].sort(() => Math.random() - 0.5).slice(0, 5);
    
    return {
      featured,
      byCourse: validParcours,
      byTheme: { bourse, crypto },
      byLevel: { debutant, avance, expert },
      recent,
      popular
    };
  }, [filteredParcours]);

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

  // Pour le mode recherche
  const isSearchActive = searchQuery.trim().length > 0;

  return {
    parcours: filteredParcours,
    organizedData,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    themeFilter,
    setThemeFilter,
    levelFilter,
    setLevelFilter,
    refreshCatalogue,
    isSearchActive
  };
}; 