import { useState, useCallback, useEffect } from 'react';
import { Image } from 'react-native';
import { homeService } from '../services/home';
import { Section, Level } from '../types/home';
import { VideoStatusService } from '../services/businessLogic/VideoStatusService';
import { UserVideo } from '../types/video';
import { useAuth } from './useAuth';

// Constantes pour toutes les sections et niveaux
const ALL_SECTIONS: Section[] = ['Bourse', 'Crypto'];
const ALL_LEVELS: Level[] = ['Débutant', 'Avancé', 'Expert'];

// Type pour les données complètes (avec données utilisateur)
interface CompleteCachedData {
  imageUrl: string;
  positions: Record<string, { x: number; y: number; order?: number; isAnnex: boolean }>;
  parcours?: Record<string, any>;
  isStaticOnly?: boolean; // Indique si ce sont seulement des données statiques
  needsUserData?: boolean; // Indique si les données utilisateur sont encore nécessaires
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

// Cache global partagé avec useHomeOptimized (MÊME CACHE)
export const globalStaticDataCache = new Map<string, CompleteCachedData>();
export const globalImageCache = new Map<string, ImageCacheEntry>();

// Tracker pour savoir quelles données ont besoin d'être complétées avec les données utilisateur
export const pendingUserDataKeys = new Set<string>();

/**
 * Hook pour précharger TOUTES les données possibles dès le démarrage
 * Lance d'abord les données statiques, puis complète avec les données utilisateur
 */
export function usePreloadCache() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [loadedDataCount, setLoadedDataCount] = useState(0);
  const [loadedImagesCount, setLoadedImagesCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState<Map<string, () => void>>(new Map());
  const [staticDataLoaded, setStaticDataLoaded] = useState(false);

  // Fonction pour obtenir la clé de cache
  const getCacheKey = useCallback((section: Section, level: Level) => {
    return `${section}-${level}`;
  }, []);

  // Fonction pour calculer les dimensions finales d'une image
  const calculateImageDimensions = useCallback((originalWidth: number, originalHeight: number) => {
    const screenWidth = 400; // Valeur par défaut pour le calcul
    const REFERENCE_WIDTH = 550;
    
    let finalWidth, finalHeight;
    
    if (screenWidth > REFERENCE_WIDTH) {
      finalWidth = REFERENCE_WIDTH;
      finalHeight = (originalHeight * REFERENCE_WIDTH) / originalWidth;
    } else {
      finalWidth = screenWidth;
      finalHeight = (originalHeight * screenWidth) / originalWidth;
    }
    
    return { finalWidth, finalHeight };
  }, []);

  // Fonction pour précharger une image avec dimensions
  const preloadImageWithDimensions = useCallback((url: string, key: string) => {
    if (!url || url.trim() === '') {
      console.log(`⚠️ PreloadCache: URL d'image vide pour ${key}`);
      setLoadedImagesCount(prev => prev + 1);
      return;
    }

    // Vérifier si l'image est déjà en cache global
    const existingEntry = globalImageCache.get(key);
    if (existingEntry && existingEntry.isLoaded) {
      console.log(`📦 PreloadCache: Image déjà en cache: ${key}`);
      setLoadedImagesCount(prev => prev + 1);
      return;
    }

    // Marquer comme en cours de chargement
    const loadingEntry: ImageCacheEntry = {
      url,
      isLoaded: false,
      isLoading: true
    };
    
    globalImageCache.set(key, loadingEntry);

    // Obtenir les dimensions de l'image
    Image.getSize(
      url,
      (width, height) => {
        const { finalWidth, finalHeight } = calculateImageDimensions(width, height);
        
        // Précharger l'image avec Image.prefetch
        Image.prefetch(url)
          .then(() => {
            console.log(`✅ PreloadCache: Image préchargée avec succès: ${key} (${finalWidth}x${finalHeight})`);
            
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
            setLoadedImagesCount(prev => prev + 1);
          })
          .catch((error) => {
            console.error(`❌ PreloadCache: Erreur lors du préchargement de l'image ${key}:`, error);
            
            const errorEntry: ImageCacheEntry = {
              url,
              isLoaded: false,
              isLoading: false,
              error: 'Erreur de chargement'
            };
            
            globalImageCache.set(key, errorEntry);
            setLoadedImagesCount(prev => prev + 1);
          });
      },
      (error) => {
        console.error(`❌ PreloadCache: Erreur lors de l'obtention des dimensions de l'image ${key}:`, error);
        
        const errorEntry: ImageCacheEntry = {
          url,
          isLoaded: false,
          isLoading: false,
          error: 'Erreur de dimensions'
        };
        
        globalImageCache.set(key, errorEntry);
        setLoadedImagesCount(prev => prev + 1);
      }
    );
  }, [calculateImageDimensions]);

  // Fonction pour charger les données statiques (sans utilisateur)
  const loadStaticData = useCallback(async () => {
    console.log('🚀 PreloadCache: Début du chargement des données STATIQUES...');
    
    const promises: Promise<void>[] = [];
    
    ALL_SECTIONS.forEach(section => {
      ALL_LEVELS.forEach(level => {
        const key = getCacheKey(section, level);
        
        const promise = async () => {
          try {
            console.log(`📦 PreloadCache: Chargement statique pour ${section} - ${level}`);
            
            // Récupérer les données de design (statiques)
            const designData = await homeService.getHomeDesign(section, level);
            
            // Récupérer les parcours (statiques, sans statuts utilisateur)
            const parcoursData = await homeService.getStaticParcours(section, level);
            
            const staticData: CompleteCachedData = {
              imageUrl: designData.imageUrl,
              positions: designData.positions,
              parcours: parcoursData,
              isStaticOnly: true,
              needsUserData: true // Marquer que les données utilisateur sont nécessaires
            };
            
            // Mettre en cache les données statiques
            globalStaticDataCache.set(key, staticData);
            
            // Marquer cette clé comme ayant besoin de données utilisateur
            pendingUserDataKeys.add(key);
            
            // Précharger l'image de fond
            if (staticData.imageUrl) {
              console.log(`🖼️ PreloadCache: Préchargement de l'image pour ${section} - ${level}`);
              preloadImageWithDimensions(staticData.imageUrl, key);
            } else {
              setLoadedImagesCount(prev => prev + 1);
            }
            
            console.log(`✅ PreloadCache: Données statiques chargées pour ${section} - ${level}`);
            setLoadedDataCount(prev => prev + 1);
            
          } catch (error) {
            console.error(`❌ PreloadCache: Erreur lors du chargement statique de ${section} - ${level}:`, error);
            // En cas d'erreur, incrémenter quand même les compteurs pour ne pas bloquer
            setLoadedDataCount(prev => prev + 1);
            setLoadedImagesCount(prev => prev + 1);
          }
        };
        
        promises.push(promise());
      });
    });
    
    // Attendre que toutes les données statiques soient chargées
    await Promise.allSettled(promises);
    setStaticDataLoaded(true);
    console.log('🎉 PreloadCache: Toutes les données statiques sont chargées');
  }, [getCacheKey, preloadImageWithDimensions]);

  // Fonction pour compléter avec les données utilisateur
  const loadUserData = useCallback(async (userId: string) => {
    console.log('🔍 PreloadCache: loadUserData appelée avec:', {
      userId,
      staticDataLoaded,
      'pendingUserDataKeys.size': pendingUserDataKeys.size,
      'pendingKeys': Array.from(pendingUserDataKeys)
    });
    
    if (!staticDataLoaded || pendingUserDataKeys.size === 0) {
      console.log('📦 PreloadCache: Pas de données utilisateur à charger ou données statiques pas prêtes');
      return;
    }

    console.log(`🚀 PreloadCache: Début du chargement des données UTILISATEUR pour ${pendingUserDataKeys.size} combinaisons...`);
    
    const newUnsubscribeFunctions = new Map<string, () => void>();
    const videoUnsubscribeFunctions = new Map<string, () => void>();

    // Créer des listeners pour les données utilisateur seulement pour les clés en attente
    Array.from(pendingUserDataKeys).forEach(key => {
      const [section, level] = key.split('-') as [Section, Level];
      
      try {
        console.log(`👤 PreloadCache: Chargement des données utilisateur pour ${section} - ${level}`);
        
        // Configurer le listener pour cette combinaison avec données utilisateur
        const unsubscribe = homeService.observeHomeDesignWithParcours(
          section,
          level,
          userId,
          (data: CompleteCachedData) => {
            console.log(`✅ PreloadCache: Données utilisateur chargées pour ${section} - ${level}`);
            
            // Enrichir les données avec les informations de vidéos
            const enrichedData = { 
              ...data,
              isStaticOnly: false,
              needsUserData: false
            };
            
            if (enrichedData.parcours) {
              // Observer les vidéos pour chaque parcours
              Object.keys(enrichedData.parcours).forEach(parcoursKey => {
                const parcours = enrichedData.parcours![parcoursKey];
                if (parcours && parcours.id) {
                  const videoKey = `${key}-${parcours.id}`;
                  
                  // Nettoyer l'ancien listener s'il existe
                  if (videoUnsubscribeFunctions.has(videoKey)) {
                    videoUnsubscribeFunctions.get(videoKey)!();
                  }
                  
                  // Créer un nouveau listener pour les vidéos de ce parcours
                  try {
                    const videoUnsubscribe = VideoStatusService.observeUserVideosInParcours(
                      userId,
                      parcours.id,
                      (videos: UserVideo[]) => {
                        const completedVideos = videos.filter(v => v.completionStatus === 'completed').length;
                        
                        // Mettre à jour le cache avec les données de vidéos
                        const currentData = globalStaticDataCache.get(key);
                        if (currentData && currentData.parcours && currentData.parcours[parcoursKey]) {
                          const updatedData = {
                            ...currentData,
                            parcours: {
                              ...currentData.parcours,
                              [parcoursKey]: {
                                ...currentData.parcours[parcoursKey],
                                completedVideos,
                                totalVideos: videos.length
                              }
                            }
                          };
                          globalStaticDataCache.set(key, updatedData);
                        }
                      }
                    );
                    
                    videoUnsubscribeFunctions.set(videoKey, videoUnsubscribe);
                  } catch (videoError) {
                    console.error(`❌ PreloadCache: Erreur lors de l'observation des vidéos pour ${parcours.id}:`, videoError);
                  }
                }
              });
            }
            
            // Mettre à jour le cache avec les données complètes
            globalStaticDataCache.set(key, enrichedData);
            
            // Retirer cette clé des données en attente
            pendingUserDataKeys.delete(key);
            
            console.log(`🎯 PreloadCache: ${pendingUserDataKeys.size} combinaisons restantes à compléter`);
          }
        );

        // Stocker la fonction de désabonnement
        newUnsubscribeFunctions.set(key, unsubscribe);
      } catch (error) {
        console.error(`❌ PreloadCache: Erreur lors de l'initialisation des données utilisateur pour ${key}:`, error);
        // Retirer cette clé des données en attente même en cas d'erreur
        pendingUserDataKeys.delete(key);
      }
    });

    // Stocker les fonctions de désabonnement
    setUnsubscribeFunctions(prev => {
      const newMap = new Map(prev);
      newUnsubscribeFunctions.forEach((unsubscribe, key) => {
        newMap.set(key, unsubscribe);
      });
      return newMap;
    });
    
    console.log(`🎉 PreloadCache: Listeners utilisateur configurés pour ${newUnsubscribeFunctions.size} combinaisons`);
  }, [staticDataLoaded, pendingUserDataKeys]);

  // Démarrer le chargement des données statiques immédiatement
  useEffect(() => {
    console.log('🚀 PreloadCache: Démarrage immédiat du chargement des données statiques...');
    setIsLoading(true);
    setError(null);
    setLoadedDataCount(0);
    setLoadedImagesCount(0);
    
    loadStaticData();
  }, [loadStaticData]);

  // Compléter avec les données utilisateur quand l'utilisateur est disponible
  useEffect(() => {
    console.log('🔍 PreloadCache: Vérification des conditions pour charger les données utilisateur:', {
      'user?.uid': user?.uid,
      'staticDataLoaded': staticDataLoaded,
      'pendingUserDataKeys.size': pendingUserDataKeys.size
    });
    
    if (user?.uid && staticDataLoaded && pendingUserDataKeys.size > 0) {
      console.log('👤 PreloadCache: Utilisateur connecté, chargement des données utilisateur...');
      loadUserData(user.uid);
    } else {
      if (!user?.uid) {
        console.log('⏳ PreloadCache: En attente de la connexion utilisateur...');
      }
      if (!staticDataLoaded) {
        console.log('⏳ PreloadCache: En attente du chargement des données statiques...');
      }
      if (pendingUserDataKeys.size === 0) {
        console.log('✅ PreloadCache: Toutes les données utilisateur sont déjà chargées');
      }
    }
  }, [user?.uid, staticDataLoaded, loadUserData, pendingUserDataKeys.size]);

  // Calculer le pourcentage de progression
  const totalItems = ALL_SECTIONS.length * ALL_LEVELS.length;
  const dataProgress = (loadedDataCount / totalItems) * 50; // 50% pour les données
  const imageProgress = (loadedImagesCount / totalItems) * 50; // 50% pour les images
  const totalProgress = Math.min(100, dataProgress + imageProgress);

  // Vérifier si le préchargement est terminé
  const isComplete = loadedDataCount >= totalItems && loadedImagesCount >= totalItems;

  // Nettoyer les listeners au démontage
  useEffect(() => {
    return () => {
      console.log('🧹 PreloadCache: Nettoyage des listeners');
      unsubscribeFunctions.forEach((unsubscribe, key) => {
        try {
          unsubscribe();
        } catch (error) {
          console.error(`❌ PreloadCache: Erreur lors du nettoyage du listener ${key}:`, error);
        }
      });
    };
  }, [unsubscribeFunctions]);

  // Mettre à jour l'état de chargement
  useEffect(() => {
    if (isComplete) {
      setIsLoading(false);
    }
  }, [isComplete]);

  return {
    isLoading: isLoading && !isComplete,
    isComplete,
    progress: totalProgress / 100,
    loadedDataCount,
    loadedImagesCount,
    totalItems,
    error,
    staticDataLoaded,
    pendingUserDataCount: pendingUserDataKeys.size,
    // Statistiques pour le débogage
    cacheStats: {
      staticDataCached: globalStaticDataCache.size,
      imagesCached: globalImageCache.size,
      totalExpected: totalItems
    }
  };
}

// Fonction utilitaire pour vérifier si les données sont déjà en cache
export function isDataPreloaded(section: Section, level: Level): boolean {
  const key = `${section}-${level}`;
  return globalStaticDataCache.has(key) && globalImageCache.has(key);
}

// Fonction pour obtenir les données préchargées
export function getPreloadedData(section: Section, level: Level): CompleteCachedData | undefined {
  const key = `${section}-${level}`;
  return globalStaticDataCache.get(key);
}

// Fonction pour obtenir les informations d'image préchargées
export function getPreloadedImageInfo(section: Section, level: Level): ImageCacheEntry | undefined {
  const key = `${section}-${level}`;
  return globalImageCache.get(key);
} 