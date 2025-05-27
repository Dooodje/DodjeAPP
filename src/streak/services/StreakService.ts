import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { StreakData, calculateStreakReward, getStreakRewardInfo } from '../types';

export class StreakService {
  /**
   * Vérifie si l'utilisateur peut gagner un streak aujourd'hui (sans donner les récompenses)
   * @param userId - ID de l'utilisateur
   * @returns StreakData avec les informations du streak potentiel
   */
  static async checkStreakEligibility(userId: string): Promise<StreakData> {
    try {
      console.log('🔥 StreakService: Vérification de l\'éligibilité au streak pour:', userId);
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.error('🔥 StreakService: Utilisateur non trouvé dans Firestore:', userId);
        throw new Error('Utilisateur non trouvé');
      }

      const userData = userDoc.data();
      const now = new Date();
      const today = now.toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      // Récupérer les données actuelles
      const currentStreak = userData.streak || 0;
      const lastStreakUpdate = userData.lastStreakUpdate || null;
      const lastLogin = userData.lastLogin || '';

      console.log('🔥 StreakService: Données utilisateur récupérées:', {
        currentStreak,
        lastStreakUpdate,
        lastLogin,
        today
      });

      // Vérifier si c'est un nouveau jour
      const lastStreakDate = lastStreakUpdate ? new Date(lastStreakUpdate).toISOString().split('T')[0] : null;
      const isNewDay = lastStreakDate !== today;

      console.log('🔥 StreakService: Analyse des dates:', {
        lastStreakDate,
        today,
        isNewDay,
        lastStreakUpdateRaw: lastStreakUpdate
      });

      if (!isNewDay) {
        // L'utilisateur s'est déjà connecté aujourd'hui
        console.log('🔥 StreakService: Utilisateur déjà connecté aujourd\'hui, pas de nouveau streak');
        return {
          currentStreak,
          lastStreakUpdate: lastStreakUpdate || '',
          lastLogin,
          totalDodjiEarned: 0,
          isNewStreakDay: false
        };
      }

      // Calculer le nouveau streak potentiel
      let newStreak = 1;
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      console.log('🔥 StreakService: Calcul du streak potentiel:', {
        lastStreakDate,
        yesterdayStr,
        currentStreak,
        isConsecutive: lastStreakDate === yesterdayStr
      });

      if (lastStreakDate === yesterdayStr) {
        // L'utilisateur s'est connecté hier, continuer le streak
        newStreak = currentStreak + 1;
        console.log('🔥 StreakService: Continuation du streak:', newStreak);
      } else {
        // Le streak recommence à 1
        console.log('🔥 StreakService: Nouveau streak commencé à 1');
      }

      // Calculer la récompense potentielle (sans la donner)
      const dodjiReward = calculateStreakReward(newStreak);
      const rewardInfo = getStreakRewardInfo(newStreak);

      console.log('🔥 StreakService: Récompense potentielle calculée:', {
        newStreak,
        dodjiReward,
        rewardInfo
      });

      const result = {
        currentStreak: newStreak,
        lastStreakUpdate: userData.lastStreakUpdate || '',
        lastLogin: now.toISOString(),
        totalDodjiEarned: dodjiReward,
        isNewStreakDay: true,
        todayReward: {
          ...rewardInfo,
          dodjiReward
        },
        newStreakData: {
          currentStreak: newStreak,
          lastStreakUpdate: now.toISOString(),
          lastLogin: now.toISOString(),
          totalDodjiEarned: dodjiReward
        }
      };

      console.log('🔥 StreakService: Résultat de l\'éligibilité:', result);

      return result;

    } catch (error) {
      console.error('🔥 StreakService: Erreur lors de la vérification de l\'éligibilité:', error);
      throw error;
    }
  }

  /**
   * Applique les récompenses du streak (appelé quand l'utilisateur clique sur "Prendre les récompenses")
   * @param userId - ID de l'utilisateur
   * @param streakData - Données du streak à appliquer
   */
  static async claimStreakReward(userId: string, streakData: StreakData): Promise<void> {
    try {
      console.log('🔥 StreakService: Application des récompenses pour:', userId, streakData);
      
      const userRef = doc(db, 'users', userId);
      
      // Utiliser newStreakData si disponible, sinon utiliser les données existantes
      const dataToApply = (streakData as any).newStreakData || streakData;
      
      // Mettre à jour la base de données avec les récompenses
      const updateData = {
        streak: dataToApply.currentStreak,
        lastStreakUpdate: dataToApply.lastStreakUpdate,
        lastLogin: dataToApply.lastLogin,
        dodji: increment(dataToApply.totalDodjiEarned)
      };

      console.log('🔥 StreakService: Mise à jour de la base de données avec:', updateData);

      await updateDoc(userRef, updateData);

      console.log('🔥 StreakService: Récompenses appliquées avec succès');

    } catch (error) {
      console.error('🔥 StreakService: Erreur lors de l\'application des récompenses:', error);
      throw error;
    }
  }

  /**
   * Vérifie et met à jour le streak de connexion de l'utilisateur (ancienne méthode - gardée pour compatibilité)
   * @param userId - ID de l'utilisateur
   * @returns StreakData avec les informations du streak
   */
  static async checkAndUpdateStreak(userId: string): Promise<StreakData> {
    // Ne plus donner automatiquement les récompenses, seulement vérifier l'éligibilité
    const eligibility = await this.checkStreakEligibility(userId);
    
    // Ne pas appliquer automatiquement les récompenses
    // if (eligibility.isNewStreakDay) {
    //   await this.claimStreakReward(userId, eligibility);
    // }
    
    return eligibility;
  }

  /**
   * Récupère les données de streak actuelles sans les modifier
   * @param userId - ID de l'utilisateur
   * @returns StreakData actuelles
   */
  static async getCurrentStreak(userId: string): Promise<StreakData> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const userData = userDoc.data();
      
      return {
        currentStreak: userData.streak || 0,
        lastStreakUpdate: userData.lastStreakUpdate || '',
        lastLogin: userData.lastLogin || '',
        totalDodjiEarned: 0,
        isNewStreakDay: false
      };

    } catch (error) {
      console.error('Erreur lors de la récupération du streak:', error);
      throw error;
    }
  }

  /**
   * Vérifie si l'utilisateur peut gagner un streak aujourd'hui
   * @param userId - ID de l'utilisateur
   * @returns boolean indiquant si un nouveau streak peut être gagné
   */
  static async canEarnStreakToday(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return true; // Nouvel utilisateur peut gagner un streak
      }

      const userData = userDoc.data();
      const lastStreakUpdate = userData.lastStreakUpdate || '';
      
      if (!lastStreakUpdate) {
        return true; // Aucun streak précédent
      }

      const today = new Date().toISOString().split('T')[0];
      const lastStreakDate = new Date(lastStreakUpdate).toISOString().split('T')[0];
      
      return lastStreakDate !== today;

    } catch (error) {
      console.error('Erreur lors de la vérification du streak quotidien:', error);
      return false;
    }
  }

  /**
   * Réinitialise le streak d'un utilisateur (pour les tests ou la maintenance)
   * @param userId - ID de l'utilisateur
   */
  static async resetStreak(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        streak: 0,
        lastStreakUpdate: '',
      });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du streak:', error);
      throw error;
    }
  }
} 