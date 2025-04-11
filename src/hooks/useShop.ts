import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { shopService } from '../services/shop';
import { dodjiService } from '../services/dodji';
import { iapService } from '../services/iap';
import {
  setTokenPacks,
  setSubscription,
  setTransactions,
  addTransaction,
  setLoading,
  setError,
  selectPack,
  selectSubscription,
  setPurchasing,
  resetShop
} from '../store/slices/shopSlice';
import { TokenPack, DodjeOneSubscription, Transaction } from '../types/shop';

export const useShop = (userId: string) => {
  const dispatch = useDispatch();
  const {
    tokenPacks,
    subscription,
    transactions,
    isLoading,
    error,
    selectedPack,
    selectedSubscription,
    isPurchasing
  } = useSelector((state: RootState) => state.shop);

  // Charger les données de la boutique
  const loadShopData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const [packs, subscription, userTransactions] = await Promise.all([
        shopService.getTokenPacks(),
        shopService.getDodjeOneSubscription(),
        shopService.getUserTransactions(userId)
      ]);

      // Identifier le meilleur pack en termes de rapport qualité/prix
      if (packs.length > 0) {
        // Calculer la valeur (jetons par euro) pour chaque pack
        const packsWithValue = packs.map(pack => {
          const totalTokens = pack.totalTokens || pack.amount + (pack.bonus ? Math.round(pack.amount * (pack.bonus / 100)) : 0);
          const valueForMoney = totalTokens / pack.price; // Jetons par euro
          return { ...pack, valueForMoney };
        });

        // Trier par valeur et marquer le meilleur pack
        const sortedPacks = [...packsWithValue].sort((a, b) => b.valueForMoney - a.valueForMoney);
        
        // Marquer le pack avec la meilleure valeur
        if (sortedPacks.length > 0) {
          const enhancedPacks = sortedPacks.map((pack, index) => ({
            ...pack,
            isBestValue: index === 0, // Le premier pack a la meilleure valeur
            // Marquer comme populaire le pack au milieu de la gamme ou le deuxième meilleur si moins de 3 packs
            isPopular: sortedPacks.length >= 3 
              ? index === Math.floor(sortedPacks.length / 2) 
              : index === Math.min(1, sortedPacks.length - 1)
          }));
          
          dispatch(setTokenPacks(enhancedPacks));
        } else {
          dispatch(setTokenPacks(packs));
        }
      } else {
        dispatch(setTokenPacks(packs));
      }

      dispatch(setSubscription(subscription));
      dispatch(setTransactions(userTransactions));
    } catch (error) {
      dispatch(setError('Erreur lors du chargement des données'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, userId]);

  // Sélectionner un pack de tokens
  const selectTokenPack = useCallback((pack: TokenPack | null) => {
    dispatch(selectPack(pack));
  }, [dispatch]);

  // Sélectionner un abonnement
  const selectDodjeOneSubscription = useCallback((subscription: DodjeOneSubscription | null) => {
    dispatch(selectSubscription(subscription));
  }, [dispatch]);

  // Acheter un pack de tokens
  const purchaseTokenPack = useCallback(async (pack: TokenPack) => {
    try {
      dispatch(setPurchasing(true));

      // Acheter les jetons via le service Dodji
      await dodjiService.purchaseTokens(userId, pack.id);

      // Créer la transaction
      const transaction: Omit<Transaction, 'id'> = {
        userId,
        type: 'purchase',
        amount: pack.price,
        currency: 'EUR',
        status: 'completed',
        timestamp: new Date(),
        productId: pack.id,
        productType: 'token_pack',
        receipt: 'iap_receipt' // Le reçu sera validé par le service IAP
      };

      const transactionId = await shopService.createTransaction(transaction);
      dispatch(addTransaction({ ...transaction, id: transactionId }));
      dispatch(selectPack(null));
    } catch (error) {
      dispatch(setError('Erreur lors de l\'achat'));
    } finally {
      dispatch(setPurchasing(false));
    }
  }, [dispatch, userId]);

  // Acheter un abonnement DodjeOne
  const purchaseSubscription = useCallback(async (subscription: DodjeOneSubscription) => {
    try {
      dispatch(setPurchasing(true));

      // Effectuer l'achat via IAP
      const result = await iapService.purchaseProduct(subscription.id);
      
      if (result) {
        // L'achat a réussi
        const transaction: Omit<Transaction, 'id'> = {
          userId,
          type: 'purchase',
          amount: subscription.price,
          currency: 'EUR',
          status: 'completed',
          timestamp: new Date(),
          productId: subscription.id,
          productType: 'subscription',
          receipt: 'iap_receipt_validated' // Le reçu est validé par les listeners IAP
        };

        const transactionId = await shopService.createTransaction(transaction);
        // TODO: Mettre à jour le statut de l'abonnement dans Firebase

        dispatch(addTransaction({ ...transaction, id: transactionId }));
        dispatch(selectSubscription(null));
      } else {
        throw new Error('Échec de l\'achat');
      }
    } catch (error) {
      dispatch(setError('Erreur lors de l\'achat de l\'abonnement'));
    } finally {
      dispatch(setPurchasing(false));
    }
  }, [dispatch, userId]);

  // Réinitialiser la boutique
  const reset = useCallback(() => {
    dispatch(resetShop());
  }, [dispatch]);

  // Charger les données au montage
  useEffect(() => {
    loadShopData();
  }, [loadShopData]);

  return {
    tokenPacks,
    subscription,
    transactions,
    isLoading,
    error,
    selectedPack,
    selectedSubscription,
    isPurchasing,
    selectTokenPack,
    selectDodjeOneSubscription,
    purchaseTokenPack,
    purchaseSubscription,
    reset
  };
}; 