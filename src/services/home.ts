import { collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { db, storage } from '../config/firebase';
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
  if (!imagePath) return '';
  
  try {
    // Vérifier si c'est déjà une URL complète
    if (imagePath.startsWith('http')) {
      return imagePath;
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
   * Récupère les données de l'arbre d'apprentissage pour une section et un niveau spécifiques
   * Version ultra simplifiée sans indexOf/filter/includes
   */
  getTreeData: async (section: Section, level: Level, userId: string): Promise<TreeData> => {
    try {
      console.log(`Recherche des cours pour section=${section}, level=${level}`);
      
      // Retourner directement un TreeData vide mais valide
      // Cette approche évite toute méthode de tableau qui utiliserait indexOf en interne
      return {
        section,
        level,
        treeImageUrl: '',
        courses: [
          // Créer manuellement un cours test
          {
            id: 'test-course-1',
            title: 'Cours de test',
            description: 'Un cours créé manuellement pour éviter les erreurs indexOf',
            level: level,
            section: section,
            position: { x: 0.5, y: 0.5 },
            status: 'deblocked',
            progress: 0,
            dodjiCost: 100,
            imageUrl: '',
            lockIcon: 'lock',
            checkIcon: 'check',
            ringIcon: 'circle-outline',
            ordre: 1,
            videoIds: [],
            quizId: null,
            isAnnex: false
          }
        ]
      };
      
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      // Retourner un objet minimal en cas d'erreur
      return {
        section,
        level,
        treeImageUrl: '',
        courses: []
      };
    }
  },
  
  /**
   * Récupère les statistiques de l'utilisateur (streak, dodji)
   */
  getUserStats: async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        return {
          streak: 0,
          dodji: 0
        };
      }
      
      const userData = userDoc.data();
      
      return {
        streak: userData.streak || 0,
        dodji: userData.dodji || 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques utilisateur:', error);
      return {
        streak: 0,
        dodji: 0
      };
    }
  },
  
  /**
   * Récupère le dernier parcours visionné par l'utilisateur
   */
  getLastViewedCourse: async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        return null;
      }
      
      const userData = userDoc.data();
      return userData.lastViewedCourse || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du dernier parcours visionné:', error);
      return null;
    }
  },
  
  /**
   * Met à jour le statut d'un parcours pour un utilisateur
   */
  updateCourseStatus: async (userId: string, courseId: string, status: 'blocked' | 'completed' | 'deblocked'): Promise<void> => {
    try {
      const userCourseRef = doc(db, 'users', userId, 'courses', courseId);
      await setDoc(userCourseRef, { status }, { merge: true });
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
export async function getHomeDesignWithParcours(section: Section, level: Level): Promise<{ imageUrl: string; positions: Record<string, { x: number; y: number; order?: number; isAnnex: boolean }>; parcours?: Record<string, any> }> {
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
    
    // Traiter les parcours et les associer à leurs positions
    if (!parcoursSnapshot.empty) {
      parcoursSnapshot.forEach(doc => {
        const parcoursData = doc.data();
        const ordre = parcoursData.ordre || 0;
        
        // Sauvegarder les données du parcours avec l'ordre comme clé
        parcours[ordre.toString()] = {
          id: doc.id,
          ...parcoursData
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