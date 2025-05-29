import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { DodjiRewardService } from '../services/businessLogic/DodjiRewardService';

interface UseQuizRewardReturn {
    claimReward: () => Promise<number>;
    checkIfClaimed: () => Promise<boolean>;
    loading: boolean;
    error: string | null;
}

export const useQuizReward = (quizId: string | undefined): UseQuizRewardReturn => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const claimReward = useCallback(async () => {
        if (!user?.uid) {
            throw new Error('Utilisateur non connecté');
        }

        if (!quizId) {
            throw new Error('ID du quiz manquant');
        }

        try {
            setLoading(true);
            setError(null);

            // Vérifier si la récompense n'a pas déjà été réclamée
            const isClaimed = await DodjiRewardService.isRewardClaimed(user.uid, quizId);
            if (isClaimed) {
                throw new Error('La récompense a déjà été réclamée');
            }

            // Réclamer la récompense
            const rewardAmount = await DodjiRewardService.claimQuizReward(user.uid, quizId);
            return rewardAmount;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user?.uid, quizId]);

    const checkIfClaimed = useCallback(async () => {
        if (!user?.uid || !quizId) {
            return false;
        }

        try {
            setError(null);
            return await DodjiRewardService.isRewardClaimed(user.uid, quizId);
        } catch (err) {
            console.error('Error checking reward status:', err);
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            return false;
        }
    }, [user?.uid, quizId]);

    return {
        claimReward,
        checkIfClaimed,
        loading,
        error
    };
}; 