import { db } from '@/config/firebase';
import { doc, getDoc, runTransaction, collection } from 'firebase/firestore';
import { DodjiTransaction } from '@/types/dodji';
import { DodjiService } from './DodjiService';

export class DodjiRewardService {
    private static readonly USERS_COLLECTION = 'users';
    private static readonly QUIZZES_COLLECTION = 'quizzes';

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
                const tokenReward = quizData.tokenReward || quizData.dodjiReward || 0;
                const quizName = quizData.name || 'Quiz sans nom';

                // 2. Vérifier si la récompense a déjà été attribuée
                const rewardId = `quiz_completion_${quizId}`;
                const hasReceived = await DodjiService.hasReceivedReward(userId, rewardId);
                
                if (hasReceived) {
                    console.log('Récompense déjà attribuée pour ce quiz');
                    return 0;
                }

                // 3. Créer et enregistrer la transaction
                const newTransaction: DodjiTransaction = {
                    userId,
                    amount: tokenReward,
                    source: 'quiz',
                    sourceId: quizId,
                    description: `Récompense pour le quiz : ${quizName}`,
                    createdAt: new Date()
                };

                const transactionRef = doc(collection(db, this.USERS_COLLECTION, userId, 'transactions'));
                transaction.set(transactionRef, newTransaction);

                // 4. Ajouter la récompense via DodjiService
                await DodjiService.addReward(userId, tokenReward, rewardId);

                // 5. Marquer la récompense comme réclamée dans le statut du quiz
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
            const rewardId = `quiz_completion_${quizId}`;
            return await DodjiService.hasReceivedReward(userId, rewardId);
        } catch (error) {
            console.error('Erreur lors de la vérification de la récompense:', error);
            throw error;
        }
    }
} 