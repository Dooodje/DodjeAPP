import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Video } from '../types/video';
import { Ionicons } from '@expo/vector-icons';
import { getDisplayTime } from '../utils/timeUtils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { QuizStatus } from '../types/quiz';

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
        alert("Ce quiz n'est pas encore accessible. Terminez toutes les vidéos du parcours pour le débloquer.");
        return;
      }
      router.push(`/quiz/${quizId}`);
    };

    return (
      <View style={styles.container}>
        <View style={styles.videoCard}>
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
            disabled={quizStatus === 'blocked'}
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
  const duree = video.duree || 
    (typeof video.duration === 'string' ? video.duration : '00:00');
  const thumbnail = video.thumbnail || "";

  console.log('🔄 Rendu avec données:', { titre, duree, thumbnail, completionStatus });

  return (
    <View style={styles.container}>
      <View style={styles.videoCard}>
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
            completionStatus === 'blocked' && styles.lectureButtonDisabled
          ]}
          onPress={handleNavigation}
          disabled={completionStatus === 'blocked'}
        >
          <Text style={[
            styles.lectureButtonText,
            completionStatus === 'blocked' && styles.lectureButtonTextDisabled
          ]}>
            LECTURE
          </Text>
          <MaterialCommunityIcons 
            name="play" 
            size={20} 
            color={completionStatus === 'blocked' ? '#666666' : '#000000'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  videoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnailContainer: {
    width: 120,
    height: 68,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  videoDuration: {
    fontSize: 14,
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
    backgroundColor: '#333333',
  },
  lectureButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  lectureButtonTextDisabled: {
    color: '#666666',
  },
}); 