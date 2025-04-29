import { db } from '../../config/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { QuizStatus, UserQuiz, QuizProgress, QuizAttempt, QuizStatusUpdate, QuizResult } from '../../types/quiz';

export class QuizStatusService {
    private static readonly USERS_COLLECTION = 'users';
    private static readonly QUIZZES_COLLECTION = 'quizzes';
    private static readonly USER_QUIZZES_SUBCOLLECTION = 'quiz';
    private static readonly COMPLETION_THRESHOLD = 70; // Seuil de réussite pour compléter le quiz

    /**
     * Met à jour le statut d'un quiz pour un utilisateur
     */
    static async updateQuizStatus(update: QuizStatusUpdate): Promise<void> {
        try {
            const { userId, quizId, parcoursId, status, progress } = update;
            const quizRef = doc(
                db,
                this.USERS_COLLECTION,
                userId,
                this.USER_QUIZZES_SUBCOLLECTION,
                quizId
            );

            const now = new Date().toISOString();
            const quizDoc = await getDoc(quizRef);

            if (!quizDoc.exists()) {
                // Création d'un nouveau document de quiz utilisateur
                const newUserQuiz: UserQuiz = {
                    quizId,
                    parcoursId,
                    status,
                    progress: {
                        score: progress?.score || 0,
                        attempts: progress?.attempts || 0,
                        bestScore: progress?.bestScore || 0,
                        lastAttemptAt: now,
                        averageScore: 0,
                        totalTimeSpent: 0,
                        successRate: 0
                    },
                    attempts: [],
                    createdAt: now,
                    updatedAt: now,
                    ordre: await this.getQuizOrder(quizId)
                };

                await setDoc(quizRef, newUserQuiz);
            } else {
                // Mise à jour du statut existant
                const currentData = quizDoc.data() as UserQuiz;
                const updatedProgress: QuizProgress = {
                    ...currentData.progress,
                    ...progress,
                    lastAttemptAt: progress ? now : currentData.progress.lastAttemptAt
                };

                await setDoc(quizRef, {
                    ...currentData,
                    status,
                    progress: updatedProgress,
                    updatedAt: now
                }, { merge: true });
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut du quiz:', error);
            throw error;
        }
    }

    /**
     * Récupère le statut d'un quiz pour un utilisateur
     */
    static async getQuizStatus(userId: string, quizId: string): Promise<UserQuiz | null> {
        try {
            const quizRef = doc(
                db,
                this.USERS_COLLECTION,
                userId,
                this.USER_QUIZZES_SUBCOLLECTION,
                quizId
            );

            const quizDoc = await getDoc(quizRef);
            return quizDoc.exists() ? quizDoc.data() as UserQuiz : null;
        } catch (error) {
            console.error('Erreur lors de la récupération du statut du quiz:', error);
            throw error;
        }
    }

    /**
     * Récupère l'ordre d'un quiz dans son parcours
     */
    private static async getQuizOrder(quizId: string): Promise<number> {
        try {
            const quizRef = doc(db, this.QUIZZES_COLLECTION, quizId);
            const quizDoc = await getDoc(quizRef);

            if (!quizDoc.exists()) {
                throw new Error('Quiz non trouvé');
            }

            return quizDoc.data().ordre || 0;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'ordre du quiz:', error);
            return 0;
        }
    }

    /**
     * Initialise les statuts des quiz d'un parcours
     */
    static async initializeParcoursQuizzes(userId: string, parcoursId: string): Promise<void> {
        try {
            // Récupérer tous les quiz du parcours
            const quizzesQuery = query(
                collection(db, this.QUIZZES_COLLECTION),
                where('parcoursId', '==', parcoursId)
            );

            const quizzesSnapshot = await getDocs(quizzesQuery);
            const quizzes = quizzesSnapshot.docs;

            if (quizzes.length === 0) return;

            // Initialiser chaque quiz comme "blocked" par défaut
            for (const quiz of quizzes) {
                await this.updateQuizStatus({
                    userId,
                    quizId: quiz.id,
                    parcoursId,
                    status: 'blocked'
                });
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des quiz du parcours:', error);
            throw error;
        }
    }

    /**
     * Ajoute une nouvelle tentative au quiz avec les résultats détaillés
     */
    static async addQuizAttempt(
        userId: string,
        quizId: string,
        result: QuizResult
    ): Promise<void> {
        try {
            const quizStatus = await this.getQuizStatus(userId, quizId);
            if (!quizStatus) {
                throw new Error('Statut de quiz non trouvé');
            }

            const now = new Date().toISOString();
            
            // Créer la nouvelle tentative avec les résultats détaillés
            const newAttempt: QuizAttempt = {
                attemptedAt: now,
                score: result.score,
                completed: true,
                duration: result.timeSpent,
                details: {
                    totalQuestions: result.totalQuestions,
                    correctAnswers: result.correctAnswers,
                    answers: result.answers,
                    timeSpent: result.timeSpent
                }
            };

            // Ajouter la tentative à l'historique
            const updatedAttempts = [...quizStatus.attempts, newAttempt];

            // Mettre à jour les statistiques de progression
            const updatedProgress: QuizProgress = {
                score: result.score,
                attempts: quizStatus.progress.attempts + 1,
                bestScore: Math.max(result.score, quizStatus.progress.bestScore || 0),
                lastAttemptAt: now,
                averageScore: this.calculateAverageScore(updatedAttempts),
                totalTimeSpent: (quizStatus.progress.totalTimeSpent || 0) + result.timeSpent,
                successRate: this.calculateSuccessRate(updatedAttempts)
            };

            // Déterminer le nouveau statut en fonction du score
            const newStatus: QuizStatus = result.score >= this.COMPLETION_THRESHOLD 
                ? 'completed' 
                : 'unblocked';

            // Mettre à jour le document complet
            const updatedQuizStatus: UserQuiz = {
                ...quizStatus,
                status: newStatus,
                progress: updatedProgress,
                attempts: updatedAttempts,
                updatedAt: now,
                lastResults: {
                    score: result.score,
                    completedAt: now,
                    details: result.answers,
                    timeSpent: result.timeSpent
                }
            };

            await setDoc(
                doc(
                    db,
                    this.USERS_COLLECTION,
                    userId,
                    this.USER_QUIZZES_SUBCOLLECTION,
                    quizId
                ),
                updatedQuizStatus,
                { merge: true }
            );
        } catch (error) {
            console.error('Erreur lors de l\'ajout des résultats du quiz:', error);
            throw error;
        }
    }

    /**
     * Calcule la moyenne des scores pour toutes les tentatives
     */
    private static calculateAverageScore(attempts: QuizAttempt[]): number {
        if (attempts.length === 0) return 0;
        const sum = attempts.reduce((acc, attempt) => acc + attempt.score, 0);
        return Math.round((sum / attempts.length) * 100) / 100;
    }

    /**
     * Calcule le taux de réussite (pourcentage de tentatives avec un score > 50%)
     */
    private static calculateSuccessRate(attempts: QuizAttempt[]): number {
        if (attempts.length === 0) return 0;
        const successfulAttempts = attempts.filter(attempt => attempt.score >= 50).length;
        return Math.round((successfulAttempts / attempts.length) * 100);
    }

    /**
     * Vérifie et débloque les quiz associés à un parcours quand une vidéo est complétée
     */
    static async checkAndUnlockQuizzes(userId: string, parcoursId: string, videoId: string): Promise<void> {
        try {
            // Récupérer tous les quiz du parcours qui sont liés à cette vidéo
            const quizzesQuery = query(
                collection(db, this.QUIZZES_COLLECTION),
                where('parcoursId', '==', parcoursId),
                where('videoId', '==', videoId)
            );

            const quizzesSnapshot = await getDocs(quizzesQuery);
            const quizzes = quizzesSnapshot.docs;

            // Pour chaque quiz trouvé, le débloquer
            for (const quiz of quizzes) {
                await this.updateQuizStatus({
                    userId,
                    quizId: quiz.id,
                    parcoursId,
                    status: 'unblocked'
                });
            }
        } catch (error) {
            console.error('Erreur lors du déblocage des quiz après complétion de la vidéo:', error);
            throw error;
        }
    }
} 