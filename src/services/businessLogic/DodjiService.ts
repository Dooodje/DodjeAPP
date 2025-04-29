import { db } from '@/config/firebase';
import { DodjiTransaction, UserDodji } from '@/types/dodji';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

export class DodjiService {
    private static readonly USERS_COLLECTION = 'users';

    static async getUserDodji(userId: string): Promise<UserDodji | null> {
        try {
            const docRef = doc(db, this.USERS_COLLECTION, userId, 'jeton_dodji', 'balance');
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return docSnap.data() as UserDodji;
        } catch (error) {
            console.error('Error getting user Dodji:', error);
            throw error;
        }
    }

    static async initializeUserDodji(userId: string): Promise<UserDodji> {
        try {
            const newUserDodji: UserDodji = {
                userId,
                total: 0,
                transactions: [],
                lastUpdated: new Date()
            };

            await setDoc(doc(db, this.USERS_COLLECTION, userId, 'jeton_dodji', 'balance'), newUserDodji);
            
            // Also update the main user document's dodji field
            await updateDoc(doc(db, this.USERS_COLLECTION, userId), {
                dodji: 0
            });
            
            return newUserDodji;
        } catch (error) {
            console.error('Error initializing user Dodji:', error);
            throw error;
        }
    }

    static async addTransaction(
        userId: string,
        transaction: Omit<DodjiTransaction, 'id' | 'userId'>
    ): Promise<void> {
        try {
            const userDodji = await this.getUserDodji(userId);
            if (!userDodji) {
                throw new Error('User Dodji account not found');
            }

            const newTotal = userDodji.total + transaction.amount;
            const transactionWithId: DodjiTransaction = {
                ...transaction,
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId
            };

            // Update balance document
            await updateDoc(doc(db, this.USERS_COLLECTION, userId, 'jeton_dodji', 'balance'), {
                total: newTotal,
                transactions: [...userDodji.transactions, transactionWithId],
                lastUpdated: new Date()
            });

            // Update main user document
            await updateDoc(doc(db, this.USERS_COLLECTION, userId), {
                dodji: newTotal
            });
        } catch (error) {
            console.error('Error adding Dodji transaction:', error);
            throw error;
        }
    }

    static async getTransactionsBySource(userId: string, source: DodjiTransaction['source'], sourceId?: string): Promise<DodjiTransaction[]> {
        try {
            const userDodji = await this.getUserDodji(userId);
            if (!userDodji) return [];

            return userDodji.transactions.filter(t => 
                t.source === source && (!sourceId || t.sourceId === sourceId)
            );
        } catch (error) {
            console.error('Error getting Dodji transactions:', error);
            throw error;
        }
    }

    static async hasReceivedReward(
        userId: string,
        source: DodjiTransaction['source'],
        sourceId: string
    ): Promise<boolean> {
        try {
            const userDodji = await this.getUserDodji(userId);
            if (!userDodji) {
                return false;
            }

            return userDodji.transactions.some(
                t => t.source === source && t.sourceId === sourceId
            );
        } catch (error) {
            console.error('Error checking reward status:', error);
            throw error;
        }
    }
} 