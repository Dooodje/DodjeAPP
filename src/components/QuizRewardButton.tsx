import React, { useEffect, useState } from 'react';
import { useQuizReward } from '../hooks/useQuizReward';

interface QuizRewardButtonProps {
    quizId: string;
    onRewardClaimed?: (amount: number) => void;
}

export const QuizRewardButton: React.FC<QuizRewardButtonProps> = ({
    quizId,
    onRewardClaimed
}) => {
    const { claimReward, checkIfClaimed, loading, error } = useQuizReward(quizId);
    const [isClaimed, setIsClaimed] = useState(false);

    useEffect(() => {
        // Vérifier si la récompense a déjà été réclamée au chargement
        checkIfClaimed().then(setIsClaimed);
    }, [checkIfClaimed]);

    const handleClaim = async () => {
        try {
            const amount = await claimReward();
            setIsClaimed(true);
            onRewardClaimed?.(amount);
        } catch (error) {
            // L'erreur est déjà gérée par le hook
        }
    };

    if (isClaimed) {
        return (
            <button
                disabled
                className="bg-gray-400 text-white px-4 py-2 rounded-lg opacity-50 cursor-not-allowed"
            >
                Récompense déjà réclamée
            </button>
        );
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={handleClaim}
                disabled={loading}
                className={`
                    bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg
                    flex items-center gap-2 transition-colors
                    ${loading ? 'opacity-50 cursor-wait' : ''}
                `}
            >
                {loading ? (
                    <>
                        <span className="animate-spin">⌛</span>
                        Réclamation en cours...
                    </>
                ) : (
                    <>
                        <span>🎁</span>
                        Récupérer ma récompense
                    </>
                )}
            </button>
            
            {error && (
                <p className="text-red-500 text-sm">
                    {error}
                </p>
            )}
        </div>
    );
}; 