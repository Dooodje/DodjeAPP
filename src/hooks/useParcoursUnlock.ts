import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { ParcoursUnlockService } from '../services/businessLogic/ParcoursUnlockService';

interface UnlockStatus {
    canUnlock: boolean;
    currentDodji: number;
    requiredDodji: number;
    insufficientFunds?: boolean;
}

export const useParcoursUnlock = (parcoursId: string) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [unlockStatus, setUnlockStatus] = useState<UnlockStatus | null>(null);

    // Vérifie si l'utilisateur peut débloquer le parcours
    const checkUnlockAbility = useCallback(async () => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            setError(null);
            const status = await ParcoursUnlockService.canUnlockParcours(user.uid, parcoursId);
            setUnlockStatus(status);
            return status;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            setUnlockStatus(null);
        } finally {
            setLoading(false);
        }
    }, [user?.uid, parcoursId]);

    // Débloque le parcours avec des Dodji
    const unlockWithDodji = useCallback(async () => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            setError(null);
            const result = await ParcoursUnlockService.unlockParcoursWithDodji(user.uid, parcoursId);
            
            if (!result.success) {
                setError(result.error || 'Erreur lors du déblocage du parcours');
                return false;
            }

            // Mettre à jour le statut local
            if (result.newDodjiBalance !== undefined) {
                setUnlockStatus(prev => prev ? {
                    ...prev,
                    currentDodji: result.newDodjiBalance!,
                    canUnlock: false
                } : null);
            }

            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [user?.uid, parcoursId]);

    // Récupère le coût en Dodji
    const getUnlockCost = useCallback(async () => {
        try {
            return await ParcoursUnlockService.getUnlockCost(parcoursId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            return 0;
        }
    }, [parcoursId]);

    return {
        checkUnlockAbility,
        unlockWithDodji,
        getUnlockCost,
        unlockStatus,
        loading,
        error
    };
}; 