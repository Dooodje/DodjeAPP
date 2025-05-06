import { db } from '@/config/firebase';
import { doc, getDoc, updateDoc, increment, setDoc, collection } from 'firebase/firestore';

interface DodjiDocument {
    rewards: Record<string, boolean>;
    lastUpdated: Date;
}

interface DodjiTransaction {
    amount: number;
    source: string;
    sourceId: string;
    description: string;
    createdAt: Date;
}

export class DodjiService {
    private static readonly USERS_COLLECTION = 'users';
    private static readonly DODJI_COLLECTION = 'jeton_dodji';

    static async getUserDodji(userId: string): Promise<number> {
        try {
            const docRef = doc(db, this.USERS_COLLECTION, userId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return 0;
            }

            return docSnap.data()?.dodji || 0;
        } catch (error) {
            console.error('Error getting user Dodji:', error);
            throw error;
        }
    }

    static async initializeUserDodji(userId: string): Promise<void> {
        try {
            // Initialiser le document principal de l'utilisateur
            await updateDoc(doc(db, this.USERS_COLLECTION, userId), {
                dodji: 0
            });

            // Initialiser le document de récompenses
            await setDoc(doc(db, this.USERS_COLLECTION, userId, this.DODJI_COLLECTION, 'rewards'), {
                rewards: {},
                lastUpdated: new Date()
            });
        } catch (error) {
            console.error('Error initializing user Dodji:', error);
            throw error;
        }
    }

    static async hasReceivedReward(userId: string, rewardId: string): Promise<boolean> {
        try {
            const rewardsRef = doc(db, this.USERS_COLLECTION, userId, this.DODJI_COLLECTION, 'rewards');
            const rewardsDoc = await getDoc(rewardsRef);

            if (!rewardsDoc.exists()) {
                return false;
            }

            const data = rewardsDoc.data() as DodjiDocument;
            return data.rewards[rewardId] === true;
        } catch (error) {
            console.error('Error checking reward status:', error);
            throw error;
        }
    }

    static async addReward(userId: string, amount: number, rewardId: string): Promise<void> {
        try {
            // Vérifier si la récompense a déjà été attribuée
            const hasReceived = await this.hasReceivedReward(userId, rewardId);
            if (hasReceived) {
                console.log('Reward already claimed');
                return;
            }

            // Mettre à jour le solde de Dodji
            const userRef = doc(db, this.USERS_COLLECTION, userId);
            await updateDoc(userRef, {
                dodji: increment(amount)
            });

            // Marquer la récompense comme reçue
            const rewardsRef = doc(db, this.USERS_COLLECTION, userId, this.DODJI_COLLECTION, 'rewards');
            const rewardsDoc = await getDoc(rewardsRef);

            if (!rewardsDoc.exists()) {
                // Créer le document s'il n'existe pas
                await setDoc(rewardsRef, {
                    rewards: { [rewardId]: true },
                    lastUpdated: new Date()
                });
            } else {
                // Mettre à jour le document existant
                await updateDoc(rewardsRef, {
                    [`rewards.${rewardId}`]: true,
                    lastUpdated: new Date()
                });
            }

            console.log(`Successfully awarded ${amount} Dodji to user ${userId} for reward ${rewardId}`);
        } catch (error) {
            console.error('Error adding reward:', error);
            throw error;
        }
    }

    static async addTransaction(userId: string, transaction: DodjiTransaction): Promise<void> {
        try {
            // 1. Add the transaction to the user's transactions collection
            const transactionRef = doc(collection(db, this.USERS_COLLECTION, userId, 'transactions'));
            await setDoc(transactionRef, transaction);

            // 2. Update user's Dodji balance
            const userRef = doc(db, this.USERS_COLLECTION, userId);
            await updateDoc(userRef, {
                dodji: increment(transaction.amount)
            });

            // 3. Add reward record
            const rewardId = `${transaction.source}_${transaction.sourceId}`;
            await this.addReward(userId, transaction.amount, rewardId);

            console.log(`Successfully added transaction of ${transaction.amount} Dodji for user ${userId}`);
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }
    }
} 