import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { QuizStatusService } from '@/services/businessLogic/QuizStatusService';
import { UserQuiz, QuizResult } from '@/types/quiz';

interface UseQuizStatusProps {
    quizId: string;
    parcoursId: string;
}

export const useQuizStatus = ({ quizId, parcoursId }: UseQuizStatusProps) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quizStatus, setQuizStatus] = useState<UserQuiz | null>(null);

    // Charger le statut initial du quiz
    useEffect(() => {
        const loadQuizStatus = async () => {
            if (!user?.uid || !quizId) return;

            try {
                setLoading(true);
                setError(null);
                const status = await QuizStatusService.getQuizStatus(user.uid, quizId);
                setQuizStatus(status);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadQuizStatus();
    }, [user?.uid, quizId]);

    // Mettre à jour le statut du quiz
    const updateStatus = useCallback(async (status: 'blocked' | 'unblocked' | 'completed') => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            setError(null);
            await QuizStatusService.updateQuizStatus({
                userId: user.uid,
                quizId,
                parcoursId,
                status
            });

            // Recharger le statut
            const updatedStatus = await QuizStatusService.getQuizStatus(user.uid, quizId);
            setQuizStatus(updatedStatus);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user?.uid, quizId, parcoursId]);

    // Ajouter une tentative au quiz
    const addAttempt = useCallback(async (result: QuizResult) => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            setError(null);
            await QuizStatusService.addQuizAttempt(user.uid, quizId, result);

            // Recharger le statut
            const updatedStatus = await QuizStatusService.getQuizStatus(user.uid, quizId);
            setQuizStatus(updatedStatus);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user?.uid, quizId]);

    return {
        quizStatus,
        loading,
        error,
        updateStatus,
        addAttempt
    };
}; 