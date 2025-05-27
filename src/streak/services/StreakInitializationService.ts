import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export class StreakInitializationService {
  /**
   * Initialise les données de streak pour un nouvel utilisateur
   * @param userId - ID de l'utilisateur
   */
  static async initializeUserStreak(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Initialiser les champs de streak
      await setDoc(userRef, {
        streak: 0,
        lastStreakUpdate: '',
      }, { merge: true });

      console.log(`Streak initialisé pour l'utilisateur: ${userId}`);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du streak:', error);
      throw error;
    }
  }

  /**
   * Réinitialise les données de streak pour un utilisateur existant
   * @param userId - ID de l'utilisateur
   */
  static async resetUserStreak(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      
      await setDoc(userRef, {
        streak: 0,
        lastStreakUpdate: '',
      }, { merge: true });

      console.log(`Streak réinitialisé pour l'utilisateur: ${userId}`);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du streak:', error);
      throw error;
    }
  }
} 