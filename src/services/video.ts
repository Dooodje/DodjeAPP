import { collection, doc, getDoc, getDocs, query, where, updateDoc, setDoc, Timestamp, FieldValue } from 'firebase/firestore';
import { db } from './firebase';
import { Video, VideoProgress, RelatedVideo } from '../types/video';

const VIDEOS_COLLECTION = 'videos';
const USERS_COLLECTION = 'users';

export const videoService = {
  // Récupérer une vidéo par son ID
  async getVideoById(videoId: string): Promise<Video | null> {
    if (!videoId) {
      console.warn('❌ getVideoById - ID vidéo non spécifié');
      return null;
    }

    try {
      const videoRef = doc(db, VIDEOS_COLLECTION, videoId);
      const videoDoc = await getDoc(videoRef);

      if (!videoDoc.exists()) {
        console.warn(`❌ getVideoById - Vidéo ${videoId} non trouvée`);
        return null;
      }

      // Récupérer toutes les données du document
      const videoData = videoDoc.data();
      
      // S'assurer que l'URL vidéo est définie et valide
      const videoUrl = videoData.videoUrl || '';
      
      // Pour debug uniquement - URL vidéo factice si non définie
      const fallbackUrl = 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4';
      const effectiveUrl = videoUrl || fallbackUrl;
      
      console.log(`🎥 URL vidéo pour ${videoId}: ${effectiveUrl}`);
      
      // Créer l'objet Video avec l'id et les données
      // S'assurer que les champs duree et thumbnail sont présents
      const video: Video = {
        id: videoId,
        title: videoData.title || '',
        titre: videoData.titre || videoData.title || '',  // Utiliser titre ou title
        description: videoData.description || '',
        videoUrl: effectiveUrl, // Utiliser l'URL effective (original ou fallback)
        duration: videoData.duration || 0,
        duree: videoData.duree || '00:00',  // Assurer la présence de duree
        thumbnail: videoData.thumbnail || '',  // Assurer la présence de thumbnail
        order: videoData.order || 0,
        courseId: videoData.courseId || videoData.parcoursId || '',
        isUnlocked: true // Forcer toutes les vidéos comme débloquées
      };
      
      console.log(`✅ getVideoById - Vidéo ${videoId} récupérée avec succès`);
      console.log(`✅ getVideoById - Titre: ${video.title || video.titre}`);
      console.log(`✅ getVideoById - URL: ${video.videoUrl}`);
      console.log(`✅ getVideoById - Durée: ${video.duree}`);
      console.log(`✅ getVideoById - Thumbnail: ${video.thumbnail ? 'Présent' : 'Non disponible'}`);
      
      return video;
    } catch (error) {
      console.error(`❌ getVideoById - Erreur lors de la récupération de la vidéo ${videoId}:`, error);
      return null;
    }
  },

  // Récupérer les vidéos liées à un cours
  async getRelatedVideos(courseId: string | undefined, currentVideoId: string): Promise<RelatedVideo[]> {
    try {
      if (!courseId) {
        return []; // Retourner un tableau vide si courseId n'est pas défini
      }
      
      const videosQuery = query(
        collection(db, VIDEOS_COLLECTION),
        where('courseId', '==', courseId),
        where('id', '!=', currentVideoId)
      );
      const querySnapshot = await getDocs(videosQuery);
      
      // Transformer les Video en RelatedVideo
      return querySnapshot.docs.map(doc => {
        const videoData = doc.data() as Video;
        return {
          id: videoData.id,
          title: videoData.title,
          thumbnail: videoData.thumbnail || videoData.videoUrl, // Utiliser thumbnail ou videoUrl comme fallback
          duration: videoData.duration,
          progress: 0 // Valeur par défaut, à mettre à jour si nécessaire
        } as RelatedVideo;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des vidéos liées:', error);
      return []; // Retourner un tableau vide en cas d'erreur
    }
  },

  // Mettre à jour la progression d'une vidéo
  async updateVideoProgress(
    userId: string, 
    videoId: string, 
    progressUpdate: {
      currentTime: number;
      completionStatus: 'blocked' | 'unblocked' | 'completed';
    }
  ): Promise<void> {
    try {
      if (!userId || !videoId) {
        throw new Error('userId et videoId sont requis');
      }

      // Récupérer d'abord les métadonnées de la vidéo depuis la collection videos
      const videoRef = doc(db, VIDEOS_COLLECTION, videoId);
      const videoDoc = await getDoc(videoRef);

      if (!videoDoc.exists()) {
        throw new Error(`La vidéo ${videoId} n'existe pas dans la collection videos`);
      }

      const videoData = videoDoc.data();
      // Convertir la durée du format "MM:SS" en secondes
      const durationParts = (videoData.duree || "00:00").split(":");
      const durationInSeconds = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);

      const userVideoRef = doc(db, `${USERS_COLLECTION}/${userId}/video/${videoId}`);
      
      const progressData: VideoProgress = {
        currentTime: progressUpdate.currentTime,
        duration: durationInSeconds,
        completionStatus: progressUpdate.completionStatus,
        lastUpdated: Timestamp.now(),
        metadata: {
          videoId: videoId,
          courseId: videoData.parcoursId || videoData.courseId || '',
          videoSection: videoData.section || '',
          videoTitle: videoData.titre || videoData.title || '',
          progress: Math.floor((progressUpdate.currentTime / durationInSeconds) * 100)
        }
      };

      await setDoc(userVideoRef, progressData, { merge: true });

      console.log(`✅ Progression mise à jour pour la vidéo ${videoId}`);
      console.log(`📊 Durée: ${durationInSeconds}s, Progression: ${progressUpdate.currentTime}s`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la progression:', error);
      throw error;
    }
  },

  // Récupérer la progression d'une vidéo
  async getVideoProgress(userId: string, videoId: string): Promise<{
    currentTime: number;
    duration: number;
    completionStatus: string;
    lastUpdated: Date;
  } | null> {
    try {
      if (!userId || !videoId) {
        throw new Error('userId et videoId sont requis');
      }

      const videoRef = doc(db, `${USERS_COLLECTION}/${userId}/video/${videoId}`);
      const videoDoc = await getDoc(videoRef);

      if (!videoDoc.exists()) {
        // Retourner un objet par défaut si aucune progression n'existe
        return {
          currentTime: 0,
          duration: 0,
          completionStatus: 'notStarted',
          lastUpdated: new Date()
        };
      }

      const data = videoDoc.data();
      return {
        currentTime: data.currentTime || 0,
        duration: data.duration || 0,
        completionStatus: data.completionStatus || 'notStarted',
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la progression:', error);
      throw error;
    }
  },

  // Débloquer une vidéo
  async unlockVideo(userId: string, videoId: string): Promise<boolean> {
    try {
      // Mettre à jour le statut de la vidéo pour l'utilisateur
      const userVideoRef = doc(db, `users/${userId}/unlocked_videos`, videoId);
      await setDoc(userVideoRef, { 
        unlockedAt: Timestamp.now(),
        videoId
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors du déblocage de la vidéo:', error);
      throw error;
    }
  },

  // Vérifier si une vidéo est débloquée pour un utilisateur
  async isVideoUnlocked(userId: string, videoId: string): Promise<boolean> {
    try {
      const userVideoRef = doc(db, `users/${userId}/unlocked_videos`, videoId);
      const docSnap = await getDoc(userVideoRef);
      return docSnap.exists();
    } catch (error) {
      console.error('Erreur lors de la vérification si la vidéo est débloquée:', error);
      return false;
    }
  },

  // Marquer une vidéo comme complétée
  async markVideoAsCompleted(userId: string, videoId: string): Promise<void> {
    try {
      // Mettre à jour la progression
      await this.updateVideoProgress(userId, videoId, {
        currentTime: 0,
        completionStatus: 'completed'
      });
      
      // Enregistrer que la vidéo a été complétée
      const completedRef = doc(db, `users/${userId}/completed_videos`, videoId);
      await setDoc(completedRef, {
        completedAt: Timestamp.now(),
        videoId
      });
    } catch (error) {
      console.error('Erreur lors du marquage de la vidéo comme complétée:', error);
      throw error;
    }
  },

  // Récupérer la prochaine vidéo dans un parcours
  async getNextVideo(courseId: string | undefined, currentVideoId: string): Promise<Video | null> {
    try {
      console.log('🔍 getNextVideo - Démarrage avec courseId:', courseId, 'et currentVideoId:', currentVideoId);
      
      if (!courseId) {
        console.log('⚠️ getNextVideo - courseId non défini, retour null');
        return this.getDefaultNextVideo(currentVideoId);
      }
      
      // 1. Récupérer le document du parcours pour obtenir la liste ordonnée des vidéos
      console.log('🔍 getNextVideo - Récupération du document de parcours:', courseId);
      const courseDoc = await getDoc(doc(db, 'parcours', courseId));
      
      if (!courseDoc.exists()) {
        console.log('⚠️ getNextVideo - document de parcours non trouvé');
        
        // Utiliser la méthode classique en fallback
        const fallbackVideo = await this.findNextVideoByOrder(courseId, currentVideoId);
        return fallbackVideo || this.getDefaultNextVideo(currentVideoId);
      }
      
      const courseData = courseDoc.data();
      const videoIds = courseData.videoIds || [];
      
      console.log('🔍 getNextVideo - Liste des IDs de vidéos du parcours:', videoIds);
      
      if (!videoIds.length) {
        console.log('⚠️ getNextVideo - aucune vidéo dans ce parcours');
        const fallbackVideo = await this.findNextVideoByOrder(courseId, currentVideoId);
        return fallbackVideo || this.getDefaultNextVideo(currentVideoId);
      }
      
      // Trouver l'index de la vidéo actuelle dans la liste
      const currentIndex = videoIds.indexOf(currentVideoId);
      console.log(`🔍 getNextVideo - Index de la vidéo actuelle: ${currentIndex}`);
      
      if (currentIndex === -1) {
        console.log('⚠️ getNextVideo - vidéo actuelle non trouvée dans la liste des IDs');
        const fallbackVideo = await this.findNextVideoByOrder(courseId, currentVideoId);
        return fallbackVideo || this.getDefaultNextVideo(currentVideoId);
      }
      
      // S'il n'y a pas de vidéo suivante dans la liste
      if (currentIndex >= videoIds.length - 1) {
        console.log('⚠️ getNextVideo - pas de vidéo suivante dans la liste');
        return this.getDefaultNextVideo(currentVideoId);
      }
      
      // Récupérer l'ID de la prochaine vidéo
      const nextVideoId = videoIds[currentIndex + 1];
      console.log(`🔍 getNextVideo - ID de la prochaine vidéo: ${nextVideoId}`);
      
      // Récupérer les détails de la prochaine vidéo
      const nextVideo = await this.getVideoById(nextVideoId);
      
      if (!nextVideo) {
        console.log('⚠️ getNextVideo - détails de la prochaine vidéo non trouvés');
        return this.getDefaultNextVideo(currentVideoId);
      }
      
      console.log(`✅ getNextVideo - Prochaine vidéo trouvée: ${nextVideo.title}`);
      console.log(`✅ getNextVideo - Propriétés: duree=${nextVideo.duree}, thumbnail=${nextVideo.thumbnail?.substring(0, 30)}...`);
      console.log(`✅ getNextVideo - URL: ${nextVideo.videoUrl}`);
      return nextVideo;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la prochaine vidéo:', error);
      
      // En cas d'erreur, essayer la méthode classique
      const fallbackVideo = await this.findNextVideoByOrder(courseId, currentVideoId);
      return fallbackVideo || this.getDefaultNextVideo(currentVideoId);
    }
  },
  
  // Méthode de fallback pour trouver la prochaine vidéo par ordre
  async findNextVideoByOrder(courseId: string | undefined, currentVideoId: string): Promise<Video | null> {
    try {
      console.log('🔄 findNextVideoByOrder - Méthode de fallback');
      
      if (!courseId) {
        console.log('⚠️ findNextVideoByOrder - courseId non défini');
        return null;
      }
      
      // 1. Récupérer la vidéo actuelle pour connaître son ordre
      const currentVideo = await this.getVideoById(currentVideoId);
      
      if (!currentVideo) {
        console.log('⚠️ findNextVideoByOrder - vidéo actuelle non trouvée');
        return null;
      }
      
      const currentOrder = currentVideo.order || 0;
      console.log(`🔍 findNextVideoByOrder - Ordre de la vidéo actuelle: ${currentOrder}`);
      
      // 2. Récupérer toutes les vidéos du parcours
      const videosQuery = query(
        collection(db, VIDEOS_COLLECTION),
        where('courseId', '==', courseId)
      );
      
      const querySnapshot = await getDocs(videosQuery);
      console.log(`🔍 findNextVideoByOrder - ${querySnapshot.size} vidéos trouvées pour ce cours`);
      
      if (querySnapshot.empty) {
        console.log('⚠️ findNextVideoByOrder - aucune vidéo trouvée dans ce parcours');
        return null;
      }
      
      // 3. Transformer en tableau d'objets Video avec l'ID comme propriété
      const videos = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Ajouter l'ID comme propriété si ce n'est pas déjà le cas et s'assurer que duree et thumbnail sont présents
        const videoWithId = { 
          ...data, 
          id: doc.id,
          duree: data.duree || '00:00',
          thumbnail: data.thumbnail || ''
        } as Video;
        
        console.log(`🔍 findNextVideoByOrder - Vidéo trouvée: ID=${doc.id}, Titre=${data.title}, Ordre=${data.order || 'non défini'}`);
        console.log(`🔍 findNextVideoByOrder - Propriétés: duree=${videoWithId.duree}, thumbnail=${videoWithId.thumbnail?.substring(0, 30) || 'non disponible'}...`);
        return videoWithId;
      });
      
      // 4. Trier les vidéos par ordre
      const sortedVideos = videos.sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        return orderA - orderB;
      });
      
      console.log('🔍 findNextVideoByOrder - Vidéos triées:', sortedVideos.map(v => `${v.id}(ordre:${v.order || 0})`).join(', '));
      
      // 5. Chercher la vidéo avec l'ordre immédiatement supérieur à la vidéo actuelle
      const nextVideo = sortedVideos.find(video => (video.order || 0) > currentOrder);
      
      if (nextVideo) {
        console.log(`✅ findNextVideoByOrder - Prochaine vidéo trouvée par ordre: ID=${nextVideo.id}, Titre=${nextVideo.title}, Ordre=${nextVideo.order || 0}`);
        return nextVideo;
      }
      
      // 6. Si aucune vidéo avec un ordre supérieur n'est trouvée, essayer par index
      const currentVideoIndex = sortedVideos.findIndex(v => v.id === currentVideoId);
      console.log(`🔍 findNextVideoByOrder - Index de la vidéo actuelle: ${currentVideoIndex}`);
      
      if (currentVideoIndex !== -1 && currentVideoIndex < sortedVideos.length - 1) {
        const nextVideo = sortedVideos[currentVideoIndex + 1];
        console.log(`✅ findNextVideoByOrder - Prochaine vidéo trouvée par index: ID=${nextVideo.id}, Titre=${nextVideo.title}`);
        return nextVideo;
      }
      
      // Aucune vidéo suivante trouvée
      console.log('🔍 findNextVideoByOrder - Aucune prochaine vidéo trouvée');
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la prochaine vidéo par ordre:', error);
      return null;
    }
  },

  // Créer une vidéo factice pour la continuité de l'expérience
  getDefaultNextVideo(currentVideoId: string): Video {
    const defaultId = `default_next_${currentVideoId}`;
    console.log('📼 Création d\'une vidéo factice de démonstration avec ID:', defaultId);
    
    return {
      id: defaultId,
      title: 'Vidéo de démonstration',
      titre: 'Vidéo de démonstration',
      description: 'Cette vidéo est une démonstration pour tester la fonctionnalité de vidéo suivante.',
      videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
      thumbnail: 'https://i.imgur.com/XJpx1UQ.png', // Miniature générique
      duration: 596, // Environ 10 minutes
      duree: '09:56',
      order: 9999,
      courseId: 'demo_course',
      isUnlocked: true
    };
  }
}; 