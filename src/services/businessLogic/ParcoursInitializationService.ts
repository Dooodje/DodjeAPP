import { ParcoursStatusService } from './ParcoursStatusService';
import { db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export class ParcoursInitializationService {
    private static readonly PARCOURS_COLLECTION = 'parcours';

    /**
     * Initialize parcours for a new user
     * This will set all parcours with ordre=1 to 'unblocked' and others to 'blocked'
     */
    static async initializeUserParcours(userId: string): Promise<void> {
        try {
            // Get all parcours
            const parcoursRef = collection(db, this.PARCOURS_COLLECTION);
            const parcoursSnapshot = await getDocs(parcoursRef);
            
            // Initialize each parcours
            const initPromises = parcoursSnapshot.docs.map(async (doc) => {
                const data = doc.data();
                const ordre = data.ordre || 0;
                
                await ParcoursStatusService.updateParcoursStatus(
                    userId,
                    doc.id,
                    data.domaine,
                    ordre === 1 ? 'unblocked' : 'blocked' // Only parcours with ordre=1 are unblocked
                );
            });

            // Wait for all parcours to be initialized
            await Promise.all(initPromises);

            console.log(`Initialized parcours for user ${userId}`);
        } catch (error) {
            console.error('Error initializing user parcours:', error);
            throw new Error('Failed to initialize user parcours');
        }
    }
} 