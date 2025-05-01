import React, { useEffect, useState, useCallback, useRef } from 'react';
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  [videoId: string]: 'blocked' | 'unlocked' | 'completed';
}

export default function CoursePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parcoursData, setParcoursData] = useState<ParcoursData | null>(null);
  const [lastViewedVideoId, setLastViewedVideoId] = useState<string | undefined>(undefined);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>({});
  const [imageDimensions, setImageDimensions] = useState({ width: screenWidth, height: screenHeight });
  const [parcoursStatus, setParcoursStatus] = useState<'blocked' | 'unblocked' | 'in_progress' | 'completed' | null>(null);
  
  // Référence pour stocker la fonction de désabonnement
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Callback pour recevoir les dimensions de l'image d'arrière-plan
  const handleImageDimensionsChange = useCallback((width: number, height: number) => {
    console.log(`Dimensions de l'image d'arrière-plan mises à jour: ${width}x${height}`);
    if (width > 0 && height > 0) {
      setImageDimensions({ width, height });
    }
  }, []);

  // Fonction pour calculer et mettre à jour les statuts des vidéos
  const updateVideoStatuses = useCallback(async (data: ParcoursData) => {
    if (!data.videos || data.videos.length === 0) return;
    
    if (user?.uid) {
      try {
        const progress = await courseService.getCourseProgress(user.uid, id as string);
        
        // Déterminer le statut des vidéos en utilisant la fonction utilitaire
        const statuses = courseService.getVideoStatuses(
          data.videos || [], 
          progress?.completedContents || [],
          progress?.unlockedVideos || []
        );
        setVideoStatus(statuses);
        
        // Enregistrer la dernière vidéo visionnée
        if (progress && progress.lastViewedContentId) {
          console.log(`Dernière vidéo visionnée: ${progress.lastViewedContentId}`);
          setLastViewedVideoId(progress.lastViewedContentId);
        } else {
          console.log('Aucune vidéo visionnée précédemment');
          setLastViewedVideoId(undefined);
        }
      } catch (progressError) {
        console.error('Erreur lors de la récupération de la progression:', progressError);
        
        // Par défaut, utiliser la fonction utilitaire sans vidéos complétées ou débloquées
        const defaultStatus = courseService.getVideoStatuses(
          data.videos || [],
          [],
          []
        );
        setVideoStatus(defaultStatus);
        
        setLastViewedVideoId(undefined);
      }
    } else {
      // Utilisateur non connecté : utiliser la fonction utilitaire sans vidéos complétées ou débloquées
      const defaultStatus = courseService.getVideoStatuses(
        data.videos || [],
        [],
        []
      );
      setVideoStatus(defaultStatus);
    }
  }, [user?.uid, id]);

  // Vérifier le statut du parcours
  useEffect(() => {
    const checkParcoursStatus = async () => {
      if (!user?.uid || !id) return;

      try {
        const status = await ParcoursStatusService.getParcoursStatus(user.uid, id);
        if (status) {
          setParcoursStatus(status.status);
          if (status.status === 'blocked') {
            Alert.alert(
              "Parcours bloqué",
              "Vous devez d'abord terminer les parcours précédents pour accéder à celui-ci.",
              [{ text: "OK", onPress: () => globalRouter.back() }]
            );
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut du parcours:', error);
      }
    };

    checkParcoursStatus();
  }, [user?.uid, id]);

  // Charger les données du parcours
  useEffect(() => {
    const loadParcoursData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await courseService.getCourseById(id);
        if (data) {
          setParcoursData(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du parcours:', error);
        Alert.alert(
          "Erreur",
          "Impossible de charger le parcours. Veuillez réessayer plus tard.",
          [{ text: "OK", onPress: () => globalRouter.back() }]
        );
      } finally {
        setLoading(false);
      }
    };

    loadParcoursData();
  }, [id]);

  // Configurer l'observation en temps réel
  useEffect(() => {
    // Vérifier que nous avons un ID
    if (!id) {
      setError("ID du parcours manquant");
      setLoading(false);
      return;
    }
    
    console.log(`Configuration de l'observation en temps réel pour le parcours ID=${id}`);
    setLoading(true);
    setError(null);
    
    // Démarrer l'observation du parcours
    const unsubscribe = courseService.observeParcoursDetail(id as string, async (data) => {
      console.log('Données mises à jour reçues via observeParcoursDetail');
      
      // Vérifier s'il y a une erreur
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      
      // Mettre à jour les données du parcours
      setParcoursData(data);
      
      // Mettre à jour les statuts des vidéos
      await updateVideoStatuses(data);
      
      // Finir le chargement
      setLoading(false);
    });
    
    // Stocker la fonction de désabonnement
    unsubscribeRef.current = unsubscribe;
    
    // Nettoyer lors du démontage du composant
    return () => {
      console.log('Nettoyage de l\'observation du parcours');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [id, updateVideoStatuses]);

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
    if (videoStatus[videoId] === 'blocked') {
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
                    newVideoStatus[videoId] = 'unlocked';
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
    console.log('Retour à la page d\'accueil (sous-page de parcours)');
    // Utiliser globalRouter pour retourner à l'index avec l'onglet home
    globalRouter.navigate('/');
  };

  return (
    <>
      {error ? (
        <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                // Réinitialiser l'observation
                if (unsubscribeRef.current) {
                  unsubscribeRef.current();
                  unsubscribeRef.current = null;
                }
                
                // Redémarrer l'observation
                setLoading(true);
                const unsubscribe = courseService.observeParcoursDetail(id as string, async (data) => {
                  if (data.error) {
                    setError(data.error);
                  } else {
                    setParcoursData(data);
                    await updateVideoStatuses(data);
                    setError(null);
                  }
                  setLoading(false);
                });
                
                unsubscribeRef.current = unsubscribe;
              }}
            >
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
              <Text style={styles.headerTitle} numberOfLines={2}>
                {parcoursData?.titre || parcoursData?.title || 'Parcours'}
              </Text>
              <View style={styles.headerSpacer} />
            </View>
          </SafeAreaView>

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
                    const status = videoStatus[video.id] || 'blocked';
                    
                    console.log(`Vidéo ${video.id}: position=${position.x}%,${position.y}%, statut=${status}, ordre=${video.order || video.ordre || index + 1}`);
                    
                    return (
                      <VideoButton
                        key={video.id}
                        id={video.id}
                        title={video.title || video.titre || `Vidéo ${index + 1}`}
                        duration={video.duration || video.duree || 0}
                        status={status}
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
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
  retryText: {
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
  }
}); 