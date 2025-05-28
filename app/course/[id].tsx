import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, router as globalRouter } from 'expo-router';
import { courseService } from '../../src/services/course';
import { ParcoursStatusService } from '../../src/services/businessLogic/ParcoursStatusService';
import CourseBackground from '../../src/components/course/CourseBackground';
import VideoButton from '../../src/components/course/VideoButton';
import QuizButton from '../../src/components/course/QuizButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Course, CourseContent } from '../../src/types/course';
import { useAuth } from '../../src/hooks/useAuth';
import { QuizStatusService } from '../../src/services/businessLogic/QuizStatusService';
import { collection, getDocs, onSnapshot, query, where, documentId } from 'firebase/firestore';
import { db } from '../../src/services/firebase';
import { Rectangle11 } from '../../src/components/Rectangle11';
import ParcoursLockedModal from '../../src/components/ui/ParcoursLockedModal';
import { LogoLoadingSpinner } from '../../src/components/ui/LogoLoadingSpinner';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Cache local pour les données de parcours
const parcoursCache = new Map<string, { data: ParcoursData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Interface pour les données de parcours
interface ParcoursData {
  id: string;
  title?: string;
  titre?: string;
  description?: string;
  quizId?: string; // ID du quiz associé au parcours
  domaine?: string;
  videos?: Array<{
    id: string;
    title?: string;
    titre?: string;
    duration?: number;
    duree?: number;
    order?: number;
    ordre?: number;
  }>;
  design?: {
    id?: string;
    backgroundImageUrl?: string;
    imageUrl?: string;
    positions?: Record<string, { x: number; y: number; order?: number; isAnnex: boolean; isQuiz?: boolean }>;
  };
}

// Interface pour une vidéo du parcours
interface ParcoursVideo {
  id: string;
  title?: string;
  titre?: string;
  duration?: number;
  duree?: number;
  order?: number;
  ordre?: number;
}

// Interface pour la progression des vidéos
interface VideoStatus {
  [videoId: string]: {
    completionStatus: 'blocked' | 'unblocked' | 'completed';
    currentTime?: number;
    duration?: number;
    progress?: number;
  };
}

export default function CoursePage() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: 'catalogue' | 'quiz' }>();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parcoursData, setParcoursData] = useState<ParcoursData | null>(null);
  const [lastViewedVideoId, setLastViewedVideoId] = useState<string | undefined>(undefined);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>({});
  const [imageDimensions, setImageDimensions] = useState({ width: screenWidth, height: screenHeight });
  const [parcoursStatus, setParcoursStatus] = useState<'blocked' | 'unblocked' | 'in_progress' | 'completed' | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Références pour stocker les fonctions de désabonnement
  const unsubscribeParcoursRef = useRef<(() => void) | null>(null);
  const unsubscribeVideoStatusRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef(false);

  // Callback pour recevoir les dimensions de l'image d'arrière-plan
  const handleImageDimensionsChange = useCallback((width: number, height: number) => {
    console.log(`Dimensions de l'image d'arrière-plan mises à jour: ${width}x${height}`);
    if (width > 0 && height > 0) {
      setImageDimensions({ width, height });
    }
  }, []);

  // Fonction optimisée pour récupérer les vidéos en batch
  const fetchVideosInBatch = useCallback(async (videoIds: string[]) => {
    if (!videoIds.length) return [];
    
    try {
      console.log(`🚀 Récupération optimisée de ${videoIds.length} vidéos en batch`);
      
      // Diviser en chunks de 10 (limite Firestore pour les requêtes 'in')
      const chunks = [];
      for (let i = 0; i < videoIds.length; i += 10) {
        chunks.push(videoIds.slice(i, i + 10));
      }
      
      const allVideos: ParcoursVideo[] = [];
      
      // Récupérer chaque chunk en parallèle
      const chunkPromises = chunks.map(async (chunk) => {
        const videosQuery = query(
          collection(db, 'videos'),
          where(documentId(), 'in', chunk)
        );
        const snapshot = await getDocs(videosQuery);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ParcoursVideo));
      });
      
      const chunkResults = await Promise.all(chunkPromises);
      chunkResults.forEach(videos => allVideos.push(...videos));
      
      // Trier par ordre
      allVideos.sort((a, b) => {
        const orderA = a.order || a.ordre || 0;
        const orderB = b.order || b.ordre || 0;
        return orderA - orderB;
      });
      
      console.log(`✅ ${allVideos.length} vidéos récupérées et triées en batch`);
      return allVideos;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des vidéos en batch:', error);
      return [];
    }
  }, []);

  // Fonction optimisée pour calculer et mettre à jour les statuts des vidéos
  const updateVideoStatuses = useCallback(async (data: ParcoursData) => {
    if (!data.videos || data.videos.length === 0 || !user?.uid) return;
    
    try {
      console.log(`🔄 Mise à jour des statuts pour ${data.videos.length} vidéos`);
      const statuses: VideoStatus = {};
      
      // Récupérer seulement les vidéos de ce parcours
      const videoIds = data.videos.map(v => v.id).filter(Boolean);
      if (!videoIds.length) return;
      
      // Requête optimisée pour récupérer seulement les vidéos de ce parcours
      const userVideosQuery = query(
        collection(db, 'users', user.uid, 'video'),
        where(documentId(), 'in', videoIds.slice(0, 10)) // Limite Firestore
      );
      
      const userVideosSnapshot = await getDocs(userVideosQuery);
      const userVideoDocs = new Map(
        userVideosSnapshot.docs.map(doc => [doc.id, doc.data()])
      );

      // Pour chaque vidéo du parcours
      for (const video of data.videos) {
        if (!video.id) continue;

        // Récupérer le document de la vidéo dans la sous-collection de l'utilisateur
        const userVideoDoc = userVideoDocs.get(video.id);
        
        if (userVideoDoc) {
          // Si le document existe, utiliser son statut
          statuses[video.id] = {
            completionStatus: userVideoDoc.completionStatus || 'blocked',
            currentTime: userVideoDoc.currentTime || 0,
            duration: userVideoDoc.duration || video.duration || video.duree || 0,
            progress: userVideoDoc.progress || 0
          };
          console.log(`Vidéo ${video.id} - Status from DB:`, userVideoDoc.completionStatus);
        } else {
          // Si le document n'existe pas, initialiser avec le statut par défaut
          statuses[video.id] = {
            completionStatus: 'blocked',
            currentTime: 0,
            duration: video.duration || video.duree || 0,
            progress: 0
          };
          console.log(`Vidéo ${video.id} - No status in DB, defaulting to blocked`);
        }
      }

      // S'assurer que la première vidéo est au moins débloquée si aucune vidéo n'est complétée
      const hasCompletedVideos = Object.values(statuses).some(
        status => status.completionStatus === 'completed'
      );
      
      if (!hasCompletedVideos && data.videos.length > 0 && data.videos[0].id) {
        const firstVideoId = data.videos[0].id;
        if (statuses[firstVideoId]?.completionStatus === 'blocked') {
          statuses[firstVideoId].completionStatus = 'unblocked';
          console.log(`Première vidéo ${firstVideoId} débloquée par défaut`);
        }
      }

      console.log('Statuts finaux des vidéos:', statuses);
      setVideoStatus(statuses);

      // Mettre à jour lastViewedVideoId si nécessaire
      const lastViewed = Object.entries(statuses).find(
        ([_, status]) => (status.progress || 0) > 0
      );
      if (lastViewed) {
        setLastViewedVideoId(lastViewed[0]);
      }
      
    } catch (error) {
      console.error('Erreur lors de la récupération des statuts des vidéos:', error);
      
      // En cas d'erreur, initialiser avec les statuts par défaut
      const defaultStatus: VideoStatus = {};
      data.videos.forEach((video, index) => {
        if (video.id) {
          defaultStatus[video.id] = {
            completionStatus: index === 0 ? 'unblocked' : 'blocked',
            currentTime: 0,
            duration: video.duration || video.duree || 0,
            progress: 0
          };
        }
      });
      setVideoStatus(defaultStatus);
    }
  }, [user?.uid]);

  // Fonction optimisée pour configurer le listener des statuts des vidéos
  const setupVideoStatusListener = useCallback(() => {
    if (!user?.uid || !parcoursData?.videos?.length || unsubscribeVideoStatusRef.current) return;

    console.log('Configuration du listener des statuts des vidéos en temps réel');
    
    // Observer seulement les vidéos de ce parcours
    const videoIds = parcoursData.videos.map(v => v.id).filter(Boolean);
    if (!videoIds.length) return;
    
    // Utiliser une requête plus spécifique
    const userVideosRef = collection(db, 'users', user.uid, 'video');
    const unsubscribe = onSnapshot(
      userVideosRef,
      (snapshot) => {
        console.log('Mise à jour des statuts des vidéos reçue');
        
        // Filtrer seulement les changements pertinents pour ce parcours
        const relevantChanges = snapshot.docs.filter(doc => 
          videoIds.includes(doc.id)
        );
        
        if (relevantChanges.length > 0) {
          console.log(`${relevantChanges.length} changements pertinents détectés`);
          updateVideoStatuses(parcoursData);
        }
      },
      (error) => {
        console.error('Erreur lors de l\'observation des statuts des vidéos:', error);
      }
    );

    unsubscribeVideoStatusRef.current = unsubscribe;
  }, [user?.uid, parcoursData, updateVideoStatuses]);

  // Fonction pour vérifier le cache local
  const getCachedParcours = useCallback((parcoursId: string): ParcoursData | null => {
    const cached = parcoursCache.get(parcoursId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('📦 Utilisation du cache local pour le parcours');
      return cached.data;
    }
    return null;
  }, []);

  // Fonction pour mettre en cache les données du parcours
  const setCachedParcours = useCallback((parcoursId: string, data: ParcoursData) => {
    parcoursCache.set(parcoursId, {
      data,
      timestamp: Date.now()
    });
  }, []);

  // Fonction optimisée pour charger les données du parcours
  const loadParcoursData = useCallback(async (parcoursId: string) => {
    try {
      console.log(`🚀 Chargement optimisé du parcours ${parcoursId}`);
      
      // Vérifier le cache d'abord
      const cachedData = getCachedParcours(parcoursId);
      if (cachedData) {
        setParcoursData(cachedData);
        await updateVideoStatuses(cachedData);
        setLoading(false);
        return;
      }
      
      // Si pas en cache, récupérer depuis Firestore
      const data = await courseService.getCourseById(parcoursId);
      if (!data) {
        setError("Ce parcours n'existe pas ou a été supprimé.");
        setLoading(false);
        return;
      }
      
      // Optimiser la récupération des vidéos
      if (data.videoIds && Array.isArray(data.videoIds) && data.videoIds.length > 0) {
        console.log(`Récupération optimisée de ${data.videoIds.length} vidéos`);
        const videos = await fetchVideosInBatch(data.videoIds);
        data.videos = videos;
      }
      
      // Récupérer le design si nécessaire
      if (!data.design && data.designId) {
        try {
          // Utiliser getCourseById pour récupérer le design depuis la collection designs
          const designQuery = query(
            collection(db, 'designs'),
            where(documentId(), '==', data.designId)
          );
          const designSnapshot = await getDocs(designQuery);
          if (!designSnapshot.empty) {
            const designDoc = designSnapshot.docs[0];
            data.design = {
              id: designDoc.id,
              ...designDoc.data()
            };
          }
        } catch (error) {
          console.warn('Erreur lors de la récupération du design:', error);
        }
      }
      
      // Mettre en cache et mettre à jour l'état
      setCachedParcours(parcoursId, data);
      setParcoursData(data);
      await updateVideoStatuses(data);
      setLoading(false);
      
    } catch (error) {
      console.error('Erreur lors du chargement du parcours:', error);
      setError("Une erreur est survenue lors du chargement du parcours.");
      setLoading(false);
    }
  }, [getCachedParcours, setCachedParcours, fetchVideosInBatch, updateVideoStatuses]);

  // Vérifier le statut du parcours
  const checkParcoursStatus = useCallback(async () => {
    if (!user?.uid || !id) return;

    try {
      const status = await ParcoursStatusService.getParcoursStatus(user.uid, id as string);
      if (status) {
        setParcoursStatus(status.status);
        if (status.status === 'blocked') {
          setIsModalVisible(true);
        }
      } else {
        setParcoursStatus('unblocked');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut du parcours:', error);
      setParcoursStatus('unblocked');
    }
  }, [user?.uid, id]);

  // Effet principal optimisé pour le chargement initial
  useEffect(() => {
    if (!id || !user?.uid || isInitializedRef.current) return;
    
    console.log(`🚀 Navigation vers le parcours: ${id}`);
    setLoading(true);
    setError(null);
    isInitializedRef.current = true;
    
    // Charger les données en parallèle
    Promise.all([
      loadParcoursData(id as string),
      checkParcoursStatus()
    ]).catch(error => {
      console.error('Erreur lors du chargement initial:', error);
      setError("Une erreur est survenue lors du chargement.");
      setLoading(false);
    });
    
    // Nettoyer lors du démontage
    return () => {
      if (unsubscribeParcoursRef.current) {
        unsubscribeParcoursRef.current();
        unsubscribeParcoursRef.current = null;
      }
      if (unsubscribeVideoStatusRef.current) {
        unsubscribeVideoStatusRef.current();
        unsubscribeVideoStatusRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [id, user?.uid, loadParcoursData, checkParcoursStatus]);

  // Configurer le listener des statuts des vidéos quand les données sont prêtes
  useEffect(() => {
    if (parcoursData && user?.uid && !loading) {
      setupVideoStatusListener();
    }
    
    return () => {
      if (unsubscribeVideoStatusRef.current) {
        unsubscribeVideoStatusRef.current();
        unsubscribeVideoStatusRef.current = null;
      }
    };
  }, [parcoursData, user?.uid, loading, setupVideoStatusListener]);

  // Mémoriser les vidéos triées pour éviter les re-calculs
  const sortedVideos = useMemo(() => {
    if (!parcoursData?.videos) return [];
    
    return [...parcoursData.videos].sort((a, b) => {
      const orderA = a.order || a.ordre || 0;
      const orderB = b.order || b.ordre || 0;
      return orderA - orderB;
    });
  }, [parcoursData?.videos]);

  // Fonction pour réessayer en cas d'erreur
  const handleRetry = useCallback(() => {
    // Nettoyer les listeners existants
    if (unsubscribeParcoursRef.current) {
      unsubscribeParcoursRef.current();
      unsubscribeParcoursRef.current = null;
    }
    if (unsubscribeVideoStatusRef.current) {
      unsubscribeVideoStatusRef.current();
      unsubscribeVideoStatusRef.current = null;
    }
    
    // Vider le cache pour ce parcours
    if (id) {
      parcoursCache.delete(id as string);
    }
    
    // Redémarrer le chargement
    isInitializedRef.current = false;
    setLoading(true);
    setError(null);
    
    if (id && user?.uid) {
      Promise.all([
        loadParcoursData(id as string),
        checkParcoursStatus()
      ]).catch(error => {
        console.error('Erreur lors du rechargement:', error);
        setError("Une erreur est survenue lors du rechargement.");
        setLoading(false);
      });
    }
  }, [id, user?.uid, loadParcoursData, checkParcoursStatus]);

  // Naviguer vers la page de la vidéo
  const handleVideoPress = (videoId: string) => {
    if (parcoursStatus === 'blocked') {
      Alert.alert(
        "Parcours bloqué",
        "Vous devez d'abord terminer les parcours précédents pour accéder à celui-ci."
      );
      return;
    }

    console.log(`Navigation vers la vidéo ID=${videoId}`);
    
    // Vérifier si la vidéo est bloquée
    const videoDoc = videoStatus[videoId];
    if (videoDoc?.completionStatus === 'blocked') {
      console.log(`Vidéo ${videoId} bloquée, proposition de déblocage avec des Dodji`);
      
      // Proposer de débloquer avec des Dodji
      if (user?.uid) {
        Alert.alert(
          "Vidéo verrouillée",
          "Souhaitez-vous débloquer cette vidéo avec 100 Dodji ?",
          [
            {
              text: "Annuler",
              style: "cancel"
            },
            { 
              text: "Débloquer", 
              onPress: async () => {
                try {
                  // Utiliser le service pour débloquer la vidéo avec des Dodji
                  if (!user?.uid || !id) {
                    Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
                    return;
                  }
                  
                  const result = await courseService.unlockVideoWithDodji(user.uid, id, videoId);
                  
                  if (result) {
                    // Mise à jour du statut de la vidéo localement
                    const newVideoStatus = { ...videoStatus };
                    newVideoStatus[videoId] = {
                      ...newVideoStatus[videoId],
                      completionStatus: 'unblocked'
                    };
                    setVideoStatus(newVideoStatus);
                    
                    // Message de confirmation
                    Alert.alert("Débloqué", "La vidéo a été débloquée avec succès !");
                  } else {
                    // En cas d'échec (pas assez de Dodji, erreur technique, etc.)
                    Alert.alert(
                      "Échec du déblocage", 
                      "Vous n'avez pas assez de Dodji ou une erreur est survenue. Veuillez réessayer."
                    );
                  }
                } catch (error) {
                  console.error("Erreur lors du déblocage de la vidéo:", error);
                  Alert.alert("Erreur", "Une erreur est survenue lors du déblocage de la vidéo.");
                }
              }
            }
          ]
        );
      } else {
        // Si l'utilisateur n'est pas connecté, lui demander de se connecter
        Alert.alert(
          "Connexion requise",
          "Vous devez être connecté pour débloquer cette vidéo.",
          [
            {
              text: "OK",
              style: "cancel"
            }
          ]
        );
      }
      return;
    }
    
    // Mettre à jour la dernière vidéo visionnée si l'utilisateur est connecté
    if (user?.uid && id) {
      courseService.updateLastViewedContent(user.uid, id, videoId)
        .then(() => {
          console.log(`Dernière vidéo visionnée mise à jour: ${videoId}`);
        })
        .catch((err: Error) => {
          console.error('Erreur lors de la mise à jour de la dernière vidéo visionnée:', err);
        });
    }
    
    router.push(`/video/${videoId}`);
  };

  // Naviguer vers la page du quiz
  const handleQuizPress = async (quizId: string) => {
    if (!user?.uid) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour accéder aux quiz."
      );
      return;
    }

    if (parcoursStatus === 'blocked') {
      Alert.alert(
        "Parcours bloqué",
        "Vous devez d'abord terminer les parcours précédents pour accéder à celui-ci."
      );
      return;
    }

    try {
      // Vérifier le statut du quiz
      const quizStatus = await QuizStatusService.getQuizStatus(user.uid, quizId);
      
      if (!quizStatus || quizStatus.status === 'blocked') {
        Alert.alert(
          "Quiz verrouillé",
          "Vous devez d'abord terminer toutes les vidéos du parcours pour accéder à ce quiz."
        );
        return;
      }

      console.log(`Navigation vers le quiz ID=${quizId}`);
      router.push(`/quiz/${quizId}?parcoursId=${id}` as any);
    } catch (error) {
      console.error('Erreur lors de la vérification du statut du quiz:', error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de l'accès au quiz. Veuillez réessayer."
      );
    }
  };

  // Gérer les retours en arrière
  const handleBackPress = () => {
    console.log('Retour à la page précédente');
    // Si on vient d'un quiz, rediriger vers la page appropriée sans recharger la page
    if (from === 'quiz') {
      router.replace('/(tabs)');
    } else {
      // Navigation normale vers la page précédente si ce n'est pas un quiz
      router.back();
    }
  };

  const handleUnlock = () => {
    setParcoursStatus('unblocked');
    setIsModalVisible(false);
  };

  return (
    <>
      {loading ? (
        <View style={styles.loadingContainer}>
          <LogoLoadingSpinner />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.fullContainer}>
          {/* Header fixe positionné au-dessus du contenu avec l'effet transparent */}
          <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
            <View style={styles.headerContainer}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleBackPress}
              >
                <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.titleContainer}>
                <Text style={styles.headerTitle} numberOfLines={2}>
                  {parcoursData?.titre || parcoursData?.title || 'Parcours'}
                </Text>
              </View>
              <View style={styles.headerSpacer} />
            </View>
          </SafeAreaView>

          {/* Rectangle11 component */}
          <View style={styles.rectangle11Container}>
            <Rectangle11 width={screenWidth} height={screenHeight * 0.47} />
          </View>

          {/* Contenu principal avec l'image de fond qui défile */}
          <CourseBackground
            imageUrl={parcoursData?.design?.backgroundImageUrl || parcoursData?.design?.imageUrl || ''}
            positions={parcoursData?.design?.positions || {}}
            loading={loading}
            lastViewedVideoId={lastViewedVideoId}
            onImageDimensionsChange={handleImageDimensionsChange}
          >
            {!loading && parcoursData && (
              <View style={styles.contentContainer}>
                {parcoursData.videos && parcoursData.videos.length > 0 ? (
                  // Trier les vidéos par ordre (ordre, index) pour assurer un affichage cohérent
                  [...parcoursData.videos]
                    .sort((a, b) => {
                      // Utiliser l'ordre ou l'ordre spécifié dans le design
                      const orderA = a.order || a.ordre || 0;
                      const orderB = b.order || b.ordre || 0;
                      return orderA - orderB;
                    })
                    .map((video, index) => {
                    // Vérifier si la vidéo a un ID valide
                    if (!video.id) {
                      console.warn(`Vidéo sans ID trouvée à l'index ${index}`);
                      return null;
                    }
                    
                    // Récupérer l'ordre (priority) de la vidéo
                    const videoOrder = video.order || video.ordre || index + 1;
                    
                    // Trouver la position correspondant à l'ordre (et non plus à l'ID de la vidéo)
                    let position;
                    
                    // Chercher parmi les positions celle qui a le même ordre que la vidéo
                    if (parcoursData?.design?.positions) {
                      // Convertir les clés de l'objet positions en tableau pour pouvoir les filtrer
                      const matchingPositionEntry = Object.entries(parcoursData.design.positions)
                        .find(([_, pos]) => Number(pos.order) === Number(videoOrder));
                        
                      if (matchingPositionEntry) {
                        // Si une position avec le bon ordre a été trouvée
                        const positionData = matchingPositionEntry[1];
                        position = {
                          x: Number(positionData.x) || 50,
                          y: Number(positionData.y) || 50,
                          isAnnex: !!positionData.isAnnex
                        };
                        
                        console.log(`Vidéo ${video.id} (ordre=${videoOrder}) associée à la position ${matchingPositionEntry[0]} (ordre=${positionData.order}): x=${position.x}%, y=${position.y}%`);
                      } else {
                        // Aucune position trouvée avec cet ordre, utiliser une position par défaut
                        position = {
                          x: 50,
                          y: 10 + videoOrder * 15, // 10% en haut + 15% d'espacement par ordre
                          isAnnex: false
                        };
                        
                        console.log(`Aucune position trouvée pour la vidéo ${video.id} avec ordre=${videoOrder}, utilisation d'une position par défaut: x=${position.x}%, y=${position.y}%`);
                      }
                    } else {
                      // Pas de positions définies dans le design
                      position = {
                        x: 50,
                        y: 10 + videoOrder * 15,
                        isAnnex: false
                      };
                      
                      console.log(`Aucune position définie dans le design pour la vidéo ${video.id} (ordre=${videoOrder}), utilisation d'une position par défaut: x=${position.x}%, y=${position.y}%`);
                    }
                    
                    // Déterminer le statut de la vidéo
                    const videoDoc = videoStatus[video.id];
                    const completionStatus = videoDoc?.completionStatus || 'blocked';
                    
                    console.log(`Vidéo ${video.id}: position=${position.x}%,${position.y}%, completionStatus=${completionStatus}, ordre=${video.order || video.ordre || index + 1}`);
                    
                    return (
                      <VideoButton
                        key={video.id}
                        id={video.id}
                        title={video.title || video.titre || `Vidéo ${index + 1}`}
                        duration={video.duration || video.duree || 0}
                        completionStatus={completionStatus}
                        order={video.order || video.ordre || index + 1}
                        positionX={position.x}
                        positionY={position.y}
                        imageWidth={imageDimensions.width || screenWidth}
                        imageHeight={imageDimensions.height || screenHeight}
                        onPress={handleVideoPress}
                      />
                    );
                  })
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      Aucune vidéo disponible dans ce parcours.
                    </Text>
                  </View>
                )}
                
                {/* Affichage du quiz si présent */}
                {parcoursData?.quizId && parcoursData?.design?.positions && (
                  (() => {
                    // Rechercher la position du quiz
                    const quizPositionEntry = Object.entries(parcoursData.design.positions)
                      .find(([_, pos]) => pos.isQuiz === true);
                    
                    if (quizPositionEntry) {
                      const quizPosition = quizPositionEntry[1];
                      console.log(`Position du quiz trouvée: x=${quizPosition.x}%, y=${quizPosition.y}%`);
                      
                      return (
                        <QuizButton
                          key={parcoursData.quizId}
                          id={parcoursData.quizId}
                          title="Quiz Final"
                          positionX={Number(quizPosition.x) || 50}
                          positionY={Number(quizPosition.y) || 50}
                          imageWidth={imageDimensions.width || screenWidth}
                          imageHeight={imageDimensions.height || screenHeight}
                          onPress={handleQuizPress}
                        />
                      );
                    } else {
                      // Si aucune position spécifique n'est trouvée pour le quiz mais quizId est présent,
                      // afficher le quiz au centre en bas de l'écran
                      console.log(`Aucune position avec isQuiz=true trouvée. Affichage du quiz au centre en bas.`);
                      return (
                        <QuizButton
                          key={parcoursData.quizId}
                          id={parcoursData.quizId}
                          title="Quiz Final"
                          positionX={50} // Centre horizontalement
                          positionY={85} // En bas (mais pas tout en bas)
                          imageWidth={imageDimensions.width || screenWidth}
                          imageHeight={imageDimensions.height || screenHeight}
                          onPress={handleQuizPress}
                        />
                      );
                    }
                  })()
                )}
              </View>
            )}
          </CourseBackground>

          {user && (
            <ParcoursLockedModal
              visible={isModalVisible}
              onClose={() => {
                setIsModalVisible(false);
                globalRouter.back();
              }}
              parcoursId={id}
              userId={user.uid}
              onUnlock={handleUnlock}
              parcoursTitle={parcoursData?.titre || parcoursData?.title}
            />
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  fullContainer: {
    flex: 1,
    backgroundColor: '#0A0400',
    position: 'relative',
  },
  headerSafeArea: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 100,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 35,
    fontFamily: 'Arboria-Bold',
    letterSpacing: -1.75, // -5% de 35px
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  headerSpacer: {
    width: 40, // Largeur équivalente au bouton de retour pour équilibrer visuellement
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#06D001',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rectangle11Container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50, // Entre l'image de fond (z-index: 0) et le header (z-index: 100)
    pointerEvents: 'none', // Pour ne pas bloquer le scrolling
  },
}); 