import { db } from '@/config/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { ParcoursStatus } from '@/types/parcours';

export class ParcoursService {
    private static readonly COLLECTION_NAME = 'userParcours';
    private static readonly PARCOURS_COLLECTION = 'parcours';

    /**
     * Initialize parcours statuses for a new user
     * Sets the first parcours in each theme to 'unblocked' and others to 'blocked'
     */
    static async initializeUserParcours(userId: string): Promise<void> {
        try {
            // Get all themes
            const themesRef = collection(db, 'themes');
            const themesSnapshot = await getDocs(themesRef);

            // For each theme, get the first parcours and set it to unblocked
            const batch = [];
            for (const themeDoc of themesSnapshot.docs) {
                const parcoursRef = collection(db, 'themes', themeDoc.id, 'parcours');
                const parcoursQuery = query(parcoursRef, where('order', '==', 1));
                const parcoursSnapshot = await getDocs(parcoursQuery);

                if (!parcoursSnapshot.empty) {
                    const firstParcours = parcoursSnapshot.docs[0];
                    const userParcoursRef = doc(db, this.COLLECTION_NAME, `${userId}_${firstParcours.id}`);
                    
                    batch.push(setDoc(userParcoursRef, {
                        userId,
                        parcoursId: firstParcours.id,
                        themeId: themeDoc.id,
                        status: 'unblocked' as ParcoursStatus,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }));
                }
            }

            await Promise.all(batch);
        } catch (error) {
            console.error('Error initializing user parcours:', error);
            throw error;
        }
    }

    /**
     * Get the status of a parcours for a specific user
     */
    static async getParcoursStatus(userId: string, parcoursId: string): Promise<ParcoursStatus | null> {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, `${userId}_${parcoursId}`);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data().status;
            }

            return null;
        } catch (error) {
            console.error('Error getting parcours status:', error);
            throw error;
        }
    }

    /**
     * Update the status of a parcours for a user
     */
    static async updateParcoursStatus(userId: string, parcoursId: string, status: ParcoursStatus): Promise<void> {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, `${userId}_${parcoursId}`);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                await setDoc(docRef, {
                    ...docSnap.data(),
                    status,
                    updatedAt: new Date()
                }, { merge: true });
            } else {
                throw new Error(`No parcours status found for user ${userId} and parcours ${parcoursId}`);
            }
        } catch (error) {
            console.error('Error updating parcours status:', error);
            throw error;
        }
    }

    /**
     * Met à jour le nombre de vidéos d'un parcours
     */
    static async updateVideoCount(parcoursId: string): Promise<void> {
        try {
            const parcoursRef = doc(db, this.PARCOURS_COLLECTION, parcoursId);
            const parcoursDoc = await getDoc(parcoursRef);

            if (!parcoursDoc.exists()) {
                throw new Error('Parcours non trouvé');
            }

            const data = parcoursDoc.data();
            const videoIds = data.videoIds || [];
            
            await updateDoc(parcoursRef, {
                videoCount: videoIds.length
            });

            console.log(`Nombre de vidéos mis à jour pour le parcours ${parcoursId}: ${videoIds.length}`);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du nombre de vidéos:', error);
            throw error;
        }
    }
} 