import { db } from '@/config/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { ParcoursStatusService } from './ParcoursStatusService';

export class ParcoursCompletionService {
    private static readonly PARCOURS_COLLECTION = 'parcours';
    private static readonly QUIZ_COLLECTION = 'quiz';

    /**
     * Met à jour le statut d'un parcours en fonction du statut du quiz
     * @param userId - ID de l'utilisateur
     * @param parcoursId - ID du parcours
     * @param quizId - ID du quiz
     */
    static async handleQuizCompletion(userId: string, parcoursId: string, quizId: string): Promise<void> {
        try {
            // Vérifier si le quiz est bien rattaché au parcours
            const parcoursRef = doc(db, this.PARCOURS_COLLECTION, parcoursId);
            const parcoursDoc = await getDoc(parcoursRef);

            if (!parcoursDoc.exists()) {
                throw new Error(`Le parcours ${parcoursId} n'existe pas`);
            }

            const parcoursData = parcoursDoc.data();
            if (parcoursData.quizId !== quizId) {
                throw new Error(`Le quiz ${quizId} n'est pas rattaché au parcours ${parcoursId}`);
            }

            const themeId = parcoursData.themeId || parcoursData.theme;

            // Récupérer le statut du quiz dans les données utilisateur
            const userQuizRef = doc(db, 'users', userId, 'quiz', quizId);
            const userQuizDoc = await getDoc(userQuizRef);

            if (!userQuizDoc.exists()) {
                console.log(`Pas de données de quiz trouvées pour l'utilisateur ${userId} et le quiz ${quizId}`);
                return;
            }

            const quizData = userQuizDoc.data();
            
            // Si le quiz est complété, mettre à jour le statut du parcours
            if (quizData.status === 'completed') {
                await ParcoursStatusService.updateParcoursStatus(
                    userId,
                    parcoursId,
                    themeId,
                    'completed'
                );

                console.log(`Parcours ${parcoursId} marqué comme complété pour l'utilisateur ${userId}`);

                // Débloquer le prochain parcours
                await this.unlockNextParcours(userId, parcoursId);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut du parcours:', error);
            throw error;
        }
    }

    /**
     * Vérifie si un quiz est complété
     * @param userId - ID de l'utilisateur
     * @param quizId - ID du quiz
     * @returns boolean indiquant si le quiz est complété
     */
    static async isQuizCompleted(userId: string, quizId: string): Promise<boolean> {
        try {
            const userQuizRef = doc(db, 'users', userId, 'quiz', quizId);
            const userQuizDoc = await getDoc(userQuizRef);

            if (!userQuizDoc.exists()) {
                return false;
            }

            return userQuizDoc.data().status === 'completed';
        } catch (error) {
            console.error('Erreur lors de la vérification du statut du quiz:', error);
            return false;
        }
    }

    /**
     * Débloque le prochain parcours dans la hiérarchie
     * @param userId - ID de l'utilisateur
     * @param currentParcoursId - ID du parcours qui vient d'être complété
     */
    private static async unlockNextParcours(userId: string, currentParcoursId: string): Promise<void> {
        try {
            // Récupérer les informations du parcours actuel
            const currentParcoursRef = doc(db, this.PARCOURS_COLLECTION, currentParcoursId);
            const currentParcoursDoc = await getDoc(currentParcoursRef);

            if (!currentParcoursDoc.exists()) {
                throw new Error(`Le parcours ${currentParcoursId} n'existe pas`);
            }

            const currentParcoursData = currentParcoursDoc.data();
            const themeId = currentParcoursData.themeId || currentParcoursData.theme;
            const currentOrder = currentParcoursData.order || currentParcoursData.ordre || 0;

            // Rechercher le prochain parcours dans le même thème
            const nextParcoursQuery = query(
                collection(db, this.PARCOURS_COLLECTION),
                where('themeId', '==', themeId),
                where('order', '>', currentOrder),
                orderBy('order'),
                limit(1)
            );

            const nextParcoursSnapshot = await getDocs(nextParcoursQuery);

            if (!nextParcoursSnapshot.empty) {
                const nextParcours = nextParcoursSnapshot.docs[0];
                
                // Mettre à jour le statut du prochain parcours
                await ParcoursStatusService.updateParcoursStatus(
                    userId,
                    nextParcours.id,
                    themeId,
                    'unblocked'
                );

                console.log(`Parcours suivant ${nextParcours.id} débloqué pour l'utilisateur ${userId}`);
            } else {
                console.log(`Aucun parcours suivant trouvé pour le thème ${themeId}`);
            }
        } catch (error) {
            console.error('Erreur lors du déblocage du parcours suivant:', error);
            throw error;
        }
    }
} 