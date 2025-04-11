import { db } from './firebase';
import { doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { iapService } from './iap';

export class DodjiService {
  private static instance: DodjiService;
  private readonly COLLECTION = 'users';
  private readonly FIELD = 'dodjiBalance';

  private constructor() {}

  static getInstance(): DodjiService {
    if (!DodjiService.instance) {
      DodjiService.instance = new DodjiService();
    }
    return DodjiService.instance;
  }

  // Obtenir le solde de Dodji
  async getBalance(userId: string): Promise<number> {
    try {
      const userDoc = await getDoc(doc(db, this.COLLECTION, userId));
      return userDoc.data()?.[this.FIELD] || 0;
    } catch (error) {
      console.error('Erreur lors de la récupération du solde:', error);
      throw error;
    }
  }

  // Acheter des jetons
  async purchaseTokens(userId: string, packId: string): Promise<void> {
    try {
      const product = iapService.getProduct(packId);
      if (!product) {
        throw new Error('Produit non trouvé');
      }

      // Effectuer l'achat via IAP
      const result = await iapService.purchaseProduct(packId);
      
      if (result.responseCode === 0) {
        // Mettre à jour le solde
        await updateDoc(doc(db, this.COLLECTION, userId), {
          [this.FIELD]: increment(product.amount)
        });
      } else {
        throw new Error('Échec de l\'achat');
      }
    } catch (error) {
      console.error('Erreur lors de l\'achat de jetons:', error);
      throw error;
    }
  }

  // Dépenser des jetons
  async spendTokens(userId: string, amount: number): Promise<boolean> {
    try {
      const currentBalance = await this.getBalance(userId);
      
      if (currentBalance < amount) {
        return false;
      }

      await updateDoc(doc(db, this.COLLECTION, userId), {
        [this.FIELD]: increment(-amount)
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la dépense de jetons:', error);
      throw error;
    }
  }

  // Récompenser des jetons
  async rewardTokens(userId: string, amount: number, reason: string): Promise<void> {
    try {
      // Vérifier si l'utilisateur a déjà reçu cette récompense
      const userDoc = await getDoc(doc(db, this.COLLECTION, userId));
      const rewards = userDoc.data()?.rewards || {};
      
      if (rewards[reason]) {
        return; // L'utilisateur a déjà reçu cette récompense
      }

      // Mettre à jour le solde et marquer la récompense comme reçue
      await updateDoc(doc(db, this.COLLECTION, userId), {
        [this.FIELD]: increment(amount),
        [`rewards.${reason}`]: true
      });
    } catch (error) {
      console.error('Erreur lors de la récompense de jetons:', error);
      throw error;
    }
  }

  // Récompenses prédéfinies
  async rewardFirstConnection(userId: string): Promise<void> {
    await this.rewardTokens(userId, 100, 'first_connection');
  }

  async rewardFirstCourse(userId: string): Promise<void> {
    await this.rewardTokens(userId, 200, 'first_course');
  }

  async rewardCourseCompletion(userId: string, courseId: string): Promise<void> {
    await this.rewardTokens(userId, 500, `course_completion_${courseId}`);
  }
}

export const dodjiService = DodjiService.getInstance(); 