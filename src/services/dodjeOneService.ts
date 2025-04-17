import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Platform } from 'react-native';
import * as InAppPurchases from 'react-native-iap';

export interface DodjeOneSubscription {
  id: string;
  userId: string;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  autoRenewal: boolean;
  platform: 'ios' | 'android';
  receipt?: string;
}

export const dodjeOneService = {
  async initialize() {
    try {
      await InAppPurchases.initConnection();
      // TODO: Configurer les produits avec les IDs de l'App Store et Google Play
      const products = [
        {
          id: Platform.select({
            ios: 'com.dodje.one.monthly',
            android: 'com.dodje.one.monthly',
          }),
          type: 'subscription',
        },
        {
          id: Platform.select({
            ios: 'com.dodje.one.yearly',
            android: 'com.dodje.one.yearly',
          }),
          type: 'subscription',
        },
      ];
      await InAppPurchases.getProducts(products);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des achats:', error);
      throw error;
    }
  },

  async getSubscription(userId: string): Promise<DodjeOneSubscription | null> {
    try {
      const subscriptionRef = doc(db, 'users', userId, 'subscriptions', 'dodjeone');
      const subscriptionDoc = await getDoc(subscriptionRef);

      if (subscriptionDoc.exists()) {
        const data = subscriptionDoc.data();
        return {
          ...data,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
        } as DodjeOneSubscription;
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error);
      throw error;
    }
  },

  async subscribe(userId: string, plan: 'monthly' | 'yearly'): Promise<void> {
    try {
      const productId = Platform.select({
        ios: plan === 'monthly' ? 'com.dodje.one.monthly' : 'com.dodje.one.yearly',
        android: plan === 'monthly' ? 'com.dodje.one.monthly' : 'com.dodje.one.yearly',
      });

      // Déclencher l'achat in-app
      const purchase = await InAppPurchases.requestSubscription({
        sku: productId,
      });

      // Vérifier la transaction
      const receipt = await this.validateReceipt(purchase);

      // Mettre à jour Firestore
      const subscriptionRef = doc(db, 'users', userId, 'subscriptions', 'dodjeone');
      const now = Timestamp.now();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (plan === 'monthly' ? 1 : 12));

      await setDoc(subscriptionRef, {
        userId,
        plan,
        status: 'active',
        startDate: now,
        endDate: Timestamp.fromDate(endDate),
        autoRenewal: true,
        platform: Platform.OS,
        receipt,
      });
    } catch (error) {
      console.error('Erreur lors de la souscription:', error);
      throw error;
    }
  },

  async cancelSubscription(userId: string): Promise<void> {
    try {
      const subscriptionRef = doc(db, 'users', userId, 'subscriptions', 'dodjeone');
      await updateDoc(subscriptionRef, {
        status: 'cancelled',
        autoRenewal: false,
      });

      // Annuler l'abonnement sur la plateforme
      await InAppPurchases.endConnection();
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
      throw error;
    }
  },

  async validateReceipt(purchase: any): Promise<string> {
    try {
      // TODO: Implémenter la validation du reçu avec le backend
      // Cette fonction devrait envoyer le reçu à votre serveur pour validation
      // et retourner un token de validation
      return 'validated_receipt_token';
    } catch (error) {
      console.error('Erreur lors de la validation du reçu:', error);
      throw error;
    }
  },

  async restorePurchases(userId: string): Promise<void> {
    try {
      // Restaurer les achats précédents
      const purchases = await InAppPurchases.getAvailablePurchases();

      for (const purchase of purchases) {
        // Vérifier si l'achat est valide
        const receipt = await this.validateReceipt(purchase);

        // Mettre à jour Firestore
        const subscriptionRef = doc(db, 'users', userId, 'subscriptions', 'dodjeone');
        const now = Timestamp.now();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + (purchase.productId.includes('monthly') ? 1 : 12));

        await setDoc(subscriptionRef, {
          userId,
          plan: purchase.productId.includes('monthly') ? 'monthly' : 'yearly',
          status: 'active',
          startDate: now,
          endDate: Timestamp.fromDate(endDate),
          autoRenewal: true,
          platform: Platform.OS,
          receipt,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la restauration des achats:', error);
      throw error;
    }
  },
}; 