import { db } from '../../config/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { QuizStatus, UserQuiz, QuizProgress, QuizAttempt, QuizStatusUpdate, QuizResult } from '../../types/quiz';
import { Timestamp } from 'firebase/firestore';

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
            const now = new Date().toISOString();
            const quizRef = doc(db, this.USERS_COLLECTION, userId, this.USER_QUIZZES_SUBCOLLECTION, quizId);
            
            // Récupérer le document existant ou créer un nouveau
            const quizDoc = await getDoc(quizRef);
            const currentData = quizDoc.exists() ? quizDoc.data() as UserQuiz : null;
            
            // Créer la nouvelle tentative
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

            // Calculer les nouvelles statistiques
            const attempts = currentData?.attempts || [];
            const updatedAttempts = [...attempts, newAttempt];
            
            const averageScore = updatedAttempts.reduce((sum, att) => sum + att.score, 0) / updatedAttempts.length;
            const bestScore = Math.max(result.score, currentData?.progress?.bestScore || 0);
            const totalTimeSpent = (currentData?.progress?.totalTimeSpent || 0) + result.timeSpent;
            const successRate = (updatedAttempts.filter(att => att.score >= this.COMPLETION_THRESHOLD).length / updatedAttempts.length) * 100;

            // Créer ou mettre à jour le document en conservant le statut actuel
            const updatedQuizData: UserQuiz = {
                quizId,
                parcoursId: currentData?.parcoursId || '',
                status: currentData?.status || 'unblocked', // Conserver le statut actuel
                progress: {
                    score: result.score,
                    attempts: updatedAttempts.length,
                    bestScore,
                    lastAttemptAt: now,
                    averageScore,
                    totalTimeSpent,
                    successRate
                },
                attempts: updatedAttempts,
                createdAt: currentData?.createdAt || now,
                updatedAt: now,
                ordre: currentData?.ordre || 0,
                lastResults: {
                    score: result.score,
                    completedAt: now,
                    details: result.answers,
                    timeSpent: result.timeSpent
                }
            };

            console.log('Enregistrement des données du quiz:', updatedQuizData);
            await setDoc(quizRef, updatedQuizData);
            console.log('Données du quiz enregistrées avec succès');

        } catch (error) {
            console.error('Erreur lors de l\'ajout des résultats du quiz:', error);
            throw error;
        }
    }

    /**
     * Vérifie et débloque les quiz d'un parcours si toutes les vidéos sont complétées
     */
    static async checkAndUnlockQuizzes(userId: string, parcoursId: string, videoId: string): Promise<void> {
        try {
            console.log(`Checking quizzes for parcours ${parcoursId}, triggered by video ${videoId}`);

            // 1. Récupérer le parcours
            const parcoursRef = doc(db, 'parcours', parcoursId);
            const parcoursDoc = await getDoc(parcoursRef);
            
            if (!parcoursDoc.exists()) {
                console.warn(`Parcours ${parcoursId} not found`);
                return;
            }

            const parcoursData = parcoursDoc.data();
            console.log('Parcours data:', parcoursData);

            // Si videoIds n'existe pas, récupérer toutes les vidéos du parcours
            let videoIds = parcoursData.videoIds;
            if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
                console.log('No videoIds found in parcours, fetching videos from videos collection...');
                const videosQuery = query(
                    collection(db, 'videos'),
                    where('parcoursId', '==', parcoursId)
                );
                const videosSnapshot = await getDocs(videosQuery);
                videoIds = videosSnapshot.docs.map(doc => doc.id);
                console.log('Found videos:', videoIds);

                // Mettre à jour le document du parcours avec les videoIds
                await setDoc(parcoursRef, { videoIds }, { merge: true });
            }

            const quizId = parcoursData.quizId;
            console.log(`Found parcours with ${videoIds.length} videos and quiz ID: ${quizId}`);

            if (!quizId) {
                console.warn(`No quiz found for parcours ${parcoursId}`);
                return;
            }

            // 2. Vérifier si toutes les vidéos sont complétées
            const allCompleted = await this.checkAllVideosCompleted(userId, videoIds);
            console.log(`All videos completed check for parcours ${parcoursId}: ${allCompleted}`);

            if (allCompleted) {
                console.log(`All videos completed for parcours ${parcoursId}, unlocking quiz ${quizId}`);
                
                // 3. Débloquer le quiz
                const quizRef = doc(db, this.USERS_COLLECTION, userId, 'quiz', quizId);
                
                // Vérifier d'abord l'état actuel du quiz
                const currentQuizDoc = await getDoc(quizRef);
                const currentQuizData = currentQuizDoc.exists() ? currentQuizDoc.data() : null;
                console.log('Current quiz status:', currentQuizData);

                const updatedQuizData = {
                    quizId,
                    parcoursId,
                    status: 'unblocked',
                    createdAt: currentQuizData?.createdAt || Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    attempts: currentQuizData?.attempts || 0,
                    ordre: currentQuizData?.ordre || 0,
                    progress: {
                        attempts: currentQuizData?.progress?.attempts || 0,
                        averageScore: currentQuizData?.progress?.averageScore || 0,
                        bestScore: currentQuizData?.progress?.bestScore || 0,
                        lastAttemptAt: currentQuizData?.progress?.lastAttemptAt || null,
                        score: currentQuizData?.progress?.score || 0,
                        successRate: currentQuizData?.progress?.successRate || 0,
                        totalTimeSpent: currentQuizData?.progress?.totalTimeSpent || 0
                    }
                };

                await setDoc(quizRef, updatedQuizData);
                console.log('Quiz data updated:', updatedQuizData);

                // Vérifier que le quiz a bien été débloqué
                const updatedQuizDoc = await getDoc(quizRef);
                console.log('Updated quiz status:', updatedQuizDoc.data());
            } else {
                console.log(`Not all videos are completed for parcours ${parcoursId}, quiz remains blocked`);
            }
        } catch (error) {
            console.error('Error checking and unlocking quizzes:', error);
            throw error;
        }
    }

    /**
     * Vérifie si toutes les vidéos d'une liste sont complétées
     */
    private static async checkAllVideosCompleted(userId: string, videoIds: string[]): Promise<boolean> {
        try {
            if (!videoIds.length) {
                console.warn('No videos to check for completion');
                return false;
            }

            console.log(`Checking completion for videos: ${JSON.stringify(videoIds)}`);

            const videoStatuses = await Promise.all(
                videoIds.map(async videoId => {
                    const videoRef = doc(db, this.USERS_COLLECTION, userId, 'video', videoId);
                    return getDoc(videoRef);
                })
            );

            // Vérifier que toutes les vidéos existent et sont complétées
            const statusChecks = videoStatuses.map(status => {
                if (!status.exists()) {
                    console.log(`Video document ${status.id} does not exist`);
                    return false;
                }

                const data = status.data();
                console.log(`Video ${status.id} data:`, JSON.stringify(data, null, 2));

                // Vérifier tous les champs possibles pour le statut de complétion
                const checks = {
                    byStatus: data.status === 'completed',
                    byCompletionStatus: data.completionStatus === 'completed',
                    byProgress: (data.progress || 0) >= 90,
                    byCurrentTime: data.currentTime && data.duration && 
                                 (data.currentTime / data.duration) >= 0.9
                };

                console.log(`Video ${status.id} completion checks:`, checks);

                // Une vidéo est considérée comme complétée si l'un des critères est vrai
                return Object.values(checks).some(check => check === true);
            });

            const allCompleted = statusChecks.every(isCompleted => isCompleted);
            console.log('Individual video completion results:', statusChecks);
            console.log(`Final completion check result: ${allCompleted}`);

            return allCompleted;
        } catch (error) {
            console.error('Error checking video completion status:', error);
            return false;
        }
    }
} 