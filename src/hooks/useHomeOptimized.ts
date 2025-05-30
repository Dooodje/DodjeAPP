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
import { usePreopeningContext } from '../contexts/PreopeningContext';
import { Section, Level } from '../types/home';
import { useUserStats } from './queries/useHomeQueries';
import { homeService } from '../services/home';
import { VideoStatusService } from '../services/businessLogic/VideoStatusService';
import { UserVideo } from '../types/video';
import { 
  globalStaticDataCache, 
  globalImageCache as preloadGlobalImageCache,
  pendingUserDataKeys,
  isDataPreloaded,
  getPreloadedData,
  getPreloadedImageInfo
} from './usePreloadCache';

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
  isStaticOnly?: boolean;
  needsUserData?: boolean;
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

// Cache global d'images pour éviter les rechargements (utilise le cache partagé)
// const globalImageCache = preloadGlobalImageCache;

/**
 * Version optimisée du hook useHome utilisant un cache local pour éviter les rechargements
 * lors de la navigation entre sections et niveaux
 * Utilise maintenant les données préchargées par usePreloadCache et complète seulement ce qui manque
 */
export function useHomeOptimized() {
  const dispatch = useDispatch();
  const { user, isLoading: authLoading } = useAuth();
  const { isPreopeningComplete } = usePreopeningContext();
  
  // État Redux pour la section et le niveau actuels
  const { currentSection, currentLevel } = useSelector((state: RootState) => state.home);
  
  // États locaux pour la gestion des modales
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  // Cache local pour toutes les combinaisons de données (enrichi avec les données utilisateur)
  const [dataCache, setDataCache] = useState<Map<string, CachedData>>(new Map());
  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState<Map<string, () => void>>(new Map());
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

  // Cache pour les images de fond (utilise le cache global partagé)
  const [imageCache, setImageCache] = useState<Map<string, ImageCacheEntry>>(preloadGlobalImageCache);
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

  // Fonction pour précharger une image avec dimensions (mise à jour pour utiliser le cache partagé)
  const preloadImageWithDimensions = useCallback((url: string, key: string) => {
    if (!url || url.trim() === '') {
      console.log(`⚠️ URL d'image vide pour ${key}`);
      return;
    }

    // Vérifier si l'image est déjà en cache global partagé
    const existingEntry = preloadGlobalImageCache.get(key);
    if (existingEntry && existingEntry.isLoaded) {
      console.log(`📦 Image déjà en cache partagé: ${key}`);
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

    // Si l'image n'est pas en cache, la précharger
    const loadingEntry: ImageCacheEntry = {
      url,
      isLoaded: false,
      isLoading: true
    };
    
    preloadGlobalImageCache.set(key, loadingEntry);
    setImageCache(new Map(preloadGlobalImageCache));

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
            
            preloadGlobalImageCache.set(key, successEntry);
            setImageCache(new Map(preloadGlobalImageCache));

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
            
            preloadGlobalImageCache.set(key, errorEntry);
            setImageCache(new Map(preloadGlobalImageCache));

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
        
        preloadGlobalImageCache.set(key, errorEntry);
        setImageCache(new Map(preloadGlobalImageCache));

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
    const allImages = new Map<string, {
      url: string;
      dimensions?: {
        width: number;
        height: number;
        finalWidth: number;
        finalHeight: number;
      };
      isLoaded: boolean;
    }>();

    // Parcourir toutes les combinaisons section/niveau
    for (const section of ALL_SECTIONS) {
      for (const level of ALL_LEVELS) {
        const key = `${section}-${level}`;
        const imageEntry = preloadGlobalImageCache.get(key);
        
        // Retourner les images si elles sont disponibles et chargées, même sans dataEntry
        if (imageEntry?.url && imageEntry?.isLoaded) {
          allImages.set(key, {
            url: imageEntry.url,
            dimensions: imageEntry.dimensions,
            isLoaded: imageEntry.isLoaded,
          });
        }
      }
    }

    return allImages;
  }, []);

  // Initialiser le cache en utilisant les données préchargées et en complétant ce qui manque
  useEffect(() => {
    // CONDITION PRINCIPALE: Attendre que le preopening soit complètement terminé
    if (!isPreopeningComplete) {
      console.log('⏳ useHomeOptimized: En attente de la fin du preopening avant de créer les listeners...');
      return;
    }

    // Attendre que l'authentification soit complètement terminée
    if (authLoading) {
      console.log('🔐 useHomeOptimized: Authentification en cours, attente avant initialisation des listeners...');
      return;
    }

    console.log('🚀 useHomeOptimized: Preopening terminé et authentification complète - Initialisation du cache optimisé avec données préchargées...');
    console.log(`👤 État utilisateur: ${user ? `connecté (${user.uid})` : 'non connecté'}`);
    
    setIsInitialLoading(true);
    setIsImagesLoading(true);
    setLoadedCount(0);
    
    // Analyser l'état du cache préchargé
    let preloadedDataCount = 0;
    let preloadedImagesCount = 0;
    let missingDataKeys: string[] = [];
    
    ALL_SECTIONS.forEach(section => {
      ALL_LEVELS.forEach(level => {
        const key = getCacheKey(section, level);
        
        // Vérifier les données préchargées
        const preloadedData = globalStaticDataCache.get(key);
        if (preloadedData) {
          preloadedDataCount++;
          console.log(`📦 Données déjà préchargées pour ${section} - ${level} (statique: ${preloadedData.isStaticOnly})`);
        } else {
          missingDataKeys.push(key);
          console.log(`❌ Données manquantes pour ${section} - ${level}`);
        }
        
        // Vérifier les images préchargées
        const preloadedImage = preloadGlobalImageCache.get(key);
        if (preloadedImage && preloadedImage.isLoaded) {
          preloadedImagesCount++;
          console.log(`🖼️ Image déjà préchargée pour ${section} - ${level}`);
        }
      });
    });
    
    console.log(`📊 État du préchargement: ${preloadedDataCount}/${ALL_SECTIONS.length * ALL_LEVELS.length} données, ${preloadedImagesCount}/${ALL_SECTIONS.length * ALL_LEVELS.length} images`);
    console.log(`🔄 Données en attente de completion utilisateur: ${pendingUserDataKeys.size}`);
    console.log(`❌ Données complètement manquantes: ${missingDataKeys.length}`);
    
    // Copier toutes les données préchargées dans le cache local
    const newDataCache = new Map<string, CachedData>();
    ALL_SECTIONS.forEach(section => {
      ALL_LEVELS.forEach(level => {
        const key = getCacheKey(section, level);
        const preloadedData = globalStaticDataCache.get(key);
        if (preloadedData) {
          newDataCache.set(key, preloadedData);
        }
      });
    });
    
    setDataCache(newDataCache);
    setLoadedCount(preloadedDataCount);
    
    // Mettre à jour le cache d'images
    setImageCache(new Map(preloadGlobalImageCache));
    setImagesLoadedCount(preloadedImagesCount);
    
    if (preloadedImagesCount >= ALL_SECTIONS.length * ALL_LEVELS.length) {
      setIsImagesLoading(false);
      console.log('🎉 Toutes les images étaient déjà préchargées');
    }

    // Si toutes les données sont préchargées, on peut déjà afficher l'interface
    if (preloadedDataCount >= ALL_SECTIONS.length * ALL_LEVELS.length) {
      console.log('🎉 Toutes les données statiques sont disponibles, interface prête');
      setIsInitialLoading(false);
    }

    // Si pas d'utilisateur connecté, on s'arrête ici avec les données statiques
    if (!user?.uid) {
      console.log('👤 Pas d\'utilisateur connecté, utilisation des données statiques uniquement');
      return;
    }

    // IMPORTANT: Créer des listeners seulement si l'authentification est complète
    console.log('🔐 Authentification complète, création des listeners Firestore...');

    // Créer des listeners seulement pour ce qui manque vraiment (avec utilisateur connecté)
    const newUnsubscribeFunctions = new Map<string, () => void>();
    const videoUnsubscribeFunctions = new Map<string, () => void>();
    let listenersCreated = 0;

    // 1. Créer des listeners pour les données complètement manquantes
    missingDataKeys.forEach(key => {
      const [section, level] = key.split('-') as [Section, Level];
      console.log(`⚡ Création d'un listener pour ${section} - ${level} (données complètement manquantes)`);
      
      try {
        const unsubscribe = homeService.observeHomeDesignWithParcours(
          section,
          level,
          user.uid,
          (data: CachedData) => {
            console.log(`✅ Données complètes chargées pour ${section} - ${level} (était manquant)`);
            
            // Enrichir les données avec les informations de vidéos
            const enrichedData = { ...data, isStaticOnly: false, needsUserData: false };
            
            if (enrichedData.parcours) {
              // Observer les vidéos pour chaque parcours
              Object.keys(enrichedData.parcours).forEach(parcoursKey => {
                const parcours = enrichedData.parcours![parcoursKey];
                if (parcours && parcours.id) {
                  const videoKey = `${key}-${parcours.id}`;
                  
                  if (videoUnsubscribeFunctions.has(videoKey)) {
                    videoUnsubscribeFunctions.get(videoKey)!();
                  }
                  
                  try {
                    const videoUnsubscribe = VideoStatusService.observeUserVideosInParcours(
                      user.uid,
                      parcours.id,
                      (videos: UserVideo[]) => {
                        const completedVideos = videos.filter(v => v.completionStatus === 'completed').length;
                        
                        setDataCache(prevCache => {
                          const newCache = new Map(prevCache);
                          const currentData = newCache.get(key);
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
                            newCache.set(key, updatedData);
                          }
                          return newCache;
                        });
                      }
                    );
                    
                    videoUnsubscribeFunctions.set(videoKey, videoUnsubscribe);
                  } catch (videoError) {
                    console.error(`Erreur lors de l'observation des vidéos pour ${parcours.id}:`, videoError);
                  }
                }
              });
            }
            
            setDataCache(prevCache => {
              const newCache = new Map(prevCache);
              newCache.set(key, enrichedData);
              return newCache;
            });

            if (enrichedData.imageUrl) {
              const currentImageEntry = preloadGlobalImageCache.get(key);
              if (!currentImageEntry || currentImageEntry.url !== enrichedData.imageUrl) {
                console.log(`🖼️ Préchargement de l'image pour ${section} - ${level} (était manquante)`);
                preloadImageWithDimensions(enrichedData.imageUrl, key);
              }
            }

            setLoadedCount(prevCount => {
              const newCount = prevCount + 1;
              if (newCount >= ALL_SECTIONS.length * ALL_LEVELS.length) {
                setIsInitialLoading(false);
                console.log('🎉 Cache des données initialisé (avec données manquantes chargées)');
              }
              return newCount;
            });
          }
        );

        newUnsubscribeFunctions.set(key, unsubscribe);
        listenersCreated++;
      } catch (error) {
        console.error(`❌ Erreur lors de l'initialisation du cache pour ${key}:`, error);
      }
    });

    // 2. NOUVEAU: Créer des listeners pour TOUTES les données préchargées pour assurer les mises à jour temps réel
    let userDataListenersCreated = 0;
    if (user?.uid) {
      ALL_SECTIONS.forEach(section => {
        ALL_LEVELS.forEach(level => {
          const key = getCacheKey(section, level);
          const preloadedData = globalStaticDataCache.get(key);
          
          // Créer un listener pour TOUTES les données préchargées (pas seulement celles qui ont besoin de données utilisateur)
          if (preloadedData) {
            console.log(`🔄 Création d'un listener temps réel pour ${section} - ${level} (données préchargées)`);
            
            try {
              const unsubscribe = homeService.observeHomeDesignWithParcours(
                section,
                level,
                user.uid,
                (data: CachedData) => {
                  console.log(`🔄 Mise à jour temps réel pour ${section} - ${level}`);
                  
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
                        
                        if (videoUnsubscribeFunctions.has(videoKey)) {
                          videoUnsubscribeFunctions.get(videoKey)!();
                        }
                        
                        try {
                          const videoUnsubscribe = VideoStatusService.observeUserVideosInParcours(
                            user.uid,
                            parcours.id,
                            (videos: UserVideo[]) => {
                              const completedVideos = videos.filter(v => v.completionStatus === 'completed').length;
                              
                              setDataCache(prevCache => {
                                const newCache = new Map(prevCache);
                                const currentData = newCache.get(key);
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
                                  newCache.set(key, updatedData);
                                  
                                  // Mettre à jour aussi le cache global
                                  globalStaticDataCache.set(key, updatedData);
                                }
                                return newCache;
                              });
                            }
                          );
                          
                          videoUnsubscribeFunctions.set(videoKey, videoUnsubscribe);
                        } catch (videoError) {
                          console.error(`Erreur lors de l'observation des vidéos pour ${parcours.id}:`, videoError);
                        }
                      }
                    });
                  }
                  
                  // Mettre à jour le cache local
                  setDataCache(prevCache => {
                    const newCache = new Map(prevCache);
                    newCache.set(key, enrichedData);
                    return newCache;
                  });
                  
                  // Mettre à jour aussi le cache global pour les autres composants
                  globalStaticDataCache.set(key, enrichedData);
                  
                  // Retirer cette clé des données en attente
                  pendingUserDataKeys.delete(key);
                  
                  console.log(`🎯 useHomeOptimized: ${pendingUserDataKeys.size} combinaisons restantes à compléter`);
                }
              );

              newUnsubscribeFunctions.set(`realtime-${key}`, unsubscribe);
              userDataListenersCreated++;
            } catch (error) {
              console.error(`❌ Erreur lors de l'initialisation des listeners temps réel pour ${key}:`, error);
            }
          }
        });
      });
    }

    // Stocker les fonctions de désabonnement
    setUnsubscribeFunctions(newUnsubscribeFunctions);

    console.log(`📊 Résumé: ${listenersCreated} listeners créés pour les données manquantes`);
    console.log(`🔄 ${userDataListenersCreated} listeners temps réel créés pour les données préchargées`);
    console.log(`⏳ En attente de completion: ${pendingUserDataKeys.size} combinaisons`);

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
      
      videoUnsubscribeFunctions.forEach((unsubscribe, key) => {
        try {
          unsubscribe();
        } catch (error) {
          console.error(`Erreur lors du nettoyage du listener vidéo ${key}:`, error);
        }
      });
    };
  }, [user?.uid, getCacheKey, preloadImageWithDimensions, authLoading, isPreopeningComplete]); // Ajout de isPreopeningComplete

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
        isStaticOnly: currentData.isStaticOnly ? 'Données statiques' : 'Données complètes',
        source: 'Cache local optimisé'
      });
    }
  }, [currentSection, currentLevel, currentData, imageCache, getCacheKey]);

  // Log du statut du cache
  useEffect(() => {
    const preloadedDataCount = globalStaticDataCache.size;
    const preloadedImagesCount = Array.from(preloadGlobalImageCache.values()).filter(img => img.isLoaded).length;
    
    console.log(`📊 Cache optimisé: ${dataCache.size}/${ALL_SECTIONS.length * ALL_LEVELS.length} données chargées`);
    console.log(`🖼️ Images: ${imagesLoadedCount}/${ALL_SECTIONS.length * ALL_LEVELS.length} images préchargées`);
    console.log(`📦 Préchargement: ${preloadedDataCount} données statiques, ${preloadedImagesCount} images préchargées`);
    console.log(`⏳ En attente de completion: ${pendingUserDataKeys.size} combinaisons`);
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