import { db } from '@/config/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, where, orderBy } from 'firebase/firestore';
import { ParcoursStatus, UserParcours } from '@/types/parcours';
import { ParcoursProgressionService } from './ParcoursProgressionService';

export class ParcoursStatusService {
    private static readonly USERS_COLLECTION = 'users';
    private static readonly PARCOURS_SUBCOLLECTION = 'parcours';

    /**
     * Met à jour le statut d'un parcours pour un utilisateur
     */
    static async updateParcoursStatus(
        userId: string,
        parcoursId: string,
        domaine: string,
        status: ParcoursStatus
    ): Promise<void> {
        try {
            console.log('Début updateParcoursStatus:', {
                userId,
                parcoursId,
                domaine,
                status
            });

            const userParcoursRef = doc(
                db,
                this.USERS_COLLECTION,
                userId,
                'parcours',
                parcoursId
            );

            const now = new Date().toISOString();
            const userParcoursDoc = await getDoc(userParcoursRef);

            if (!userParcoursDoc.exists()) {
                // Création d'un nouveau document de parcours utilisateur
                await setDoc(userParcoursRef, {
                    parcoursId,
                    status,
                    domaine,
                    createdAt: now,
                    updatedAt: now,
                    completedAt: status === 'completed' ? now : null
                });
                console.log(`Nouveau document de parcours créé pour ${parcoursId}`);
            } else {
                // Mise à jour du document existant
                await setDoc(userParcoursRef, {
                    ...userParcoursDoc.data(),
                    status,
                    updatedAt: now,
                    completedAt: status === 'completed' ? now : userParcoursDoc.data().completedAt
                }, { merge: true });
                console.log(`Document de parcours existant mis à jour pour ${parcoursId}`);
            }

            console.log(`Mise à jour terminée avec succès pour le parcours ${parcoursId}`);

            // Si le parcours est marqué comme complété, débloquer le prochain parcours
            if (status === 'completed') {
                try {
                    console.log(`Le parcours ${parcoursId} est complété, appel de handleParcoursCompletion`);
                    await ParcoursProgressionService.handleParcoursCompletion(userId, parcoursId);
                } catch (progressError) {
                    console.error('Erreur non bloquante lors du déblocage du prochain parcours:', progressError);
                    // Ne pas propager l'erreur pour ne pas bloquer la mise à jour du statut
                }
            }
        } catch (error) {
            console.error('Error updating parcours status:', error);
            // Ne pas propager l'erreur pour permettre la continuation du processus
        }
    }

    /**
     * Récupère le statut d'un parcours pour un utilisateur
     */
    static async getParcoursStatus(
        userId: string,
        parcoursId: string
    ): Promise<UserParcours | null> {
        try {
            const parcoursRef = doc(
                db,
                this.USERS_COLLECTION,
                userId,
                this.PARCOURS_SUBCOLLECTION,
                parcoursId
            );

            const parcoursDoc = await getDoc(parcoursRef);
            
            if (!parcoursDoc.exists()) {
                return null;
            }

            return parcoursDoc.data() as UserParcours;
        } catch (error) {
            console.error('Error getting parcours status:', error);
            throw new Error('Failed to get parcours status');
        }
    }

    /**
     * Gets all parcours statuses for a user in a specific theme
     */
    static async getUserParcoursInTheme(
        userId: string,
        themeId: string
    ): Promise<UserParcours[]> {
        try {
            const parcoursQuery = query(
                collection(db, this.USERS_COLLECTION, userId, 'parcours'),
                where('themeId', '==', themeId)
            );

            const parcoursSnapshot = await getDocs(parcoursQuery);
            return parcoursSnapshot.docs.map(doc => doc.data() as UserParcours);
        } catch (error) {
            console.error('Error getting user parcours in theme:', error);
            throw new Error('Failed to get user parcours in theme');
        }
    }

    /**
     * Progress to next parcours in theme
     */
    static async progressToNextParcours(
        userId: string,
        themeId: string,
        currentParcoursId: string
    ): Promise<void> {
        try {
            // Get all user parcours in this theme
            const userParcours = await this.getUserParcoursInTheme(userId, themeId);
            
            // Sort by ordre
            userParcours.sort((a, b) => {
                const orderA = parseInt(a.parcoursId.split('_')[1] || '0');
                const orderB = parseInt(b.parcoursId.split('_')[1] || '0');
                return orderA - orderB;
            });

            // Find current parcours index
            const currentIndex = userParcours.findIndex(p => p.parcoursId === currentParcoursId);
            
            if (currentIndex === -1) {
                throw new Error('Current parcours not found');
            }

            // If there's a next parcours, unblock it
            if (currentIndex < userParcours.length - 1) {
                const nextParcours = userParcours[currentIndex + 1];
                await this.updateParcoursStatus(
                    userId,
                    nextParcours.parcoursId,
                    themeId,
                    'unblocked'
                );
            }
        } catch (error) {
            console.error('Error progressing to next parcours:', error);
            throw new Error('Failed to progress to next parcours');
        }
    }
} 