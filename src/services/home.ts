import { db, storage } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  onSnapshot,
  orderBy,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { Section, Level, TreeData, Course } from '../types/home';

interface FirestoreCourseData {
  id: string;
  titre?: string;
  description?: string;
  domaine?: string;
  domain?: string; // Alternative pour domaine
  niveau?: string;
  level?: string; // Alternative pour niveau
  positions?: { x: number; y: number }[];
  status?: 'blocked' | 'completed' | 'deblocked';
  progress?: number;
  dodjiCost?: number;
  thumbnail?: string;
  image?: string;
  imagePath?: string;
  imageUrl?: string;
  ordre?: number;
  order?: number; // Alternative pour ordre
  videoIds?: string[];
  quizId?: string;
  isAnnex?: boolean;
}

/**
 * Fonction utilitaire pour obtenir l'URL de téléchargement d'une image depuis Storage
 * si seulement le chemin est fourni
 */
async function getImageUrlFromPath(imagePath: string | undefined): Promise<string> {
  // Si le chemin est vide ou undefined, retourner une chaîne vide immédiatement
  if (!imagePath || imagePath.trim() === '') {
    console.log('Chemin d\'image vide ou non défini');
    return '';
  }
  
  try {
    // Vérifier si c'est déjà une URL complète
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Vérifier que le service storage est correctement initialisé
    if (!storage) {
      console.error('Le service Firebase Storage n\'est pas initialisé');
      return '';
    }
    
    // Sinon, récupérer l'URL depuis Firebase Storage
    const storageRef = ref(storage, imagePath);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'URL de l\'image:', error);
    return '';
  }
}

// Fonction pour normaliser les noms des sections et niveaux
function normalizeString(str: string): string {
  return str.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export const homeService = {
  /**
   * Récupère les données de l'arbre de parcours pour une section et un niveau donnés
   */
  getTreeData: async (section: Section, level: Level, userId: string): Promise<TreeData> => {
    try {
      console.log(`Récupération des données de l'arbre pour section=${section}, level=${level}, userId=${userId}`);
      
      // Récupérer les parcours correspondant à cette section et ce niveau
      const coursesQuery = query(
        collection(db, 'parcours'),
        where('domaine', '==', section),
        where('niveau', '==', level)
      );
      
      const coursesSnapshot = await getDocs(coursesQuery);
      const courses: Course[] = [];
      
      if (!coursesSnapshot.empty) {
        // Récupérer les statuts des parcours pour cet utilisateur
        const courseIds = coursesSnapshot.docs.map(doc => doc.id);
        const courseStatuses = await getUserCoursesStatus(userId, courseIds);
        
        coursesSnapshot.forEach(doc => {
          const courseData = doc.data() as FirestoreCourseData;
          const courseStatus = courseStatuses[doc.id];
          
          // Récupérer l'URL de l'image si nécessaire
          let imageUrl = '';
          if (courseData.imageUrl) {
            imageUrl = courseData.imageUrl;
          } else if (courseData.imagePath) {
            // Si on a un chemin d'image, on devra le convertir en URL
            imageUrl = courseData.imagePath;
          }
          
          const course: Course = {
            id: doc.id,
            title: courseData.titre || 'Titre non défini',
            description: courseData.description || '',
            level: level,
            section: section,
            position: courseData.positions?.[0] || { x: 0.5, y: 0.5 },
            status: courseStatus.status,
            progress: courseStatus.progress,
            dodjiCost: courseData.dodjiCost || 0,
            imageUrl: imageUrl,
            lockIcon: 'lock',
            checkIcon: 'check',
            ringIcon: 'circle-outline',
            ordre: courseData.ordre || courseData.order || 0,
            videoIds: courseData.videoIds || [],
            quizId: courseData.quizId || null,
            isAnnex: courseData.isAnnex || false
          };
          
          courses.push(course);
        });
      }
      
      // Trier les parcours par ordre
      courses.sort((a, b) => a.ordre - b.ordre);
      
      return {
        section,
        level,
        treeImageUrl: '', // À implémenter si nécessaire
        courses
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données de l\'arbre:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques d'un utilisateur
   */
  getUserStats: async (userId: string): Promise<{ streak: any; dodji: any }> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          streak: userData.streak || 0,
          dodji: userData.dodji || 0
        };
      }
      return { streak: 0, dodji: 0 };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques utilisateur:', error);
      return { streak: 0, dodji: 0 };
    }
  },

  /**
   * Met à jour le statut d'un parcours pour un utilisateur
   */
  updateCourseStatus: async (userId: string, courseId: string, status: 'blocked' | 'completed' | 'deblocked'): Promise<void> => {
    try {
      const userCourseRef = doc(db, 'users', userId, 'courses', courseId);
      await setDoc(userCourseRef, { status }, { merge: true });
      
      // Si le parcours est complété, débloquer le suivant
      if (status === 'completed') {
        await unlockNextCourse(userId, courseId);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du parcours:', error);
      // Ne pas propager l'erreur pour éviter les plantages
    }
  },

  /**
   * Met à jour la progression d'un parcours pour un utilisateur
   */
  updateCourseProgress: async (userId: string, courseId: string, progress: number): Promise<void> => {
    try {
      const userCourseRef = doc(db, 'users', userId, 'courses', courseId);
      await setDoc(userCourseRef, { progress }, { merge: true });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression du parcours:', error);
      // Ne pas propager l'erreur pour éviter les plantages
    }
  },
  
  /**
   * Débloque un parcours avec des Dodjis
   */
  unlockCourseWithDodji: async (userId: string, courseId: string, dodjiCost: number): Promise<void> => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userDoc.data();
      const currentDodji = userData.dodji || 0;
      
      if (currentDodji < dodjiCost) {
        throw new Error('Vous n\'avez pas assez de Dodjis');
      }
      
      // Mettre à jour le solde de Dodji
      await updateDoc(userDocRef, {
        dodji: currentDodji - dodjiCost
      });
      
      // Mettre à jour le statut du parcours
      await homeService.updateCourseStatus(userId, courseId, 'deblocked');
    } catch (error) {
      console.error('Erreur lors du déblocage du parcours avec Dodji:', error);
      // Ne pas propager l'erreur pour éviter les plantages
    }
  },
  
  /**
   * Récupère le design de la page d'accueil pour une section et un niveau spécifiques
   */
  getHomeDesign: async (section: Section, level: Level): Promise<{ imageUrl: string; positions: Record<string, { x: number; y: number; order?: number; isAnnex: boolean }> }> => {
    try {
      // Normaliser la section et le niveau pour la recherche
      const normalizedSection = normalizeString(section);
      const normalizedLevel = normalizeString(level);
      
      // Requête pour trouver le document correspondant dans la collection home_designs
      const designQuery = query(
        collection(db, 'home_designs'),
        where('domaine', '==', section),
        where('niveau', '==', level)
      );
      
      const designSnapshot = await getDocs(designQuery);
      
      if (designSnapshot.empty) {
        console.log(`Aucun design trouvé pour section=${section}, level=${level}`);
        // Retourner un objet vide mais valide
        return {
          imageUrl: '',
          positions: {}
        };
      }
      
      // Prendre le premier document correspondant
      const designDoc = designSnapshot.docs[0];
      const designData = designDoc.data();
      
      // Récupérer l'URL complète de l'image si nécessaire
      let imageUrl = designData.imageUrl || '';
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = await getImageUrlFromPath(imageUrl);
      }
      
      // Construire l'objet des positions
      const positions = designData.positions || {};
      
      return {
        imageUrl,
        positions
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du design de la page d\'accueil:', error);
      // Retourner un objet vide mais valide
      return {
        imageUrl: '',
        positions: {}
      };
    }
  },

  /**
   * Récupère les parcours statiques (sans statuts utilisateur) pour une section et un niveau
   */
  getStaticParcours: async (section: Section, level: Level): Promise<Record<string, any>> => {
    try {
      console.log(`🔍 Récupération des parcours statiques pour section=${section}, level=${level}`);
      
      // Récupérer les parcours correspondant à cette section et ce niveau
      const parcoursQuery = query(
        collection(db, 'parcours'),
        where('domaine', '==', section),
        where('niveau', '==', level)
      );
      
      const parcoursSnapshot = await getDocs(parcoursQuery);
      const parcours: Record<string, any> = {};
      
      // Traiter les parcours sans les statuts utilisateur
      if (!parcoursSnapshot.empty) {
        parcoursSnapshot.forEach(doc => {
          const parcoursData = doc.data();
          const ordre = parcoursData.ordre || 0;
          
          // Sauvegarder les données du parcours avec l'ordre comme clé
          // Statut par défaut 'blocked' car pas d'utilisateur connecté
          parcours[ordre.toString()] = {
            id: doc.id,
            ...parcoursData,
            status: 'blocked' // Statut par défaut pour les données statiques
          };
        });
      }
      
      console.log(`✅ ${Object.keys(parcours).length} parcours statiques récupérés pour ${section} - ${level}`);
      return parcours;
    } catch (error) {
      console.error('Erreur lors de la récupération des parcours statiques:', error);
      // Retourner un objet vide en cas d'erreur
      return {};
    }
  },

  /**
   * Observer les données de design de la page d'accueil en temps réel
   */
  observeHomeDesign: (section: Section, level: Level, callback: (data: { imageUrl: string; positions: Record<string, { x: number; y: number; order?: number; isAnnex: boolean }> }) => void) => {
    try {
      console.log(`🔄 Observation du design pour section=${section}, level=${level}`);
      
      const designQuery = query(
        collection(db, 'home_designs'),
        where('domaine', '==', section),
        where('niveau', '==', level)
      );
      
      return onSnapshot(designQuery, async (snapshot) => {
        try {
          if (snapshot.empty) {
            console.log(`Aucun design trouvé pour section=${section}, level=${level}`);
            callback({
              imageUrl: '',
              positions: {}
            });
            return;
          }
          
          // Prendre le premier document correspondant
          const designDoc = snapshot.docs[0];
          const designData = designDoc.data();
          
          // Récupérer l'URL complète de l'image si nécessaire
          let imageUrl = designData.imageUrl || '';
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = await getImageUrlFromPath(imageUrl);
          }
          
          // Construire l'objet des positions
          const positions = designData.positions || {};
          
          console.log(`✅ Design mis à jour pour section=${section}, level=${level}`);
          callback({
            imageUrl,
            positions
          });
        } catch (error) {
          console.error('Erreur lors du traitement des données de design:', error);
          callback({
            imageUrl: '',
            positions: {}
          });
        }
      }, (error) => {
        console.error('Erreur lors de l\'observation du design:', error);
        callback({
          imageUrl: '',
          positions: {}
        });
      });
    } catch (error) {
      console.error('Erreur lors de la configuration de l\'observation du design:', error);
      // Retourner une fonction de nettoyage vide en cas d'erreur
      return () => {};
    }
  },

  /**
   * Observer les parcours d'une section et niveau en temps réel
   */
  observeParcours: (section: Section, level: Level, callback: (parcours: Record<string, any>) => void) => {
    try {
      console.log(`🔄 Observation des parcours pour section=${section}, level=${level}`);
      
      const parcoursQuery = query(
        collection(db, 'parcours'),
        where('domaine', '==', section),
        where('niveau', '==', level)
      );
      
      return onSnapshot(parcoursQuery, (snapshot) => {
        try {
          const parcours: Record<string, any> = {};
          
          if (!snapshot.empty) {
            snapshot.forEach(doc => {
              const parcoursData = doc.data();
              const ordre = parcoursData.ordre || 0;
              
              // Sauvegarder les données du parcours avec l'ordre comme clé
              parcours[ordre.toString()] = {
                id: doc.id,
                ...parcoursData,
                status: 'blocked' // Statut par défaut, sera mis à jour par observeUserParcours
              };
            });
          }
          
          console.log(`✅ Parcours mis à jour pour section=${section}, level=${level}:`, Object.keys(parcours));
          callback(parcours);
        } catch (error) {
          console.error('Erreur lors du traitement des données de parcours:', error);
          callback({});
        }
      }, (error) => {
        console.error('Erreur lors de l\'observation des parcours:', error);
        callback({});
      });
    } catch (error) {
      console.error('Erreur lors de la configuration de l\'observation des parcours:', error);
      // Retourner une fonction de nettoyage vide en cas d'erreur
      return () => {};
    }
  },

  /**
   * Observer les statuts des parcours d'un utilisateur en temps réel
   */
  observeUserParcours: (userId: string, callback: (statuses: Record<string, any>) => void) => {
    try {
      console.log(`🔄 Observation des statuts de parcours pour l'utilisateur ${userId}`);
      
      const userParcoursRef = collection(db, `users/${userId}/parcours`);
      
      return onSnapshot(userParcoursRef, (snapshot) => {
        try {
          const statuses: Record<string, any> = {};
          
          snapshot.forEach(doc => {
            statuses[doc.id] = doc.data();
          });
          
          console.log(`✅ Statuts de parcours mis à jour pour l'utilisateur ${userId}:`, Object.keys(statuses));
          callback(statuses);
        } catch (error) {
          console.error('Erreur lors du traitement des statuts de parcours:', error);
          callback({});
        }
      }, (error) => {
        console.error('Erreur lors de l\'observation des statuts de parcours:', error);
        callback({});
      });
    } catch (error) {
      console.error('Erreur lors de la configuration de l\'observation des statuts de parcours:', error);
      // Retourner une fonction de nettoyage vide en cas d'erreur
      return () => {};
    }
  },

  /**
   * Observer les données complètes de la page d'accueil avec parcours en temps réel
   */
  observeHomeDesignWithParcours: (section: Section, level: Level, userId?: string, callback?: (data: { imageUrl: string; positions: Record<string, { x: number; y: number; order?: number; isAnnex: boolean }>; parcours?: Record<string, any> }) => void) => {
    if (!callback) {
      console.error('Callback requis pour observeHomeDesignWithParcours');
      return () => {};
    }

    const unsubscribeFunctions: (() => void)[] = [];
    let homeDesignData: { imageUrl: string; positions: Record<string, { x: number; y: number; order?: number; isAnnex: boolean }> } = { imageUrl: '', positions: {} };
    let parcoursData: Record<string, any> = {};
    let userStatuses: Record<string, any> = {};

    // Fonction pour combiner et envoyer les données
    const sendCombinedData = () => {
      const combinedParcours = { ...parcoursData };
      
      // Appliquer les statuts utilisateur aux parcours
      Object.keys(combinedParcours).forEach(key => {
        const parcours = combinedParcours[key];
        if (parcours && parcours.id && userStatuses[parcours.id]) {
          combinedParcours[key] = {
            ...parcours,
            status: userStatuses[parcours.id].status || 'blocked'
          };
        }
      });

      callback({
        ...homeDesignData,
        parcours: combinedParcours
      });
    };

    try {
      // Observer le design de la page d'accueil
      const unsubscribeDesign = homeService.observeHomeDesign(section, level, (designData) => {
        homeDesignData = designData;
        sendCombinedData();
      });
      unsubscribeFunctions.push(unsubscribeDesign);

      // Observer les parcours
      const unsubscribeParcours = homeService.observeParcours(section, level, (parcours) => {
        parcoursData = parcours;
        sendCombinedData();
      });
      unsubscribeFunctions.push(unsubscribeParcours);

      // Observer les statuts utilisateur si un utilisateur est connecté
      if (userId) {
        const unsubscribeUserParcours = homeService.observeUserParcours(userId, (statuses) => {
          userStatuses = statuses;
          sendCombinedData();
        });
        unsubscribeFunctions.push(unsubscribeUserParcours);
      }

      // Retourner une fonction de nettoyage qui désabonne tous les listeners
      return () => {
        console.log('🧹 Nettoyage des listeners de la page d\'accueil');
        unsubscribeFunctions.forEach(unsubscribe => {
          try {
            unsubscribe();
          } catch (error) {
            console.error('Erreur lors du nettoyage d\'un listener:', error);
          }
        });
      };
    } catch (error) {
      console.error('Erreur lors de la configuration de l\'observation complète:', error);
      // Nettoyer les listeners déjà configurés
      unsubscribeFunctions.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (cleanupError) {
          console.error('Erreur lors du nettoyage d\'urgence:', cleanupError);
        }
      });
      return () => {};
    }
  },

  /**
   * Observer les statistiques utilisateur en temps réel
   */
  observeUserStats: (userId: string, callback: (stats: { streak: number; dodji: number }) => void) => {
    try {
      console.log(`🔄 Configuration du listener pour les statistiques de l'utilisateur ${userId}`);
      
      const userRef = doc(db, 'users', userId);
      
      return onSnapshot(userRef, (snapshot) => {
        try {
          if (snapshot.exists()) {
            const userData = snapshot.data();
            const stats = {
              streak: userData.streak || 0,
              dodji: userData.dodji || 0
            };
            console.log(`✅ Statistiques utilisateur mises à jour:`, stats);
            callback(stats);
          } else {
            console.log(`⚠️ Document utilisateur ${userId} n'existe pas`);
            callback({ streak: 0, dodji: 0 });
          }
        } catch (error) {
          console.error('Erreur lors du traitement des statistiques utilisateur:', error);
          callback({ streak: 0, dodji: 0 });
        }
      }, (error) => {
        console.error('Erreur lors de l\'observation des statistiques utilisateur:', error);
        callback({ streak: 0, dodji: 0 });
      });
    } catch (error) {
      console.error('Erreur lors de la configuration de l\'observation des statistiques utilisateur:', error);
      // Retourner une fonction de nettoyage vide en cas d'erreur
      return () => {};
    }
  }
};

/**
 * Fonction pour récupérer le statut de tous les parcours d'un utilisateur
 */
async function getUserCoursesStatus(userId: string, courseIds: string[]) {
  try {
    // Récupérer tous les documents de parcours de l'utilisateur
    const userCoursesRef = collection(db, `users/${userId}/courses`);
    const userCoursesSnapshot = await getDocs(userCoursesRef);
    
    // Créer une map des statuts de parcours
    const courseStatusMap: Record<string, { status: 'blocked' | 'completed' | 'deblocked', progress: number }> = {};
    
    userCoursesSnapshot.forEach(doc => {
      const data = doc.data();
      courseStatusMap[doc.id] = {
        status: data.status || 'blocked',
        progress: data.progress || 0
      };
    });
    
    // Ajouter les parcours manquants comme "blocked"
    courseIds.forEach(id => {
      if (!courseStatusMap[id]) {
        courseStatusMap[id] = {
          status: 'blocked',
          progress: 0
        };
      }
    });
    
    return courseStatusMap;
  } catch (error) {
    console.error('Erreur lors de la récupération des statuts de parcours:', error);
    // Retourner une map vide en cas d'erreur
    return {};
  }
}

/**
 * Fonction pour débloquer le parcours suivant après avoir complété un parcours
 */
async function unlockNextCourse(userId: string, completedCourseId: string) {
  try {
    // Récupérer le parcours complété pour connaître sa section et son niveau
    const courseRef = doc(db, 'parcours', completedCourseId);
    const courseDoc = await getDoc(courseRef);
    
    if (!courseDoc.exists()) {
      console.error(`Parcours ${completedCourseId} non trouvé`);
      return false;
    }
    
    const courseData = courseDoc.data() as FirestoreCourseData;
    const section = courseData.domaine;
    const level = courseData.niveau;
    const ordre = courseData.ordre || 0;
    
    // Trouver le parcours suivant dans la même section et niveau
    const nextCourseQuery = query(
      collection(db, 'parcours'),
      where('domaine', '==', section),
      where('niveau', '==', level),
      where('ordre', '==', ordre + 1)
    );
    
    const nextCourseSnapshot = await getDocs(nextCourseQuery);
    
    if (nextCourseSnapshot.empty) {
      console.log(`Aucun parcours suivant trouvé après ${completedCourseId}`);
      return false;
    }
    
    // Débloquer le parcours suivant
    const nextCourseId = nextCourseSnapshot.docs[0].id;
    await setDoc(doc(db, `users/${userId}/courses`, nextCourseId), {
      status: 'deblocked',
      progress: 0
    }, { merge: true });
    
    console.log(`Parcours suivant ${nextCourseId} débloqué pour l'utilisateur ${userId}`);
    return true;
  } catch (error) {
    console.error('Erreur lors du déblocage du parcours suivant:', error);
    return false;
  }
}

/**
 * Récupère le design de la page d'accueil et les parcours associés
 */
export async function getHomeDesignWithParcours(section: Section, level: Level, userId?: string): Promise<{ imageUrl: string; positions: Record<string, { x: number; y: number; order?: number; isAnnex: boolean }>; parcours?: Record<string, any> }> {
  try {
    // Obtenir d'abord le design de la page (image et positions)
    const homeDesignData = await homeService.getHomeDesign(section, level);
    
    // Récupérer les parcours correspondant à cette section et ce niveau
    const parcoursQuery = query(
      collection(db, 'parcours'),
      where('domaine', '==', section),
      where('niveau', '==', level)
    );
    
    const parcoursSnapshot = await getDocs(parcoursQuery);
    const parcours: Record<string, any> = {};
    
    // Récupérer les statuts des parcours si l'utilisateur est connecté
    let parcoursStatuses: Record<string, any> = {};
    if (userId) {
      try {
        // Récupérer les documents de statut de parcours pour l'utilisateur
        const userParcoursSnapshot = await getDocs(collection(db, `users/${userId}/parcours`));
        userParcoursSnapshot.forEach(doc => {
          parcoursStatuses[doc.id] = doc.data();
        });
        console.log(`Statuts des parcours récupérés pour l'utilisateur ${userId}:`, parcoursStatuses);
      } catch (statusError) {
        console.error('Erreur lors de la récupération des statuts des parcours:', statusError);
      }
    }
    
    // Traiter les parcours et les associer à leurs positions
    if (!parcoursSnapshot.empty) {
      parcoursSnapshot.forEach(doc => {
        const parcoursData = doc.data();
        const ordre = parcoursData.ordre || 0;
        
        // Récupérer le statut du parcours s'il existe
        const parcoursStatus = parcoursStatuses[doc.id];
        
        // Sauvegarder les données du parcours avec l'ordre comme clé
        parcours[ordre.toString()] = {
          id: doc.id,
          ...parcoursData,
          // Utiliser le statut du parcours s'il existe, sinon utiliser 'blocked' par défaut
          status: parcoursStatus?.status || 'blocked'
        };
      });
    }
    
    return {
      ...homeDesignData,
      parcours
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données de la page d\'accueil:', error);
    return {
      imageUrl: '',
      positions: {}
    };
  }
}

// Exporter les fonctions utilitaires pour les utiliser dans d'autres fichiers
export const getHomeDesign = homeService.getHomeDesign;
export const updateCourseStatus = homeService.updateCourseStatus;
export const updateCourseProgress = homeService.updateCourseProgress;
export const unlockCourseWithDodji = homeService.unlockCourseWithDodji; 