import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ParcoursStatusService } from '@/services/businessLogic/ParcoursStatusService';
import { ParcoursStatus, UserParcours } from '@/types/parcours';

export const useParcoursStatus = (parcoursId: string, themeId: string) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [parcoursStatus, setParcoursStatus] = useState<UserParcours | null>(null);

    const loadParcoursStatus = useCallback(async () => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            setError(null);
            const status = await ParcoursStatusService.getParcoursStatus(user.uid, parcoursId);
            setParcoursStatus(status);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load parcours status');
            console.error('Error loading parcours status:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.uid, parcoursId]);

    const updateStatus = useCallback(async (newStatus: ParcoursStatus) => {
        if (!user?.uid) {
            setError('User not authenticated');
            return;
        }

        try {
            setError(null);
            await ParcoursStatusService.updateParcoursStatus(user.uid, parcoursId, themeId, newStatus);
            await loadParcoursStatus(); // Reload the status after update
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update parcours status');
            console.error('Error updating parcours status:', err);
        }
    }, [user?.uid, parcoursId, themeId, loadParcoursStatus]);

    const progressToNext = useCallback(async () => {
        if (!user?.uid) {
            setError('User not authenticated');
            return;
        }

        try {
            setError(null);
            await ParcoursStatusService.progressToNextParcours(user.uid, themeId, parcoursId);
            await loadParcoursStatus(); // Reload the status after progressing
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to progress to next parcours');
            console.error('Error progressing to next parcours:', err);
        }
    }, [user?.uid, themeId, parcoursId, loadParcoursStatus]);

    useEffect(() => {
        loadParcoursStatus();
    }, [loadParcoursStatus]);

    return {
        parcoursStatus,
        loading,
        error,
        updateStatus,
        progressToNext,
        reload: loadParcoursStatus,
    };
}; 