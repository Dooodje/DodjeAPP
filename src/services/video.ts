import { collection, doc, getDoc, getDocs, query, where, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Video, VideoProgress, RelatedVideo } from '../types/video';

const VIDEOS_COLLECTION = 'videos';
const PROGRESS_COLLECTION = 'video_progress';

export const videoService = {
  // Récupérer une vidéo par son ID
  async getVideoById(videoId: string): Promise<Video | null> {
    try {
      const videoDoc = await getDoc(doc(db, VIDEOS_COLLECTION, videoId));
      if (!videoDoc.exists()) {
        return null;
      }
      return videoDoc.data() as Video;
    } catch (error) {
      console.error('Erreur lors de la récupération de la vidéo:', error);
      throw error;
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
          thumbnail: videoData.videoUrl, // Utiliser videoUrl comme fallback pour thumbnail
          duration: videoData.duration,
          progress: videoData.progress
        } as RelatedVideo;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des vidéos liées:', error);
      return []; // Retourner un tableau vide en cas d'erreur
    }
  },

  // Mettre à jour la progression d'une vidéo
  async updateVideoProgress(userId: string, progress: VideoProgress): Promise<void> {
    try {
      const progressRef = doc(db, PROGRESS_COLLECTION, `${userId}_${progress.videoId}`);
      await setDoc(progressRef, {
        ...progress,
        lastWatchedDate: Timestamp.fromDate(progress.lastWatchedDate)
      }, { merge: true });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
      throw error;
    }
  },

  // Récupérer la progression d'une vidéo pour un utilisateur
  async getVideoProgress(userId: string, videoId: string): Promise<VideoProgress | null> {
    try {
      const progressDoc = await getDoc(doc(db, PROGRESS_COLLECTION, `${userId}_${videoId}`));
      if (!progressDoc.exists()) {
        return null;
      }
      const data = progressDoc.data();
      return {
        ...data,
        lastWatchedDate: data.lastWatchedDate?.toDate() || new Date()
      } as VideoProgress;
    } catch (error) {
      console.error('Erreur lors de la récupération de la progression:', error);
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
      await this.updateVideoProgress(userId, {
        videoId,
        progress: 100,
        lastWatchedPosition: 0,
        lastWatchedDate: new Date()
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
  }
}; 