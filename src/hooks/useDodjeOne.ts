import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { dodjeOneService, DodjeOneSubscription } from '../services/dodjeOneService';
import { handleError } from '../utils/errorHandling';

export function useDodjeOne() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<DodjeOneSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userSubscription = await dodjeOneService.getSubscription(user!.uid);
      setSubscription(userSubscription);
    } catch (err) {
      const errorMessage = 'Erreur lors du chargement de l\'abonnement';
      setError(errorMessage);
      handleError(err, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = async (plan: 'monthly' | 'yearly') => {
    try {
      setError(null);
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      await dodjeOneService.subscribe(user.uid, plan);
      await loadSubscription();
    } catch (err) {
      const errorMessage = 'Erreur lors de la souscription';
      setError(errorMessage);
      handleError(err, errorMessage);
      throw err;
    }
  };

  const cancelSubscription = async () => {
    try {
      setError(null);
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      await dodjeOneService.cancelSubscription(user.uid);
      await loadSubscription();
    } catch (err) {
      const errorMessage = 'Erreur lors de l\'annulation de l\'abonnement';
      setError(errorMessage);
      handleError(err, errorMessage);
      throw err;
    }
  };

  const restorePurchases = async () => {
    try {
      setError(null);
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      await dodjeOneService.restorePurchases(user.uid);
      await loadSubscription();
    } catch (err) {
      const errorMessage = 'Erreur lors de la restauration des achats';
      setError(errorMessage);
      handleError(err, errorMessage);
      throw err;
    }
  };

  return {
    subscription,
    isLoading,
    error,
    subscribe,
    cancelSubscription,
    restorePurchases,
    refreshSubscription: loadSubscription,
  };
} 