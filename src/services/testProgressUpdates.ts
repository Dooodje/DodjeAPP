import { doc, updateDoc, collection, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Progress } from '../types/profile';

/**
 * Service de test pour simuler des mises à jour de progression
 * Utilisé pour tester les listeners Firestore en temps réel
 */
export class TestProgressUpdatesService {
  
  /**
   * Simule la complétion d'un parcours pour tester les listeners
   */
  static async simulateParcoursCompletion(
    userId: string, 
    parcoursId: string, 
    domaine: 'Bourse' | 'Crypto'
  ): Promise<void> {
    try {
      console.log(`🧪 Test: Simulation de la complétion du parcours ${parcoursId} (${domaine})`);
      
      // Ajouter le parcours comme complété dans la sous-collection de l'utilisateur
      const userParcoursRef = doc(db, 'users', userId, 'parcours', parcoursId);
      
      await setDoc(userParcoursRef, {
        status: 'completed',
        domaine: domaine,
        completedAt: Timestamp.now(),
        progress: 100
      }, { merge: true });
      
      console.log(`✅ Test: Parcours ${parcoursId} marqué comme complété`);
      
    } catch (error) {
      console.error('❌ Erreur lors de la simulation:', error);
      throw error;
    }
  }

  /**
   * Met à jour directement la progression dans le profil utilisateur
   */
  static async updateProfileProgress(
    userId: string, 
    progress: Progress
  ): Promise<void> {
    try {
      console.log(`🧪 Test: Mise à jour directe de la progression`, progress);
      
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        progress,
        updatedAt: Timestamp.now()
      });
      
      console.log(`✅ Test: Progression mise à jour dans le profil`);
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      throw error;
    }
  }

  /**
   * Simule une progression incrémentale pour tester les mises à jour en temps réel
   */
  static async simulateProgressiveUpdate(
    userId: string,
    category: 'bourse' | 'crypto',
    steps: number = 5,
    intervalMs: number = 2000
  ): Promise<void> {
    try {
      console.log(`🧪 Test: Simulation de progression incrémentale pour ${category}`);
      
      for (let i = 1; i <= steps; i++) {
        const percentage = Math.round((i / steps) * 100);
        const completedCourses = i;
        const totalCourses = steps;
        
        const progress: Progress = {
          bourse: category === 'bourse' 
            ? { percentage, completedCourses, totalCourses }
            : { percentage: 0, completedCourses: 0, totalCourses: 5 },
          crypto: category === 'crypto' 
            ? { percentage, completedCourses, totalCourses }
            : { percentage: 0, completedCourses: 0, totalCourses: 5 }
        };
        
        await this.updateProfileProgress(userId, progress);
        
        console.log(`📊 Test: Étape ${i}/${steps} - ${category}: ${percentage}%`);
        
        if (i < steps) {
          await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
      }
      
      console.log(`✅ Test: Simulation terminée pour ${category}`);
      
    } catch (error) {
      console.error('❌ Erreur lors de la simulation progressive:', error);
      throw error;
    }
  }

  /**
   * Remet à zéro la progression pour les tests
   */
  static async resetProgress(userId: string): Promise<void> {
    try {
      console.log(`🧪 Test: Remise à zéro de la progression`);
      
      const progress: Progress = {
        bourse: { percentage: 0, completedCourses: 0, totalCourses: 10 },
        crypto: { percentage: 0, completedCourses: 0, totalCourses: 8 }
      };
      
      await this.updateProfileProgress(userId, progress);
      
      console.log(`✅ Test: Progression remise à zéro`);
      
    } catch (error) {
      console.error('❌ Erreur lors de la remise à zéro:', error);
      throw error;
    }
  }

  /**
   * Teste les listeners en effectuant plusieurs mises à jour rapides
   */
  static async testRealTimeListeners(userId: string): Promise<void> {
    try {
      console.log(`🧪 Test: Test des listeners en temps réel`);
      
      // Remise à zéro
      await this.resetProgress(userId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test progression Bourse
      await this.simulateProgressiveUpdate(userId, 'bourse', 3, 1500);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test progression Crypto
      await this.simulateProgressiveUpdate(userId, 'crypto', 4, 1200);
      
      console.log(`✅ Test: Test des listeners terminé`);
      
    } catch (error) {
      console.error('❌ Erreur lors du test des listeners:', error);
      throw error;
    }
  }
} 