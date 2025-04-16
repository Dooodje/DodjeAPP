import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Video } from '../types/video';
import { Ionicons } from '@expo/vector-icons';
import { getDisplayTime } from '../utils/timeUtils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface NextVideoProps {
  video?: Video | null;
  fallbackTitle?: string;
  fallbackId?: string;
  onNavigate?: (videoId: string) => void;
  courseId?: string;
}

export const NextVideo: React.FC<NextVideoProps> = ({
  video,
  fallbackTitle = "Titre 22",
  fallbackId = "R8vz5WHwRA4yz19L9GWt",
  onNavigate,
  courseId
}) => {
  const router = useRouter();
  const [fallbackVideo, setFallbackVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer les données de la vidéo de secours depuis Firestore
  useEffect(() => {
    const fetchFallbackVideo = async () => {
      // Si on a déjà une vidéo, pas besoin de charger une fallback
      if (video) {
        console.log('🎬 Vidéo suivante déjà disponible, ID:', video.id);
        console.log('🎬 Propriétés de la vidéo suivante:', { 
          titre: video.titre || video.title, 
          duree: video.duree, 
          thumbnail: video.thumbnail ? 'Présent' : 'Manquant' 
        });
        return;
      }
      
      if (fallbackId) {
        setIsLoading(true);
        try {
          console.log('🔍 Récupération de la vidéo fallback avec ID:', fallbackId);
          const videoRef = doc(db, 'videos', fallbackId);
          const videoDoc = await getDoc(videoRef);
          
          if (videoDoc.exists()) {
            const videoData = videoDoc.data();
            console.log('✅ Données récupérées brutes:', videoData);
            
            // Extraire les champs spécifiques que nous voulons
            const videoInfo = {
              id: fallbackId,
              titre: videoData.titre || '',
              title: videoData.title || '',
              description: videoData.description || '',
              duree: videoData.duree || '00:00',
              thumbnail: videoData.thumbnail || '',
              courseId: videoData.parcoursId || videoData.courseId || courseId || ''
            };
            
            setFallbackVideo(videoInfo as Video);
            console.log('🎬 Vidéo fallback chargée:', videoInfo.titre || videoInfo.title);
            console.log('⏱️ Durée exacte:', videoInfo.duree);
            console.log('🖼️ Miniature:', videoInfo.thumbnail ? 'Présent' : 'Manquant');
          } else {
            console.log('⚠️ Vidéo fallback non trouvée dans Firestore');
          }
        } catch (error) {
          console.error('❌ Erreur lors de la récupération de la vidéo fallback:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchFallbackVideo();
  }, [video, fallbackId, courseId]);

  const handleNavigation = () => {
    const targetVideo = video || fallbackVideo;
    const targetId = targetVideo?.id || fallbackId;
    
    console.log("📱 Bouton LECTURE cliqué - Chargement direct de la vidéo suivante:", targetId);
    
    if (!targetId) {
      console.error("📱 Erreur: ID de vidéo cible manquant ou invalide");
      return;
    }
    
    // Si on a une fonction de navigation personnalisée, l'utiliser directement
    if (onNavigate) {
      console.log("📱 Chargement direct de la vidéo via onNavigate");
      onNavigate(targetId);
      return;
    } else {
      console.error("❌ Pas de fonction onNavigate fournie pour charger la vidéo:", targetId);
      alert("Impossible de charger la vidéo suivante. Veuillez réessayer.");
    }
  };

  // Utiliser soit la vidéo suivante, soit la vidéo de fallback (Titre 22)
  const displayVideo = video || fallbackVideo;
  
  // Récupérer les informations de la vidéo
  const titre = displayVideo?.titre || displayVideo?.title || (isLoading ? "Chargement..." : fallbackTitle);
  
  // Priorité au champ duree (spécifique à Firestore), sinon utiliser duration
  const duree = displayVideo?.duree || 
                (typeof displayVideo?.duration === 'string' ? displayVideo?.duration : '00:00');
  
  // Récupérer directement la miniature
  const thumbnail = displayVideo?.thumbnail || "";

  console.log('🔄 Rendu avec données:', { titre, duree, thumbnail });

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
              {isLoading ? "Chargement..." : duree}
            </Text>
          </View>
        </View>
        
        {/* Bouton Lecture */}
        <TouchableOpacity 
          style={styles.lectureButton}
          onPress={handleNavigation}
          activeOpacity={0.7}
          testID="bouton-lecture-video-suivante"
        >
          <Text style={styles.lectureText}>Lecture</Text>
          <MaterialCommunityIcons name="play" size={18} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  videoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
    padding: 16,
  },
  thumbnailContainer: {
    width: 80,
    height: 70,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  videoDuration: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  lectureButton: {
    backgroundColor: '#9BEC00',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  lectureText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  }
}); 