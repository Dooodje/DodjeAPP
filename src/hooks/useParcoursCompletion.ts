import { useState, useCallback } from 'react';
import { ParcoursCompletionService } from '../services/businessLogic/ParcoursCompletionService';
import { useAuth } from './useAuth';

export const useParcoursCompletion = (parcoursId: string, quizId: string) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleQuizCompletion = useCallback(async () => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            setError(null);
            await ParcoursCompletionService.handleQuizCompletion(user.uid, parcoursId, quizId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user?.uid, parcoursId, quizId]);

    const checkQuizCompletion = useCallback(async (): Promise<boolean> => {
        if (!user?.uid) return false;

        try {
            setLoading(true);
            setError(null);
            return await ParcoursCompletionService.isQuizCompleted(user.uid, quizId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [user?.uid, quizId]);

    return {
        handleQuizCompletion,
        checkQuizCompletion,
        loading,
        error
    };
}; 