import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { Course, CourseContent, CourseProgress } from '../types/course';

// Interface pour les données de parcours
interface ParcoursData {
  id: string;
  title?: string;
  titre?: string;
  description?: string;
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
    positions?: Record<string, { x: number; y: number; order?: number; isAnnex: boolean }>;
  };
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

  async getCourseById(courseId: string): Promise<ParcoursData | null> {
    try {
      console.log(`🔍 Récupération du parcours ID=${courseId} dans la collection "parcours"`);
      const courseDoc = await getDoc(doc(db, 'parcours', courseId));
      
      if (!courseDoc.exists()) {
        console.warn(`⚠️ Parcours ID=${courseId} non trouvé dans la collection "parcours"`);
        return null;
      }

      // Récupération des données brutes pour inspection
      const rawData = courseDoc.data();
      console.log(`📄 Données brutes du document:`, rawData);
      console.log(`🖼️ Champ thumbnail:`, rawData.thumbnail);
      
      const courseData: ParcoursData = {
        id: courseDoc.id,
        ...courseDoc.data() as any
      };
      
      console.log(`✅ Parcours ID=${courseId} récupéré avec succès`);
      console.log(`🖼️ Valeur du champ thumbnail:`, courseData.thumbnail);
      
      return courseData;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération du parcours ID=${courseId}:`, error);
      throw error;
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

  // Observer les détails d'un parcours en temps réel
  observeParcoursDetail(parcoursId: string, callback: (data: ParcoursData) => void) {
    console.log(`Démarrage de l'observation du parcours ID=${parcoursId}`);
    
    try {
      // Référence au document du parcours
      const parcoursRef = doc(db, 'parcours', parcoursId);
      
      console.log(`Observation configurée pour la collection 'parcours' avec l'ID: ${parcoursId}`);
      
      // Observer le document
      const unsubscribe = onSnapshot(
        parcoursRef,
        async (docSnapshot) => {
          if (docSnapshot.exists()) {
            // Récupérer les données brutes
            const rawData = docSnapshot.data();
            console.log('Données brutes du parcours:', rawData);
            
            // Transformer les données dans le format attendu
            const parcoursData: ParcoursData = {
              id: docSnapshot.id,
              ...rawData as any
            };
            
            console.log('Données du parcours: titre =', parcoursData.titre || parcoursData.title);
            
            // Traiter le cas où les IDs des vidéos sont dans videoIds plutôt que dans videos
            if ((!parcoursData.videos || !Array.isArray(parcoursData.videos) || parcoursData.videos.length === 0) && 
                parcoursData.videoIds && Array.isArray(parcoursData.videoIds)) {
              console.log(`Parcours utilise videoIds au lieu de videos. videoIds:`, parcoursData.videoIds);
              
              try {
                // Préparer un tableau pour stocker les vidéos récupérées
                const videosArray = [];
                
                // Récupérer les détails de chaque vidéo
                for (const videoId of parcoursData.videoIds) {
                  try {
                    const videoDoc = await getDoc(doc(db, 'videos', videoId));
                    if (videoDoc.exists()) {
                      const videoData = videoDoc.data();
                      videosArray.push({
                        id: videoDoc.id,
                        title: videoData.title || videoData.titre || 'Vidéo sans titre',
                        titre: videoData.titre || videoData.title || 'Vidéo sans titre',
                        duration: videoData.duration || videoData.duree || 0,
                        duree: videoData.duree || videoData.duration || 0,
                        order: videoData.order || videoData.ordre || 0,
                        ordre: videoData.ordre || videoData.order || 0,
                        ...videoData
                      });
                    } else {
                      console.warn(`La vidéo avec ID=${videoId} n'existe pas`);
                    }
                  } catch (error) {
                    console.error(`Erreur lors de la récupération de la vidéo ID=${videoId}:`, error);
                  }
                }
                
                // Trier les vidéos par ordre
                videosArray.sort((a, b) => {
                  const orderA = a.order || a.ordre || 0;
                  const orderB = b.order || b.ordre || 0;
                  return orderA - orderB;
                });
                
                console.log(`${videosArray.length} vidéos récupérées et triées:`, 
                  videosArray.map(v => `${v.id}: ${v.titre || v.title} (ordre: ${v.ordre || v.order})`));
                
                // Mettre à jour le parcours avec le tableau de vidéos
                parcoursData.videos = videosArray;
              } catch (error) {
                console.error('Erreur lors de la récupération des vidéos:', error);
                parcoursData.videos = [];
              }
            } else if (!parcoursData.videos || !Array.isArray(parcoursData.videos)) {
              console.warn('Le parcours ne contient pas de vidéos ou le champ videos n\'est pas un tableau');
              parcoursData.videos = [];
            }
            
            // Vérifier le design
            if (!parcoursData.design || typeof parcoursData.design !== 'object') {
              console.log('Récupération du design associé au parcours');
              
              // Si un designId est spécifié, récupérer le design correspondant
              if (parcoursData.designId) {
                try {
                  const designDoc = await getDoc(doc(db, 'parcours_designs', parcoursData.designId));
                  if (designDoc.exists()) {
                    console.log(`Design trouvé pour designId=${parcoursData.designId}`);
                    parcoursData.design = {
                      id: designDoc.id,
                      ...designDoc.data()
                    };
                  } else {
                    console.warn(`Design avec ID=${parcoursData.designId} non trouvé`);
                    parcoursData.design = {
                      id: parcoursId + '_design',
                      backgroundImageUrl: '',
                      positions: {}
                    };
                  }
                } catch (error) {
                  console.error(`Erreur lors de la récupération du design ID=${parcoursData.designId}:`, error);
                  parcoursData.design = {
                    id: parcoursId + '_design',
                    backgroundImageUrl: '',
                    positions: {}
                  };
                }
              } else {
                console.warn('Aucun designId spécifié pour le parcours');
                parcoursData.design = {
                  id: parcoursId + '_design',
                  backgroundImageUrl: '',
                  positions: {}
                };
              }
            }
            
            console.log('Parcours complètement préparé:', {
              id: parcoursData.id,
              titre: parcoursData.titre || parcoursData.title,
              videos: parcoursData.videos ? `${parcoursData.videos.length} vidéos` : 'Aucune vidéo',
              design: parcoursData.design ? `Design ID: ${parcoursData.design.id}` : 'Pas de design'
            });
            
            callback(parcoursData);
          } else {
            console.error(`Parcours ID=${parcoursId} non trouvé`);
            const emptyParcours: ParcoursData = { 
              error: "Ce parcours n'existe pas ou a été supprimé.",
              id: parcoursId,
              videos: [],
              design: {
                id: parcoursId + '_design',
                backgroundImageUrl: '',
                positions: {}
              }
            };
            callback(emptyParcours);
          }
        },
        (error) => {
          console.error(`Erreur lors de l'observation du parcours ID=${parcoursId}:`, error);
          const errorParcours: ParcoursData = { 
            error: "Une erreur est survenue lors du chargement du parcours.",
            id: parcoursId,
            videos: [],
            design: {
              id: parcoursId + '_design',
              backgroundImageUrl: '',
              positions: {}
            }
          };
          callback(errorParcours);
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error(`Erreur lors de la configuration de l'observation du parcours ID=${parcoursId}:`, error);
      const fallbackParcours: ParcoursData = { 
        error: "Une erreur est survenue lors de la configuration du parcours.",
        id: parcoursId,
        videos: [],
        design: {
          id: parcoursId + '_design',
          backgroundImageUrl: '',
          positions: {}
        }
      };
      callback(fallbackParcours);
      
      // Retourner une fonction vide pour éviter les erreurs
      return () => {
        console.log(`Fonction de désabonnement vide appelée pour ID=${parcoursId}`);
      };
    }
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
      console.log(`Mise à jour de la dernière vidéo visionnée: userId=${userId}, courseId=${courseId}, contentId=${contentId}`);
      
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
        
        await setDoc(progressRef, newProgress);
        console.log(`Nouveau document de progression créé avec lastViewedContentId=${contentId}`);
      } else {
        // Mettre à jour le document existant
        await updateDoc(progressRef, {
          lastViewedContentId: contentId,
          lastAccessedAt: new Date()
        });
        console.log(`Document de progression mis à jour avec lastViewedContentId=${contentId}`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dernière vidéo visionnée:', error);
      throw error;
    }
  }
}

export const courseService = new CourseService(); 