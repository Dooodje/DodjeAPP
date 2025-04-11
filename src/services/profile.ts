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

  // Récupérer le profil complet d'un utilisateur
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, this.COLLECTION, userId));
      if (!userDoc.exists()) {
        return null;
      }

      const data = userDoc.data();
      return {
        ...data,
        id: userDoc.id,
        lastLoginDate: data.lastLoginDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as UserProfile;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
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

  // Ajouter un badge
  async addBadge(userId: string, badge: Badge): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      await updateDoc(userRef, {
        badges: [...badge],
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

      const newProfile: Omit<UserProfile, 'id'> = {
        displayName,
        streak: 0,
        lastLoginDate: now,
        progress: {
          bourse: { percentage: 0, completedCourses: 0, totalCourses: 0 },
          crypto: { percentage: 0, completedCourses: 0, totalCourses: 0 }
        },
        badges: [],
        quests: [],
        dodjiBalance: 0,
        isDodjeOne: false,
        createdAt: now,
        updatedAt: now
      };

      await setDoc(userRef, newProfile);
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error);
      throw error;
    }
  }
}

export const profileService = ProfileService.getInstance(); 