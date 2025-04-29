import { db } from '@/config/firebase';
import { doc, getDoc, setDoc, runTransaction, collection, addDoc } from 'firebase/firestore';
import { DodjiTransaction, UserDodji } from '@/types/dodji';

export class DodjiRewardService {
    private static readonly USERS_COLLECTION = 'users';
    private static readonly QUIZZES_COLLECTION = 'quizzes';
    private static readonly DODJI_COLLECTION = 'jeton_dodji';

    /**
     * Attribue la récompense Dodji à l'utilisateur et enregistre la transaction
     */
    static async claimQuizReward(userId: string, quizId: string): Promise<number> {
        try {
            return await runTransaction(db, async (transaction) => {
                // 1. Récupérer le montant de la récompense du quiz
                const quizRef = doc(db, this.QUIZZES_COLLECTION, quizId);
                const quizDoc = await transaction.get(quizRef);
                
                if (!quizDoc.exists()) {
                    throw new Error('Quiz non trouvé');
                }

                const quizData = quizDoc.data();
                const tokenReward = quizData.tokenReward || 0;
                const quizName = quizData.name || 'Quiz sans nom';

                // 2. Récupérer le document Dodji actuel de l'utilisateur
                const userDodjiRef = doc(db, this.USERS_COLLECTION, userId, this.DODJI_COLLECTION, 'current');
                const userDodjiDoc = await transaction.get(userDodjiRef);

                const currentDodji: UserDodji = userDodjiDoc.exists() 
                    ? userDodjiDoc.data() as UserDodji
                    : {
                        userId,
                        total: 0,
                        lastUpdated: new Date(),
                        transactions: []
                    };

                // 3. Créer la nouvelle transaction
                const newTransaction: DodjiTransaction = {
                    userId,
                    amount: tokenReward,
                    source: 'quiz',
                    sourceId: quizId,
                    description: `Récompense pour le quiz : ${quizName}`,
                    createdAt: new Date()
                };

                // 4. Mettre à jour le document Dodji
                const updatedDodji: UserDodji = {
                    userId,
                    total: currentDodji.total + tokenReward,
                    lastUpdated: new Date(),
                    transactions: [...currentDodji.transactions, newTransaction]
                };

                // 5. Sauvegarder les mises à jour
                transaction.set(userDodjiRef, updatedDodji);

                // 6. Marquer la récompense comme réclamée dans le statut du quiz
                const userQuizRef = doc(
                    db,
                    this.USERS_COLLECTION,
                    userId,
                    'quiz',
                    quizId
                );

                transaction.update(userQuizRef, {
                    'lastResults.rewardClaimed': true,
                    updatedAt: new Date()
                });

                return tokenReward;
            });
        } catch (error) {
            console.error('Erreur lors de l\'attribution de la récompense Dodji:', error);
            throw error;
        }
    }

    /**
     * Vérifie si la récompense a déjà été réclamée
     */
    static async isRewardClaimed(userId: string, quizId: string): Promise<boolean> {
        try {
            const userQuizRef = doc(
                db,
                this.USERS_COLLECTION,
                userId,
                'quiz',
                quizId
            );

            const userQuizDoc = await getDoc(userQuizRef);
            return userQuizDoc.exists() && userQuizDoc.data()?.lastResults?.rewardClaimed === true;
        } catch (error) {
            console.error('Erreur lors de la vérification de la récompense:', error);
            throw error;
        }
    }

    /**
     * Récupère l'historique des transactions Dodji d'un utilisateur
     */
    static async getDodjiHistory(userId: string): Promise<UserDodji | null> {
        try {
            const userDodjiRef = doc(db, this.USERS_COLLECTION, userId, this.DODJI_COLLECTION, 'current');
            const userDodjiDoc = await getDoc(userDodjiRef);

            if (!userDodjiDoc.exists()) {
                return null;
            }

            return userDodjiDoc.data() as UserDodji;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'historique Dodji:', error);
            throw error;
        }
    }
} 