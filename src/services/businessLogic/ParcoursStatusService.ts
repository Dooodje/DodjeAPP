import { db } from '@/config/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, where, orderBy } from 'firebase/firestore';
import { ParcoursStatus, UserParcours } from '@/types/parcours';

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
            const parcoursRef = doc(
                db,
                this.USERS_COLLECTION,
                userId,
                this.PARCOURS_SUBCOLLECTION,
                parcoursId
            );

            const now = new Date();
            const parcoursData: UserParcours = {
                userId,
                parcoursId,
                domaine,
                status,
                createdAt: now,
                updatedAt: now
            };

            await setDoc(parcoursRef, parcoursData, { merge: true });

            console.log(`Updated parcours ${parcoursId} status to ${status} for user ${userId}`);
        } catch (error) {
            console.error('Error updating parcours status:', error);
            throw new Error('Failed to update parcours status');
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