import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { DodjiService } from '../services/businessLogic/DodjiService';

export const useUserDodji = () => {
  const { user } = useAuth();
  const [dodjiAmount, setDodjiAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Charger le montant initial
  useEffect(() => {
    const loadDodjiAmount = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const amount = await DodjiService.getUserDodji(user.uid);
        setDodjiAmount(amount);
      } catch (error) {
        console.error('Erreur lors du chargement des Dodjis:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDodjiAmount();
  }, [user?.uid]);

  // Fonction pour rafraîchir le montant
  const refreshDodjiAmount = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const amount = await DodjiService.getUserDodji(user.uid);
      setDodjiAmount(amount);
      return amount;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des Dodjis:', error);
      return dodjiAmount;
    }
  }, [user?.uid, dodjiAmount]);

  // Fonction pour mettre à jour le montant localement (pour les animations)
  const updateDodjiAmount = useCallback((newAmount: number) => {
    setDodjiAmount(newAmount);
  }, []);

  return {
    dodjiAmount,
    loading,
    refreshDodjiAmount,
    updateDodjiAmount,
  };
}; 