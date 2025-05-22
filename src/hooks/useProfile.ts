import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { profileService } from '../services/profile';
import {
  setProfile,
  updateProfile,
  setLoading,
  setError,
  selectBadge,
  selectQuest,
  resetProfile
} from '../store/slices/profileSlice';
import { UserProfile, Badge, Quest } from '../types/profile';
import { ProfileProgressionService } from '../services/businessLogic/ProfileProgressionService';

export const useProfile = (userId: string) => {
  const dispatch = useDispatch();
  const {
    profile,
    isLoading,
    error,
    selectedBadge,
    selectedQuest
  } = useSelector((state: RootState) => state.profile);

  // Charger le profil
  const loadProfile = useCallback(async () => {
    // Ne pas charger le profil si userId est vide
    if (!userId) {
      console.log('loadProfile: userId est vide, opération annulée');
      return;
    }

    try {
      dispatch(setLoading(true));
      const userProfile = await profileService.getUserProfile(userId);
      if (userProfile) {
        dispatch(setProfile(userProfile));
      } else {
        dispatch(setError('Profil non trouvé'));
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      dispatch(setError('Erreur lors du chargement du profil'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, userId]);

  // Mettre à jour le profil
  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userId) {
      console.log('updateUserProfile: userId est vide, opération annulée');
      return;
    }

    try {
      dispatch(setLoading(true));
      await profileService.updateProfile(userId, updates);
      dispatch(updateProfile(updates));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      dispatch(setError('Erreur lors de la mise à jour du profil'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, userId]);

  // Mettre à jour le streak
  const updateStreak = useCallback(async () => {
    if (!userId) {
      console.log('updateStreak: userId est vide, opération annulée');
      return;
    }

    try {
      dispatch(setLoading(true));
      await profileService.updateStreak(userId);
      const updatedProfile = await profileService.getUserProfile(userId);
      if (updatedProfile) {
        dispatch(setProfile(updatedProfile));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du streak:', error);
      dispatch(setError('Erreur lors de la mise à jour du streak'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, userId]);

  // Mettre à jour la progression
  const updateProgress = useCallback(async (category: 'bourse' | 'crypto', progress: number) => {
    if (!userId) {
      console.log('updateProgress: userId est vide, opération annulée');
      return;
    }

    try {
      dispatch(setLoading(true));
      await profileService.updateProgress(userId, category, progress);
      const updatedProfile = await profileService.getUserProfile(userId);
      if (updatedProfile) {
        dispatch(setProfile(updatedProfile));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
      dispatch(setError('Erreur lors de la mise à jour de la progression'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, userId]);

  // Ajouter un badge
  const addBadge = useCallback(async (badge: Badge) => {
    if (!userId) {
      console.log('addBadge: userId est vide, opération annulée');
      return;
    }

    try {
      dispatch(setLoading(true));
      await profileService.addBadge(userId, badge);
      const updatedProfile = await profileService.getUserProfile(userId);
      if (updatedProfile) {
        dispatch(setProfile(updatedProfile));
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du badge:', error);
      dispatch(setError('Erreur lors de l\'ajout du badge'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, userId]);

  // Mettre à jour une quête
  const updateUserQuest = useCallback(async (questId: string, updates: Partial<Quest>) => {
    if (!userId) {
      console.log('updateUserQuest: userId est vide, opération annulée');
      return;
    }

    try {
      dispatch(setLoading(true));
      await profileService.updateQuest(userId, questId, updates);
      const updatedProfile = await profileService.getUserProfile(userId);
      if (updatedProfile) {
        dispatch(setProfile(updatedProfile));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quête:', error);
      dispatch(setError('Erreur lors de la mise à jour de la quête'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, userId]);

  // Sélectionner un badge
  const selectUserBadge = useCallback((badge: Badge | null) => {
    dispatch(selectBadge(badge));
  }, [dispatch]);

  // Sélectionner une quête
  const selectUserQuest = useCallback((quest: Quest | null) => {
    dispatch(selectQuest(quest));
  }, [dispatch]);

  // Calculer et mettre à jour la progression complète des parcours
  const calculateAndUpdateProgress = useCallback(async () => {
    if (!userId) {
      console.log('calculateAndUpdateProgress: userId est vide, opération annulée');
      return;
    }

    try {
      dispatch(setLoading(true));
      const progress = await ProfileProgressionService.calculateAndUpdateUserProgress(userId);
      
      // Rafraîchir le profil pour obtenir les données mises à jour
      const updatedProfile = await profileService.getUserProfile(userId);
      if (updatedProfile) {
        dispatch(setProfile(updatedProfile));
      }
      
      return progress;
    } catch (error) {
      console.error('Erreur lors du calcul et de la mise à jour de la progression:', error);
      dispatch(setError('Erreur lors du calcul de la progression'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, userId]);

  // Réinitialiser le profil
  const reset = useCallback(() => {
    dispatch(resetProfile());
  }, [dispatch]);

  // Charger le profil au montage si userId est défini
  useEffect(() => {
    if (userId) {
      loadProfile();
    } else {
      // Réinitialiser l'état du profil si userId est vide
      console.log('useEffect: userId est vide, profil réinitialisé');
      dispatch(resetProfile());
    }
  }, [loadProfile, userId, dispatch]);

  return {
    profile,
    isLoading,
    error,
    selectedBadge,
    selectedQuest,
    updateUserProfile,
    updateStreak,
    updateProgress,
    addBadge,
    updateUserQuest,
    selectUserBadge,
    selectUserQuest,
    calculateAndUpdateProgress,
    reset
  };
}; 