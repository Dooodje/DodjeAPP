import { db } from './firebase';
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { UserProfile, Badge, Quest } from '../types/profile';

export class ProfileService {
  private static instance: ProfileService;
  private readonly COLLECTION = 'users';

  private constructor() {}

  static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  // Obtenir le profil d'un utilisateur
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) {
      console.error("getUserProfile: userId est vide ou null");
      throw new Error("ID utilisateur invalide");
    }

    console.log(`Récupération du profil pour l'utilisateur: ${userId}`);
    
    try {
      // Utiliser doc() avec userId pour référencer un document spécifique
      const userRef = doc(db, this.COLLECTION, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.log(`Aucun profil trouvé pour l'utilisateur: ${userId}`);
        return null;
      }

      const data = userDoc.data();
      
      // Fonction utilitaire pour traiter les dates (Timestamp ou ISO string)
      const processDate = (dateField: any, defaultDate: Date = new Date()): Date => {
        if (!dateField) return defaultDate;
        
        // Si c'est un Timestamp Firestore
        if (dateField.toDate && typeof dateField.toDate === 'function') {
          return dateField.toDate();
        }
        
        // Si c'est une chaîne ISO
        if (typeof dateField === 'string') {
          try {
            return new Date(dateField);
          } catch (e) {
            console.warn(`Impossible de convertir la chaîne en date: ${dateField}`);
            return defaultDate;
          }
        }
        
        // Si c'est déjà un objet Date
        if (dateField instanceof Date) {
          return dateField;
        }
        
        console.warn(`Format de date non reconnu:`, dateField);
        return defaultDate;
      };

      return {
        id: userDoc.id,
        displayName: data.displayName || '',
        name: data.name || '',
        sexe: data.sexe || undefined,
        avatarUrl: data.avatarUrl || '',
        streak: data.streak || 0,
        lastLoginDate: processDate(data.lastLoginDate),
        progress: data.progress || {
          bourse: { percentage: 0, completedCourses: 0, totalCourses: 0 },
          crypto: { percentage: 0, completedCourses: 0, totalCourses: 0 }
        },
        badges: data.badges || [],
        quests: data.quests || [],
        dodji: data.dodji || 0,
        isDodjeOne: data.isDodjeOne || false,
        createdAt: processDate(data.createdAt),
        updatedAt: processDate(data.updatedAt)
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération du profil:', error);
      
      // Gestion spécifique des erreurs de permissions Firestore
      if (error.code === 'permission-denied' || 
          (error.message && (
            error.message.includes('permission') || 
            error.message.includes('Missing or insufficient permissions')
          ))) {
        console.error('Erreur de permission Firestore: Vérifiez les règles de sécurité dans firestore.rules');
        throw new Error('Permissions insuffisantes pour accéder à votre profil. Veuillez contacter le support.');
      }
      
      throw error;
    }
  }

  // Mettre à jour le profil
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }

  // Mettre à jour le streak
  async updateStreak(userId: string): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      const data = userDoc.data();
      
      if (!data) {
        throw new Error('Utilisateur non trouvé');
      }

      const lastLogin = data.lastLoginDate?.toDate();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (lastLogin) {
        const yesterday = new Date(lastLogin);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        if (yesterday.getTime() === today.getTime()) {
          // L'utilisateur s'est connecté hier, incrémenter le streak
          await updateDoc(userRef, {
            streak: data.streak + 1,
            lastLoginDate: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
        } else if (lastLogin.getTime() !== today.getTime()) {
          // L'utilisateur a manqué un jour, réinitialiser le streak
          await updateDoc(userRef, {
            streak: 1,
            lastLoginDate: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
        }
      } else {
        // Première connexion
        await updateDoc(userRef, {
          streak: 1,
          lastLoginDate: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du streak:', error);
      throw error;
    }
  }

  // Mettre à jour la progression
  async updateProgress(userId: string, category: 'bourse' | 'crypto', progress: number): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      await updateDoc(userRef, {
        [`progress.${category}.percentage`]: progress,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
      throw error;
    }
  }

  // Mettre à jour la progression complète
  async updateProfileProgress(userId: string, progress: UserProfile['progress']): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      await updateDoc(userRef, {
        progress,
        updatedAt: Timestamp.now()
      });
      console.log('Progression du profil mise à jour avec succès:', progress);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression complète:', error);
      throw error;
    }
  }

  // Ajouter un badge
  async addBadge(userId: string, badge: Badge): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const data = userDoc.data();
      const currentBadges = data.badges || [];
      
      // Ajouter le nouveau badge au tableau existant
      await updateDoc(userRef, {
        badges: [...currentBadges, badge],
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du badge:', error);
      throw error;
    }
  }

  // Mettre à jour une quête
  async updateQuest(userId: string, questId: string, updates: Partial<Quest>): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      const data = userDoc.data();
      
      if (!data) {
        throw new Error('Utilisateur non trouvé');
      }

      const quests = data.quests.map((quest: Quest) => {
        if (quest.id === questId) {
          return { ...quest, ...updates };
        }
        return quest;
      });

      await updateDoc(userRef, {
        quests,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quête:', error);
      throw error;
    }
  }

  // Créer un nouveau profil
  async createProfile(userId: string, displayName: string): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      const now = Timestamp.now();

      // Pour assurer la compatibilité avec l'interface UserProfile qui attend des Date
      const nowDate = now.toDate();

      const newProfile: Omit<UserProfile, 'id'> = {
        displayName,
        name: displayName,
        streak: 0,
        lastLoginDate: nowDate,
        progress: {
          bourse: { percentage: 0, completedCourses: 0, totalCourses: 0 },
          crypto: { percentage: 0, completedCourses: 0, totalCourses: 0 }
        },
        badges: [],
        quests: [],
        dodji: 0,
        isDodjeOne: false,
        createdAt: nowDate,
        updatedAt: nowDate
      };

      await setDoc(userRef, {
        ...newProfile,
        // Reconversion en Timestamp pour le stockage dans Firestore
        lastLoginDate: now,
        createdAt: now,
        updatedAt: now
      });
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error);
      throw error;
    }
  }
}

export const profileService = ProfileService.getInstance(); 