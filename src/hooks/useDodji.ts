import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { DodjiService } from '@/services/businessLogic/DodjiService';
import { DodjiTransaction, UserDodji } from '@/types/dodji';

export const useDodji = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userDodji, setUserDodji] = useState<UserDodji | null>(null);

    const loadUserDodji = useCallback(async () => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            setError(null);
            const dodji = await DodjiService.getUserDodji(user.uid);
            setUserDodji(dodji);
        } catch (err) {
            setError('Failed to load Dodji data');
            console.error('Error loading Dodji:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.uid]);

    const addTransaction = useCallback(async (transaction: Omit<DodjiTransaction, 'id' | 'userId'>) => {
        if (!user?.uid) {
            setError('User not authenticated');
            return;
        }

        try {
            setError(null);
            await DodjiService.addTransaction(user.uid, transaction);
            await loadUserDodji(); // Reload user Dodji after transaction
        } catch (err) {
            setError('Failed to add transaction');
            console.error('Error adding transaction:', err);
        }
    }, [user?.uid, loadUserDodji]);

    const checkReward = useCallback(async (source: DodjiTransaction['source'], sourceId: string): Promise<boolean> => {
        if (!user?.uid) return false;

        try {
            return await DodjiService.hasReceivedReward(user.uid, source, sourceId);
        } catch (err) {
            console.error('Error checking reward:', err);
            return false;
        }
    }, [user?.uid]);

    useEffect(() => {
        loadUserDodji();
    }, [loadUserDodji]);

    return {
        userDodji,
        loading,
        error,
        addTransaction,
        checkReward,
        refresh: loadUserDodji
    };
}; 