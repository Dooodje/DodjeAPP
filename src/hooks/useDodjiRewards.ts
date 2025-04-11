import { useCallback } from 'react';
import { dodjiService } from '../services/dodji';

export const useDodjiRewards = (userId: string) => {
  // Récompenser la première connexion
  const rewardFirstConnection = useCallback(async () => {
    try {
      await dodjiService.rewardFirstConnection(userId);
      return true;
    } catch (error) {
      console.error('Erreur lors de la récompense de première connexion:', error);
      return false;
    }
  }, [userId]);

  // Récompenser le premier cours
  const rewardFirstCourse = useCallback(async () => {
    try {
      await dodjiService.rewardFirstCourse(userId);
      return true;
    } catch (error) {
      console.error('Erreur lors de la récompense de premier cours:', error);
      return false;
    }
  }, [userId]);

  // Récompenser la complétion d'un cours
  const rewardCourseCompletion = useCallback(async (courseId: string) => {
    try {
      await dodjiService.rewardCourseCompletion(userId, courseId);
      return true;
    } catch (error) {
      console.error('Erreur lors de la récompense de complétion de cours:', error);
      return false;
    }
  }, [userId]);

  // Dépenser des jetons
  const spendTokens = useCallback(async (amount: number) => {
    try {
      return await dodjiService.spendTokens(userId, amount);
    } catch (error) {
      console.error('Erreur lors de la dépense de jetons:', error);
      return false;
    }
  }, [userId]);

  return {
    rewardFirstConnection,
    rewardFirstCourse,
    rewardCourseCompletion,
    spendTokens
  };
}; 