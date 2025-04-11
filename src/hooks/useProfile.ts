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
    try {
      dispatch(setLoading(true));
      const userProfile = await profileService.getUserProfile(userId);
      if (userProfile) {
        dispatch(setProfile(userProfile));
      } else {
        dispatch(setError('Profil non trouvé'));
      }
    } catch (error) {
      dispatch(setError('Erreur lors du chargement du profil'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, userId]);

  // Mettre à jour le profil
  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      dispatch(setLoading(true));
      await profileService.updateProfile(userId, updates);
      dispatch(updateProfile(updates));
    } catch (error) {
      dispatch(setError('Erreur lors de la mise à jour du profil'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, userId]);

  // Mettre à jour le streak
  const updateStreak = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      await profileService.updateStreak(userId);
      const updatedProfile = await profileService.getUserProfile(userId);
      if (updatedProfile) {
        dispatch(setProfile(updatedProfile));
      }
    } catch (error) {
      dispatch(setError('Erreur lors de la mise à jour du streak'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, userId]);

  // Mettre à jour la progression
  const updateProgress = useCallback(async (category: 'bourse' | 'crypto', progress: number) => {
    try {
      dispatch(setLoading(true));
      await profileService.updateProgress(userId, category, progress);
      const updatedProfile = await profileService.getUserProfile(userId);
      if (updatedProfile) {
        dispatch(setProfile(updatedProfile));
      }
    } catch (error) {
      dispatch(setError('Erreur lors de la mise à jour de la progression'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, userId]);

  // Ajouter un badge
  const addBadge = useCallback(async (badge: Badge) => {
    try {
      dispatch(setLoading(true));
      await profileService.addBadge(userId, badge);
      const updatedProfile = await profileService.getUserProfile(userId);
      if (updatedProfile) {
        dispatch(setProfile(updatedProfile));
      }
    } catch (error) {
      dispatch(setError('Erreur lors de l\'ajout du badge'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, userId]);

  // Mettre à jour une quête
  const updateUserQuest = useCallback(async (questId: string, updates: Partial<Quest>) => {
    try {
      dispatch(setLoading(true));
      await profileService.updateQuest(userId, questId, updates);
      const updatedProfile = await profileService.getUserProfile(userId);
      if (updatedProfile) {
        dispatch(setProfile(updatedProfile));
      }
    } catch (error) {
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

  // Réinitialiser le profil
  const reset = useCallback(() => {
    dispatch(resetProfile());
  }, [dispatch]);

  // Charger le profil au montage
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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
    reset
  };
}; 