import { db } from './firebase';
import { doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { iapService } from './iap';

export class DodjiService {
  private static instance: DodjiService;
  private readonly COLLECTION = 'users';
  private readonly FIELD = 'dodji';
  private readonly DODJI_COLLECTION = 'jeton_dodji';

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

  // Vérifier si une récompense a déjà été attribuée
  async hasReceivedReward(userId: string, rewardId: string): Promise<boolean> {
    try {
      const rewardsRef = doc(db, this.COLLECTION, userId, this.DODJI_COLLECTION, 'rewards');
      const rewardsDoc = await getDoc(rewardsRef);

      if (!rewardsDoc.exists()) {
        return false;
      }

      const data = rewardsDoc.data();
      return data.rewards?.[rewardId] === true;
    } catch (error) {
      console.error('Error checking reward status:', error);
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
      
      if (!result) {
        throw new Error('Échec de l\'achat : résultat null');
      }
      
      if (result.responseCode === 0) {
        // Déterminer la quantité de Dodji à ajouter selon le produit
        let dodjiAmount = 0;
        switch (product.productId) {
          case 'dodji_small':
            dodjiAmount = 100;
            break;
          case 'dodji_medium':
            dodjiAmount = 500;
            break;
          case 'dodji_large':
            dodjiAmount = 1000;
            break;
          case 'dodji_xlarge':
            dodjiAmount = 2500;
            break;
          default:
            dodjiAmount = 0;
        }
        
        // Mettre à jour le solde
        await updateDoc(doc(db, this.COLLECTION, userId), {
          [this.FIELD]: increment(dodjiAmount)
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
  async rewardTokens(userId: string, amount: number, rewardId: string): Promise<void> {
    try {
      // Vérifier si la récompense a déjà été attribuée
      const hasReceived = await this.hasReceivedReward(userId, rewardId);
      if (hasReceived) {
        console.log('Récompense déjà attribuée');
        return;
      }
      
      // Mettre à jour le solde de Dodji
      const userRef = doc(db, this.COLLECTION, userId);
      await updateDoc(userRef, {
        [this.FIELD]: increment(amount)
      });

      // Marquer la récompense comme reçue
      const rewardsRef = doc(db, this.COLLECTION, userId, this.DODJI_COLLECTION, 'rewards');
      const rewardsDoc = await getDoc(rewardsRef);

      if (!rewardsDoc.exists()) {
        // Créer le document s'il n'existe pas
        await setDoc(rewardsRef, {
          rewards: { [rewardId]: true },
          lastUpdated: new Date()
        });
      } else {
        // Mettre à jour le document existant
        await updateDoc(rewardsRef, {
          [`rewards.${rewardId}`]: true,
          lastUpdated: new Date()
        });
      }

      console.log(`Récompense de ${amount} Dodji attribuée à l'utilisateur ${userId}`);
    } catch (error) {
      console.error('Erreur lors de l\'attribution de la récompense:', error);
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
  
  // Récompenser la réussite d'un quiz
  async rewardQuizCompletion(userId: string, quizId: string, dodjiAmount: number): Promise<void> {
    try {
      // Utiliser un identifiant unique pour cette récompense
      await this.rewardTokens(userId, dodjiAmount, `quiz_completion_${quizId}`);
      console.log(`Utilisateur ${userId} récompensé de ${dodjiAmount} Dodji pour le quiz ${quizId}`);
    } catch (error) {
      console.error('Erreur lors de la récompense pour le quiz:', error);
      throw error;
    }
  }
}

export const dodjiService = DodjiService.getInstance(); 