import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, onSnapshot, documentId } from 'firebase/firestore';
import { db } from './firebase';
import { Course, CourseContent, CourseProgress } from '../types/course';

// Cache pour les données de parcours
const parcoursCache = new Map<string, { data: ParcoursData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Interface pour les données de parcours
interface ParcoursData {
  id: string;
  title?: string;
  titre?: string;
  description?: string;
  videoIds?: string[];
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
  designId?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  error?: string;
  [key: string]: any;
}

class CourseService {
  async getCourse(courseId: string): Promise<Course> {
    try {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (!courseDoc.exists()) {
        throw new Error('Parcours non trouvé');
      }

      return courseDoc.data() as Course;
    } catch (error) {
      console.error('Erreur lors de la récupération du parcours:', error);
      throw error;
    }
  }

  // Méthode optimisée pour récupérer les vidéos en batch
  private async fetchVideosInBatch(videoIds: string[]): Promise<Array<any>> {
    if (!videoIds.length) return [];
    
    try {
      console.log(`🚀 CourseService: Récupération optimisée de ${videoIds.length} vidéos en batch`);
      
      // Diviser en chunks de 10 (limite Firestore pour les requêtes 'in')
      const chunks = [];
      for (let i = 0; i < videoIds.length; i += 10) {
        chunks.push(videoIds.slice(i, i + 10));
      }
      
      const allVideos: Array<any> = [];
      
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
        }));
      });
      
      const chunkResults = await Promise.all(chunkPromises);
      chunkResults.forEach(videos => allVideos.push(...videos));
      
      // Trier par ordre
      allVideos.sort((a, b) => {
        const orderA = a.order || a.ordre || 0;
        const orderB = b.order || b.ordre || 0;
        return orderA - orderB;
      });
      
      console.log(`✅ CourseService: ${allVideos.length} vidéos récupérées et triées en batch`);
      return allVideos;
    } catch (error) {
      console.error('❌ CourseService: Erreur lors de la récupération des vidéos en batch:', error);
      return [];
    }
  }

  async getCourseById(courseId: string): Promise<ParcoursData | null> {
    try {
      // Vérifier le cache d'abord
      const cached = parcoursCache.get(courseId);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log('📦 CourseService: Utilisation du cache pour le parcours', courseId);
        return cached.data;
      }

      console.log(`🔍 CourseService: Récupération du parcours ID=${courseId} depuis Firestore`);
      const courseDoc = await getDoc(doc(db, 'parcours', courseId));
      
      if (!courseDoc.exists()) {
        console.warn(`⚠️ CourseService: Parcours ID=${courseId} non trouvé`);
        return null;
      }

      // Récupérer les données brutes
      const rawData = courseDoc.data();
      
      // Créer l'objet ParcoursData
      const courseData: ParcoursData = {
        id: courseDoc.id,
        ...rawData as any
      };

      // Optimiser la récupération des vidéos si nécessaire
      if (courseData.videoIds && Array.isArray(courseData.videoIds) && courseData.videoIds.length > 0) {
        console.log(`🎥 CourseService: Récupération optimisée de ${courseData.videoIds.length} vidéos`);
        const videos = await this.fetchVideosInBatch(courseData.videoIds);
        courseData.videos = videos;
      }

      // Récupérer le design si nécessaire (de manière optimisée)
      if (!courseData.design && courseData.designId) {
        try {
          console.log(`🎨 CourseService: Récupération du design ${courseData.designId}`);
          const designDoc = await getDoc(doc(db, 'parcours_designs', courseData.designId));
          if (designDoc.exists()) {
            courseData.design = {
              id: designDoc.id,
              ...designDoc.data()
            };
          }
        } catch (error) {
          console.warn('⚠️ CourseService: Erreur lors de la récupération du design:', error);
        }
      }

      // Mettre en cache
      parcoursCache.set(courseId, {
        data: courseData,
        timestamp: Date.now()
      });
      
      console.log(`✅ CourseService: Parcours ID=${courseId} récupéré et mis en cache`);
      return courseData;
    } catch (error) {
      console.error(`❌ CourseService: Erreur lors de la récupération du parcours ID=${courseId}:`, error);
      throw error;
    }
  }

  // Méthode pour vider le cache (utile pour les tests ou le rafraîchissement forcé)
  clearCache(courseId?: string) {
    if (courseId) {
      parcoursCache.delete(courseId);
      console.log(`🗑️ CourseService: Cache vidé pour le parcours ${courseId}`);
    } else {
      parcoursCache.clear();
      console.log('🗑️ CourseService: Cache entièrement vidé');
    }
  }

  async getCourseProgress(userId: string, courseId: string): Promise<CourseProgress | null> {
    try {
      const progressDoc = await getDoc(doc(db, 'courseProgress', `${userId}_${courseId}`));
      if (!progressDoc.exists()) {
        return null;
      }

      return progressDoc.data() as CourseProgress;
    } catch (error) {
      console.error('Erreur lors de la récupération de la progression:', error);
      return null;
    }
  }

  async updateCourseProgress(
    userId: string,
    courseId: string,
    contentId: string,
    isCompleted: boolean
  ): Promise<void> {
    try {
      const progressRef = doc(db, 'courseProgress', `${userId}_${courseId}`);
      const progressDoc = await getDoc(progressRef);

      if (!progressDoc.exists()) {
        // Créer un nouveau document de progression
        const course = await this.getCourse(courseId);
        const newProgress: CourseProgress = {
          courseId,
          userId,
          completedContents: isCompleted ? [contentId] : [],
          currentContentIndex: 0,
          lastAccessedAt: new Date(),
          totalProgress: isCompleted ? (1 / course.contents.length) * 100 : 0,
        };
        await setDoc(progressRef, newProgress);
      } else {
        const progress = progressDoc.data() as CourseProgress;
        const completedContents = isCompleted
          ? [...new Set([...progress.completedContents, contentId])]
          : progress.completedContents.filter(id => id !== contentId);

        const course = await this.getCourse(courseId);
        const totalProgress = (completedContents.length / course.contents.length) * 100;

        await updateDoc(progressRef, {
          completedContents,
          totalProgress,
          lastAccessedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
      throw error;
    }
  }

  async getNextCourse(courseId: string): Promise<Course | null> {
    try {
      const course = await this.getCourse(courseId);
      if (!course.nextCourses || course.nextCourses.length === 0) {
        return null;
      }

      // Récupérer le premier parcours suivant
      return this.getCourse(course.nextCourses[0]);
    } catch (error) {
      console.error('Erreur lors de la récupération du parcours suivant:', error);
      return null;
    }
  }

  async getPreviousCourse(courseId: string): Promise<Course | null> {
    try {
      const course = await this.getCourse(courseId);
      if (!course.prerequisites || course.prerequisites.length === 0) {
        return null;
      }

      // Récupérer le dernier parcours requis
      return this.getCourse(course.prerequisites[course.prerequisites.length - 1]);
    } catch (error) {
      console.error('Erreur lors de la récupération du parcours précédent:', error);
      return null;
    }
  }

  // Fonction pour obtenir les statuts des vidéos basés sur les vidéos complétées et débloquées
  getVideoStatuses(
    videos: Array<any>,
    completedVideos: string[] = [],
    unlockedVideos: string[] = []
  ): Record<string, 'blocked' | 'unlocked' | 'completed'> {
    const statuses: Record<string, 'blocked' | 'unlocked' | 'completed'> = {};

    // Trier les vidéos par ordre
    const sortedVideos = [...videos].sort((a, b) => {
      const orderA = a.order || a.ordre || 0;
      const orderB = b.order || b.ordre || 0;
      return orderA - orderB;
    });

    // Par défaut, la première vidéo est débloquée
    if (sortedVideos.length > 0) {
      const firstVideoId = sortedVideos[0].id;
      statuses[firstVideoId] = 'unlocked';
    }

    // Marquer les vidéos complétées
    completedVideos.forEach(videoId => {
      statuses[videoId] = 'completed';
    });

    // Marquer les vidéos explicitement débloquées
    unlockedVideos.forEach(videoId => {
      if (!statuses[videoId] || statuses[videoId] !== 'completed') {
        statuses[videoId] = 'unlocked';
      }
    });

    // Débloquer les vidéos qui suivent une vidéo complétée
    for (let i = 0; i < sortedVideos.length - 1; i++) {
      const currentVideoId = sortedVideos[i].id;
      const nextVideoId = sortedVideos[i + 1].id;

      if (statuses[currentVideoId] === 'completed' && !statuses[nextVideoId]) {
        statuses[nextVideoId] = 'unlocked';
      }
    }

    // Marquer les vidéos restantes comme bloquées
    sortedVideos.forEach(video => {
      if (!statuses[video.id]) {
        statuses[video.id] = 'blocked';
      }
    });

    return statuses;
  }

  // Débloquer une vidéo avec des Dodji
  async unlockVideoWithDodji(userId: string, courseId: string, videoId: string): Promise<boolean> {
    try {
      // TODO: Implémenter la logique pour débloquer une vidéo avec des Dodji
      // 1. Vérifier que l'utilisateur a assez de Dodji
      // 2. Déduire les Dodji
      // 3. Ajouter la vidéo à la liste des vidéos débloquées
      
      // Pour l'instant, simuler un succès
      const progressRef = doc(db, 'courseProgress', `${userId}_${courseId}`);
      const progressDoc = await getDoc(progressRef);
      
      if (!progressDoc.exists()) {
        // Créer un nouveau document de progression avec cette vidéo débloquée
        await setDoc(progressRef, {
          courseId,
          userId,
          completedContents: [],
          unlockedVideos: [videoId],
          lastAccessedAt: new Date(),
          lastViewedContentId: videoId
        });
      } else {
        // Mettre à jour le document existant
        const progressData = progressDoc.data();
        const unlockedVideos = [...(progressData.unlockedVideos || []), videoId];
        
        await updateDoc(progressRef, {
          unlockedVideos: [...new Set(unlockedVideos)],
          lastAccessedAt: new Date(),
          lastViewedContentId: videoId
        });
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors du déblocage de la vidéo avec des Dodji:', error);
      return false;
    }
  }

  // Mettre à jour la dernière vidéo visionnée
  async updateLastViewedContent(userId: string, courseId: string, contentId: string): Promise<void> {
    try {
      const progressRef = doc(db, 'courseProgress', `${userId}_${courseId}`);
      const progressDoc = await getDoc(progressRef);
      
      if (!progressDoc.exists()) {
        // Créer un nouveau document de progression
        const newProgress = {
          courseId,
          userId,
          completedContents: [],
          lastViewedContentId: contentId,
          lastAccessedAt: new Date(),
          currentContentIndex: 0,
          totalProgress: 0
        };
        
        await setDoc(progressRef, newProgress).catch(() => {
          // Ignorer silencieusement l'erreur de permission
          console.debug('Impossible de créer le document de progression - permissions insuffisantes');
        });
      } else {
        // Mettre à jour le document existant
        await updateDoc(progressRef, {
          lastViewedContentId: contentId,
          lastAccessedAt: new Date()
        }).catch(() => {
          // Ignorer silencieusement l'erreur de permission
          console.debug('Impossible de mettre à jour le document de progression - permissions insuffisantes');
        });
      }
    } catch (error) {
      // Ignorer silencieusement l'erreur
      console.debug('Erreur ignorée lors de la mise à jour de la progression:', error);
    }
  }
}

export const courseService = new CourseService(); 