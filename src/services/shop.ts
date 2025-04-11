import { collection, doc, getDoc, getDocs, query, where, addDoc, Timestamp, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { TokenPack, DodjeOneSubscription, Transaction } from '../types/shop';

export const shopService = {
  // Récupérer tous les packs de tokens
  async getTokenPacks(): Promise<TokenPack[]> {
    try {
      const packsQuery = query(collection(db, 'token_packs'));
      const querySnapshot = await getDocs(packsQuery);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          amount: data.baseTokens || 0,
          bonus: data.bonusPercentage || 0,
          price: data.price || 0,
          isPopular: false, // Valeur par défaut, à définir selon vos besoins
          isBestValue: false, // Valeur par défaut, à définir selon vos besoins
          totalTokens: data.totalTokens || data.baseTokens || 0,
          status: data.status || 'active',
          createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date()
        } as TokenPack;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des packs:', error);
      throw error;
    }
  },

  // Récupérer l'abonnement DodjeOne
  async getDodjeOneSubscription(): Promise<DodjeOneSubscription | null> {
    try {
      const subscriptionDoc = await getDoc(doc(db, 'subscriptions', 'dodjeone'));
      if (!subscriptionDoc.exists()) {
        return null;
      }
      return { id: subscriptionDoc.id, ...subscriptionDoc.data() } as DodjeOneSubscription;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error);
      throw error;
    }
  },

  // Récupérer l'historique des transactions d'un utilisateur
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const transactionsQuery = query(
        collection(db, 'users', userId, 'transactions'),
        where('timestamp', '>=', new Date(0))
      );
      const querySnapshot = await getDocs(transactionsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp).toDate()
      } as Transaction));
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      throw error;
    }
  },

  // Créer une nouvelle transaction
  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
    try {
      const transactionRef = await addDoc(collection(db, 'users', transaction.userId, 'transactions'), {
        ...transaction,
        timestamp: Timestamp.fromDate(transaction.timestamp)
      });
      return transactionRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de la transaction:', error);
      throw error;
    }
  },

  // Mettre à jour le solde de Dodji d'un utilisateur
  async updateDodjiBalance(userId: string, amount: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        dodjiBalance: increment(amount)
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du solde:', error);
      throw error;
    }
  },

  // Vérifier si un utilisateur a un abonnement DodjeOne actif
  async hasActiveDodjeOneSubscription(userId: string): Promise<boolean> {
    try {
      const subscriptionDoc = await getDoc(doc(db, 'users', userId, 'subscriptions', 'dodjeone'));
      if (!subscriptionDoc.exists()) {
        return false;
      }
      const subscription = subscriptionDoc.data();
      const expiryDate = (subscription.expiryDate as Timestamp).toDate();
      return expiryDate > new Date();
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'abonnement:', error);
      throw error;
    }
  }
}; 