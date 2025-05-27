import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Image, Dimensions } from 'react-native';
import { RootState } from '../store';
import { router } from 'expo-router';
import {
  setCurrentSection,
  setCurrentLevel
} from '../store/slices/homeSlice';
import { useAuth } from './useAuth';
import { Section, Level } from '../types/home';
import { useUserStats } from './queries/useHomeQueries';
import { homeService } from '../services/home';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const REFERENCE_WIDTH = 550;

// Constantes pour toutes les sections et niveaux
const ALL_SECTIONS: Section[] = ['Bourse', 'Crypto'];
const ALL_LEVELS: Level[] = ['Débutant', 'Avancé', 'Expert'];

// Type pour les données mises en cache
interface CachedData {
  imageUrl: string;
  positions: Record<string, { x: number; y: number; order?: number; isAnnex: boolean }>;
  parcours?: Record<string, any>;
}

// Type pour le cache d'images avec dimensions
interface ImageCacheEntry {
  url: string;
  isLoaded: boolean;
  isLoading: boolean;
  error?: string;
  dimensions?: {
    width: number;
    height: number;
    finalWidth: number;
    finalHeight: number;
  };
}

// Cache global d'images pour éviter les rechargements
const globalImageCache = new Map<string, ImageCacheEntry>();

/**
 * Version optimisée du hook useHome utilisant un cache local pour éviter les rechargements
 * lors de la navigation entre sections et niveaux
 */
export function useHomeOptimized() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // État Redux pour la section et le niveau actuels
  const { currentSection, currentLevel } = useSelector((state: RootState) => state.home);
  
  // États locaux pour la gestion des modales
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  // Cache local pour toutes les combinaisons de données
  const [dataCache, setDataCache] = useState<Map<string, CachedData>>(new Map());
  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState<Map<string, () => void>>(new Map());
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

  // Cache pour les images de fond (utilise le cache global)
  const [imageCache, setImageCache] = useState<Map<string, ImageCacheEntry>>(globalImageCache);
  const [imagesLoadedCount, setImagesLoadedCount] = useState(0);
  const [isImagesLoading, setIsImagesLoading] = useState(true);

  // Utiliser seulement le hook des statistiques utilisateur (pas de rechargement)
  const { 
    data: userStats, 
    isLoading: userStatsLoading, 
    error: userStatsError 
  } = useUserStats(user?.uid);

  // Fonction pour obtenir la clé de cache
  const getCacheKey = useCallback((section: Section, level: Level) => {
    return `${section}-${level}`;
  }, []);

  // Fonction pour calculer les dimensions finales d'une image
  const calculateImageDimensions = useCallback((originalWidth: number, originalHeight: number) => {
    let finalWidth, finalHeight;
    
    if (screenWidth > REFERENCE_WIDTH) {
      // Pour les écrans plus larges que la référence
      finalWidth = REFERENCE_WIDTH;
      finalHeight = (originalHeight * REFERENCE_WIDTH) / originalWidth;
    } else {
      // Pour les écrans plus petits que la référence
      finalWidth = screenWidth;
      finalHeight = (originalHeight * screenWidth) / originalWidth;
    }
    
    return { finalWidth, finalHeight };
  }, []);

  // Fonction pour précharger une image avec dimensions
  const preloadImageWithDimensions = useCallback((url: string, key: string) => {
    if (!url || url.trim() === '') {
      console.log(`⚠️ URL d'image vide pour ${key}`);
      return;
    }

    // Vérifier si l'image est déjà en cache global
    const existingEntry = globalImageCache.get(key);
    if (existingEntry && existingEntry.isLoaded) {
      console.log(`📦 Image déjà en cache: ${key}`);
      setImagesLoadedCount(prevCount => {
        const newCount = prevCount + 1;
        if (newCount >= ALL_SECTIONS.length * ALL_LEVELS.length) {
          setIsImagesLoading(false);
          console.log('🎉 Toutes les images de fond sont préchargées');
        }
        return newCount;
      });
      return;
    }

    // Marquer comme en cours de chargement
    const loadingEntry: ImageCacheEntry = {
      url,
      isLoaded: false,
      isLoading: true
    };
    
    globalImageCache.set(key, loadingEntry);
    setImageCache(new Map(globalImageCache));

    // Obtenir les dimensions de l'image
    Image.getSize(
      url,
      (width, height) => {
        const { finalWidth, finalHeight } = calculateImageDimensions(width, height);
        
        // Précharger l'image avec Image.prefetch
        Image.prefetch(url)
          .then(() => {
            console.log(`✅ Image préchargée avec succès: ${key} (${finalWidth}x${finalHeight})`);
            
            const successEntry: ImageCacheEntry = {
              url,
              isLoaded: true,
              isLoading: false,
              dimensions: {
                width,
                height,
                finalWidth,
                finalHeight
              }
            };
            
            globalImageCache.set(key, successEntry);
            setImageCache(new Map(globalImageCache));

            setImagesLoadedCount(prevCount => {
              const newCount = prevCount + 1;
              if (newCount >= ALL_SECTIONS.length * ALL_LEVELS.length) {
                setIsImagesLoading(false);
                console.log('🎉 Toutes les images de fond sont préchargées');
              }
              return newCount;
            });
          })
          .catch((error) => {
            console.error(`❌ Erreur lors du préchargement de l'image ${key}:`, error);
            
            const errorEntry: ImageCacheEntry = {
              url,
              isLoaded: false,
              isLoading: false,
              error: 'Erreur de chargement'
            };
            
            globalImageCache.set(key, errorEntry);
            setImageCache(new Map(globalImageCache));

            setImagesLoadedCount(prevCount => {
              const newCount = prevCount + 1;
              if (newCount >= ALL_SECTIONS.length * ALL_LEVELS.length) {
                setIsImagesLoading(false);
                console.log('🎉 Préchargement des images terminé (avec erreurs)');
              }
              return newCount;
            });
          });
      },
      (error) => {
        console.error(`❌ Erreur lors de l'obtention des dimensions de l'image ${key}:`, error);
        
        const errorEntry: ImageCacheEntry = {
          url,
          isLoaded: false,
          isLoading: false,
          error: 'Erreur de dimensions'
        };
        
        globalImageCache.set(key, errorEntry);
        setImageCache(new Map(globalImageCache));

        setImagesLoadedCount(prevCount => {
          const newCount = prevCount + 1;
          if (newCount >= ALL_SECTIONS.length * ALL_LEVELS.length) {
            setIsImagesLoading(false);
            console.log('🎉 Préchargement des images terminé (avec erreurs)');
          }
          return newCount;
        });
      }
    );
  }, [calculateImageDimensions]);

  // Obtenir les données actuelles depuis le cache
  const currentData = useMemo(() => {
    const key = getCacheKey(currentSection, currentLevel);
    const data = dataCache.get(key);
    
    // Si on a des données, ajouter l'image mise en cache
    if (data) {
      const imageEntry = imageCache.get(key);
      return {
        ...data,
        imageUrl: imageEntry?.url || data.imageUrl,
        isImageLoaded: imageEntry?.isLoaded || false,
        imageDimensions: imageEntry?.dimensions
      };
    }
    
    return data;
  }, [dataCache, imageCache, currentSection, currentLevel, getCacheKey]);

  // Fonction pour obtenir les informations d'image en cache
  const getImageInfo = useCallback((section: Section, level: Level) => {
    const key = getCacheKey(section, level);
    return imageCache.get(key);
  }, [imageCache, getCacheKey]);

  // Fonction pour obtenir toutes les données d'images pour le pré-montage
  const getAllImagesData = useCallback(() => {
    const allImagesMap = new Map<string, {
      url: string;
      dimensions?: {
        width: number;
        height: number;
        finalWidth: number;
        finalHeight: number;
      };
      isLoaded: boolean;
    }>();

    ALL_SECTIONS.forEach(section => {
      ALL_LEVELS.forEach(level => {
        const key = getCacheKey(section, level);
        const imageEntry = imageCache.get(key);
        const dataEntry = dataCache.get(key);
        
        if (imageEntry?.url && dataEntry) {
          allImagesMap.set(key, {
            url: imageEntry.url,
            dimensions: imageEntry.dimensions,
            isLoaded: imageEntry.isLoaded
          });
        }
      });
    });

    return allImagesMap;
  }, [imageCache, dataCache, getCacheKey]);

  // Initialiser le cache avec toutes les combinaisons au montage
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🚀 Initialisation du cache pour toutes les sous-pages...');
    setIsInitialLoading(true);
    setIsImagesLoading(true);
    setLoadedCount(0);
    setImagesLoadedCount(0);

    const newDataCache = new Map<string, CachedData>();
    const newUnsubscribeFunctions = new Map<string, () => void>();

    // Créer des listeners pour toutes les combinaisons
    ALL_SECTIONS.forEach(section => {
      ALL_LEVELS.forEach(level => {
        const key = getCacheKey(section, level);
        
        try {
          // Configurer le listener pour cette combinaison
          const unsubscribe = homeService.observeHomeDesignWithParcours(
            section,
            level,
            user.uid,
            (data: CachedData) => {
              console.log(`✅ Cache mis à jour pour ${section} - ${level}`);
              
              // Mettre à jour le cache des données
              setDataCache(prevCache => {
                const newCache = new Map(prevCache);
                newCache.set(key, data);
                return newCache;
              });

              // Précharger l'image de fond si elle n'est pas déjà en cache
              if (data.imageUrl) {
                const currentImageEntry = globalImageCache.get(key);
                if (!currentImageEntry || currentImageEntry.url !== data.imageUrl) {
                  console.log(`🖼️ Préchargement de l'image pour ${section} - ${level}`);
                  preloadImageWithDimensions(data.imageUrl, key);
                }
              }

              // Incrémenter le compteur de chargement des données
              setLoadedCount(prevCount => {
                const newCount = prevCount + 1;
                if (newCount >= ALL_SECTIONS.length * ALL_LEVELS.length) {
                  setIsInitialLoading(false);
                  console.log('🎉 Cache des données initialisé pour toutes les sous-pages');
                }
                return newCount;
              });
            }
          );

          // Stocker la fonction de désabonnement
          newUnsubscribeFunctions.set(key, unsubscribe);
        } catch (error) {
          console.error(`❌ Erreur lors de l'initialisation du cache pour ${section} - ${level}:`, error);
        }
      });
    });

    // Stocker les fonctions de désabonnement
    setUnsubscribeFunctions(newUnsubscribeFunctions);

    // Fonction de nettoyage
    return () => {
      console.log('🧹 Nettoyage du cache et des listeners');
      newUnsubscribeFunctions.forEach((unsubscribe, key) => {
        try {
          unsubscribe();
        } catch (error) {
          console.error(`Erreur lors du nettoyage du listener ${key}:`, error);
        }
      });
    };
  }, [user?.uid, getCacheKey, preloadImageWithDimensions]);

  // Calculer l'état de chargement global (données + images)
  const isLoading = userStatsLoading || isInitialLoading || isImagesLoading;
  
  // Calculer l'erreur globale
  const error = userStatsError?.message || null;

  // Extraire les statistiques utilisateur
  const streak = userStats?.streak || 0;
  const dodji = userStats?.dodji || 0;

  // Fonction pour changer de section (navigation instantanée)
  const changeSection = useCallback((section: Section) => {
    console.log(`🔄 Navigation instantanée vers section: ${section}`);
    dispatch(setCurrentSection(section));
  }, [dispatch]);

  // Fonction pour changer de niveau (navigation instantanée)
  const changeLevel = useCallback((level: Level) => {
    console.log(`🔄 Navigation instantanée vers niveau: ${level}`);
    dispatch(setCurrentLevel(level));
  }, [dispatch]);

  // Fonction pour gérer les clics sur les positions
  const handlePositionPress = useCallback((positionId: string, order?: number) => {
    console.log(`🎯 Clic sur position: ${positionId}, ordre: ${order}`);
    
    if (order !== undefined && currentData?.parcours) {
      const orderStr = order.toString();
      const parcours = currentData.parcours[orderStr];
      
      if (parcours && parcours.id) {
        console.log(`🚀 Navigation vers le parcours: ${parcours.id}`);
        router.push(`/course/${parcours.id}`);
      } else {
        console.warn(`⚠️ Aucun parcours trouvé pour l'ordre: ${order}`);
      }
    } else {
      console.warn(`⚠️ Ordre non défini ou données de parcours manquantes`);
    }
  }, [currentData]);

  // Fonction pour récupérer les données de l'arbre (pour compatibilité)
  const fetchTreeData = useCallback(() => {
    console.log('🔄 Données déjà en cache - pas de rechargement nécessaire');
  }, []);

  // Fonction pour précharger les données (pour compatibilité)
  const prefetchNextLevelData = useCallback((level: Level, section: Section) => {
    const key = getCacheKey(section, level);
    const cachedData = dataCache.get(key);
    const cachedImage = imageCache.get(key);
    
    if (cachedData && cachedImage?.isLoaded) {
      console.log(`📦 Données et image déjà en cache pour ${section} - ${level}`);
    } else {
      console.log(`📦 Données/image en cours de chargement pour ${section} - ${level}`);
    }
  }, [dataCache, imageCache, getCacheKey]);

  // Log des changements de navigation (sans rechargement)
  useEffect(() => {
    if (currentData) {
      const imageEntry = imageCache.get(getCacheKey(currentSection, currentLevel));
      console.log('🏠 Navigation vers:', {
        section: currentSection,
        level: currentLevel,
        imageUrl: currentData.imageUrl ? 'Présente' : 'Absente',
        imageLoaded: imageEntry?.isLoaded ? 'Chargée' : 'En cours',
        imageDimensions: imageEntry?.dimensions ? `${imageEntry.dimensions.finalWidth}x${imageEntry.dimensions.finalHeight}` : 'Non calculées',
        positionsCount: Object.keys(currentData.positions || {}).length,
        parcoursCount: Object.keys(currentData.parcours || {}).length,
        source: 'Cache local'
      });
    }
  }, [currentSection, currentLevel, currentData, imageCache, getCacheKey]);

  // Log du statut du cache
  useEffect(() => {
    console.log(`📊 Cache: ${dataCache.size}/${ALL_SECTIONS.length * ALL_LEVELS.length} données chargées`);
    console.log(`🖼️ Images: ${imagesLoadedCount}/${ALL_SECTIONS.length * ALL_LEVELS.length} images préchargées`);
  }, [dataCache.size, imagesLoadedCount]);

  return {
    // États principaux (données depuis le cache)
    currentSection,
    currentLevel,
    homeDesign: currentData,
    isLoading,
    error,
    
    // Statistiques utilisateur
    streak,
    dodji,
    
    // Fonctions de navigation (instantanées)
    changeSection,
    changeLevel,
    handlePositionPress,
    
    // Fonctions utilitaires
    fetchTreeData,
    prefetchNextLevelData,
    getImageInfo,
    getAllImagesData,
    
    // Gestion des modales
    isModalVisible,
    setIsModalVisible,
    modalData,
    setModalData,
    
    // Informations de cache
    isPreloading: isInitialLoading || isImagesLoading,
    preloadedCount: dataCache.size,
    imagesLoadedCount,
    totalImages: ALL_SECTIONS.length * ALL_LEVELS.length,
    
    // Données pour le pré-montage des images
    allImagesData: getAllImagesData(),
    
    // Cache d'images pour débogage
    imageCache: imageCache
  };
} 