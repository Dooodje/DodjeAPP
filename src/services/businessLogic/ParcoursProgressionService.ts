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

            // 1. Récupérer les informations du parcours complété directement avec son ID
            const parcoursRef = doc(db, this.PARCOURS_COLLECTION, completedParcoursId);
            const parcoursDoc = await getDoc(parcoursRef);

            if (!parcoursDoc.exists()) {
                console.error(`Parcours ${completedParcoursId} non trouvé dans la collection parcours`);
                return;
            }

            // 2. Récupérer les champs domaine, niveau et ordre
            const parcoursData = parcoursDoc.data();
            const domaine = parcoursData.theme || parcoursData.domaine;
            const { niveau, ordre } = parcoursData;

            if (!domaine || !niveau || ordre === undefined) {
                console.error('Données de parcours incomplètes:', parcoursData);
                return;
            }

            console.log('Parcours complété trouvé:', {
                id: completedParcoursId,
                domaine,
                niveau,
                ordre,
                rawData: parcoursData
            });

            // 3. Chercher le parcours suivant avec même domaine, même niveau et ordre + 1
            const parcoursCollectionRef = collection(db, this.PARCOURS_COLLECTION);
            const nextParcoursQuery = query(
                parcoursCollectionRef,
                where('theme', '==', domaine),
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
            // Ne pas propager l'erreur pour ne pas bloquer le processus de complétion
        }
    }
} 