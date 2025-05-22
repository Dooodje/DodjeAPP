import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Video } from '../types/video';
import { Ionicons } from '@expo/vector-icons';
import { getDisplayTime } from '../utils/timeUtils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { QuizStatus } from '../types/quiz';
import VideoLockedModal from './ui/VideoLockedModal';
import QuizLockedModal from './ui/QuizLockedModal';

interface NextVideoProps {
  video?: Video | null;
  onNavigate?: (videoId: string) => void;
  courseId?: string;
  isLastVideo?: boolean;
  quizId?: string;
}

export const NextVideo: React.FC<NextVideoProps> = ({
  video,
  onNavigate,
  courseId,
  isLastVideo = false,
  quizId
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [completionStatus, setCompletionStatus] = useState<'blocked' | 'unblocked' | 'completed'>('blocked');
  const [quizStatus, setQuizStatus] = useState<QuizStatus>('blocked');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Si c'est la dernière vidéo et qu'il y a un quiz, on affiche le quiz
  if (isLastVideo && quizId) {
    // Récupérer le statut du quiz
    useEffect(() => {
      const fetchQuizStatus = async () => {
        if (!user?.uid || !quizId) return;

        try {
          setIsLoading(true);
          const quizStatusRef = doc(db, 'users', user.uid, 'quiz', quizId);
          const quizStatusDoc = await getDoc(quizStatusRef);

          if (quizStatusDoc.exists()) {
            const status = quizStatusDoc.data().status as QuizStatus;
            setQuizStatus(status);
            console.log('📊 Statut du quiz:', status);
          } else {
            setQuizStatus('blocked');
            console.log('📊 Aucun statut trouvé pour le quiz, statut par défaut: blocked');
          }
        } catch (error) {
          console.error('❌ Erreur lors de la récupération du statut du quiz:', error);
          setQuizStatus('blocked');
        } finally {
          setIsLoading(false);
        }
      };

      fetchQuizStatus();
    }, [user?.uid, quizId]);

    const handleQuizAccess = () => {
      if (quizStatus === 'blocked') {
        setIsModalVisible(true);
        return;
      }
      router.push(`/quiz/${quizId}?parcoursId=${courseId}` as any);
    };

    return (
      <>
        <View style={styles.container}>
          <View style={styles.videoCard}>
            {/* Titre "Vidéo suivante" */}
            <Text style={styles.sectionTitle}>Vidéo suivante</Text>

            {/* Layout horizontal avec icône à gauche et infos à droite */}
            <View style={styles.contentRow}>
              {/* Icône du quiz */}
              <View style={styles.thumbnailContainer}>
                <View style={styles.placeholderThumbnail}>
                  <MaterialCommunityIcons 
                    name={quizStatus === 'blocked' ? "lock-outline" : "clipboard-text-outline"} 
                    size={30} 
                    color={quizStatus === 'blocked' ? "#666" : "#999"} 
                  />
                </View>
              </View>
              
              {/* Informations du quiz */}
              <View style={styles.infoContainer}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  Quiz du parcours
                </Text>
                <Text style={[
                  styles.videoDuration,
                  quizStatus === 'completed' && { color: '#9BEC00' }
                ]}>
                  {quizStatus === 'completed' ? 'Terminé' : 
                   quizStatus === 'unblocked' ? 'Évaluez vos connaissances' :
                   'Terminez toutes les vidéos pour débloquer'}
                </Text>
              </View>
            </View>
            
            {/* Bouton pour commencer le quiz */}
            <TouchableOpacity 
              style={[
                styles.lectureButton, 
                quizStatus === 'blocked' ? styles.lectureButtonDisabled : { backgroundColor: '#9BEC00' }
              ]}
              onPress={handleQuizAccess}
            >
              <Text style={[
                styles.lectureButtonText, 
                quizStatus === 'blocked' ? styles.lectureButtonTextDisabled : { color: '#000000' }
              ]}>
                {quizStatus === 'completed' ? 'REVOIR LE QUIZ' : 'COMMENCER LE QUIZ'}
              </Text>
              <MaterialCommunityIcons 
                name={quizStatus === 'completed' ? "clipboard-check-outline" : "clipboard-text-outline"} 
                size={20} 
                color={quizStatus === 'blocked' ? '#666666' : '#000000'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <QuizLockedModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          quizTitle="Quiz du parcours"
        />
      </>
    );
  }

  // Récupérer le statut de la vidéo suivante
  useEffect(() => {
    const fetchVideoStatus = async () => {
      if (!user?.uid || !video?.id) return;

      try {
        const videoStatusRef = doc(db, 'users', user.uid, 'video', video.id);
        const videoStatusDoc = await getDoc(videoStatusRef);

        if (videoStatusDoc.exists()) {
          const status = videoStatusDoc.data().completionStatus;
          setCompletionStatus(status);
          console.log('📊 Statut de la vidéo suivante:', status);
        } else {
          setCompletionStatus('blocked');
          console.log('📊 Aucun statut trouvé pour la vidéo suivante, statut par défaut: blocked');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du statut de la vidéo:', error);
        setCompletionStatus('blocked');
      }
    };

    fetchVideoStatus();
  }, [user?.uid, video?.id]);

  const handleNavigation = () => {
    if (!video?.id) {
      console.error("📱 Erreur: ID de vidéo cible manquant ou invalide");
      return;
    }

    // Vérifier si la vidéo est accessible
    if (completionStatus === 'blocked') {
      console.log("🔒 La vidéo est bloquée, accès refusé");
      alert("Cette vidéo n'est pas encore accessible. Terminez la vidéo actuelle pour la débloquer.");
      return;
    }
    
    // Si on a une fonction de navigation personnalisée, l'utiliser directement
    if (onNavigate) {
      console.log("📱 Chargement direct de la vidéo via onNavigate");
      onNavigate(video.id);
      return;
    } else {
      console.error("❌ Pas de fonction onNavigate fournie pour charger la vidéo:", video.id);
      alert("Impossible de charger la vidéo suivante. Veuillez réessayer.");
    }
  };

  // Si pas de vidéo à afficher, ne rien rendre
  if (!video) {
    return null;
  }
  
  // Récupérer les informations de la vidéo
  const titre = video.titre || video.title || "Chargement...";
  const duree = (() => {
    if (video.duree) {
      // Gérer le format "XX:XX"
      const timeMatch = video.duree.match(/(\d+):(\d+)/);
      if (timeMatch) {
        // Si format XX:XX, prendre les minutes et arrondir au supérieur si il y a des secondes
        const mins = parseInt(timeMatch[1]);
        const secs = parseInt(timeMatch[2]);
        return `${secs > 0 ? mins + 1 : mins}min`;
      }
    }
    // Fallback si pas de format valide
    return "1min";
  })();
  const thumbnail = video.thumbnail || "";

  console.log('🔄 Rendu avec données:', { titre, duree, thumbnail, completionStatus });

  return (
    <View style={styles.container}>
      <View style={styles.videoCard}>
        {/* Titre "Vidéo suivante" */}
        <Text style={styles.sectionTitle}>Vidéo suivante</Text>

        {/* Layout horizontal avec miniature à gauche et infos à droite */}
        <View style={styles.contentRow}>
          {/* Miniature de la vidéo */}
          <View style={styles.thumbnailContainer}>
            {thumbnail ? (
              <Image 
                source={{ uri: thumbnail }} 
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderThumbnail}>
                <MaterialCommunityIcons name="video-outline" size={30} color="#999" />
              </View>
            )}
          </View>
          
          {/* Informations de la vidéo */}
          <View style={styles.infoContainer}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {titre}
            </Text>
            <Text style={styles.videoDuration}>
              {duree}
            </Text>
          </View>
        </View>
        
        {/* Bouton Lecture */}
        <TouchableOpacity 
          style={[
            styles.lectureButton,
            completionStatus === 'blocked' ? styles.lectureButtonDisabled : { backgroundColor: '#9BEC00' }
          ]}
          onPress={handleNavigation}
          disabled={completionStatus === 'blocked'}
        >
          <Text style={[
            styles.lectureButtonText,
            { color: '#FFFFFF' }
          ]}>
            {completionStatus === 'blocked' ? 'Verrouillé' : "C'est parti !"}
          </Text>
          {completionStatus === 'blocked' && (
            <MaterialCommunityIcons 
              name="lock"
              size={20} 
              color="#FFFFFF"
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 0,
  },
  videoCard: {
    backgroundColor: 'rgba(124, 99, 84, 0.10)',
    borderRadius: 12,
    padding: 24,
    gap: 16,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 16,
  },
  thumbnailContainer: {
    width: 160,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#2A2A2A',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: 20,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: '400',
  },
  videoDuration: {
    fontSize: 14,
    fontFamily: 'Arboria-Medium',
    color: '#999999',
  },
  lectureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  lectureButtonDisabled: {
    backgroundColor: '#7C6354',
    opacity: 0.5,
  },
  lectureButtonText: {
    fontSize: 15,
    fontFamily: 'Arboria-Bold',
    color: '#000000',
    lineHeight: 15,
    letterSpacing: 0,
    fontWeight: '400',
    textAlign: 'center',
  },
  lectureButtonTextDisabled: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: '400',
  },
}); 