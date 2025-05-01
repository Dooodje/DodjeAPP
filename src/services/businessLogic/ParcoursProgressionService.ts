import { db } from '@/config/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { ParcoursStatusService } from './ParcoursStatusService';
import { ParcoursStatus } from '@/types/parcours';

export class ParcoursProgressionService {
    private static readonly PARCOURS_COLLECTION = 'parcours';

    /**
     * Débloque le prochain parcours du même domaine/niveau lorsqu'un parcours est complété
     */
    static async handleParcoursCompletion(
        userId: string,
        completedParcoursId: string
    ): Promise<void> {
        try {
            console.log('Début handleParcoursCompletion:', {
                userId,
                completedParcoursId
            });

            // 1. Récupérer les informations du parcours complété dans la collection parcours
            const parcoursRef = collection(db, this.PARCOURS_COLLECTION);
            const parcoursQuery = query(
                parcoursRef,
                where('parcoursId', '==', completedParcoursId)
            );
            
            const parcoursSnapshot = await getDocs(parcoursQuery);

            if (parcoursSnapshot.empty) {
                console.error(`Parcours ${completedParcoursId} non trouvé dans la collection parcours`);
                return;
            }

            // 2. Récupérer les champs domaine, niveau et ordre
            const parcoursData = parcoursSnapshot.docs[0].data();
            const { domaine, niveau, ordre } = parcoursData;

            console.log('Parcours complété trouvé:', {
                id: completedParcoursId,
                domaine,
                niveau,
                ordre,
                rawData: parcoursData
            });

            // 3. Chercher le parcours suivant avec même domaine, même niveau et ordre + 1
            const nextParcoursQuery = query(
                parcoursRef,
                where('domaine', '==', domaine),
                where('niveau', '==', niveau),
                where('ordre', '==', ordre + 1)
            );

            console.log('Recherche du prochain parcours avec critères:', {
                domaine,
                niveau,
                'ordre + 1': ordre + 1
            });

            const nextParcoursSnapshot = await getDocs(nextParcoursQuery);
            console.log(`Nombre de parcours trouvés: ${nextParcoursSnapshot.size}`);

            if (!nextParcoursSnapshot.empty) {
                const nextParcours = nextParcoursSnapshot.docs[0];
                const nextParcoursId = nextParcours.id;
                const nextParcoursData = nextParcours.data();

                console.log('Prochain parcours trouvé:', {
                    id: nextParcoursId,
                    data: nextParcoursData
                });

                // 4. Mettre à jour le statut dans la sous-collection parcours de l'utilisateur
                await ParcoursStatusService.updateParcoursStatus(
                    userId,
                    nextParcoursId,
                    domaine,
                    'unblocked'
                );

                console.log(`Statut du parcours ${nextParcoursId} mis à jour à "unblocked" pour l'utilisateur ${userId}`);
            } else {
                console.log('Aucun parcours suivant trouvé avec les critères:', {
                    domaine,
                    niveau,
                    ordre: ordre + 1
                });
            }
        } catch (error) {
            console.error('Erreur lors du déblocage du prochain parcours:', error);
            throw error;
        }
    }
} 