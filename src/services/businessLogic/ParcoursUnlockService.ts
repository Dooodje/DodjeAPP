import { db } from '../../config/firebase';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { ParcoursStatusService } from './ParcoursStatusService';

type ParcoursLevel = 'Débutant' | 'Avancé' | 'Expert';

export class ParcoursUnlockService {
    private static readonly PARCOURS_COLLECTION = 'parcours';
    private static readonly USERS_COLLECTION = 'users';

    // Prix en Dodji par niveau
    private static readonly UNLOCK_PRICES: Record<ParcoursLevel, number> = {
        'Débutant': 100,
        'Avancé': 200,
        'Expert': 300
    };

    /**
     * Vérifie si l'utilisateur a assez de Dodji pour débloquer un parcours
     */
    static async canUnlockParcours(userId: string, parcoursId: string): Promise<{
        canUnlock: boolean;
        currentDodji: number;
        requiredDodji: number;
        insufficientFunds?: boolean;
    }> {
        try {
            // Récupérer le montant de Dodji de l'utilisateur
            const userRef = doc(db, this.USERS_COLLECTION, userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                throw new Error('Utilisateur non trouvé');
            }

            const currentDodji = userDoc.data().dodji || 0;

            // Récupérer le niveau du parcours
            const parcoursRef = doc(db, this.PARCOURS_COLLECTION, parcoursId);
            const parcoursDoc = await getDoc(parcoursRef);

            if (!parcoursDoc.exists()) {
                throw new Error('Parcours non trouvé');
            }

            const parcoursData = parcoursDoc.data();
            const parcoursLevel = parcoursData.niveau as ParcoursLevel;
            const requiredDodji = this.UNLOCK_PRICES[parcoursLevel] || 0;

            return {
                canUnlock: currentDodji >= requiredDodji,
                currentDodji,
                requiredDodji,
                insufficientFunds: currentDodji < requiredDodji
            };
        } catch (error) {
            console.error('Erreur lors de la vérification des Dodji:', error);
            throw error;
        }
    }

    /**
     * Débloque un parcours en utilisant des Dodji
     */
    static async unlockParcoursWithDodji(userId: string, parcoursId: string): Promise<{
        success: boolean;
        newDodjiBalance?: number;
        error?: string;
    }> {
        try {
            // Utiliser une transaction pour garantir l'atomicité de l'opération
            return await runTransaction(db, async (transaction) => {
                // Récupérer les informations du parcours
                const parcoursRef = doc(db, this.PARCOURS_COLLECTION, parcoursId);
                const parcoursDoc = await transaction.get(parcoursRef);

                if (!parcoursDoc.exists()) {
                    return {
                        success: false,
                        error: "Parcours non trouvé"
                    };
                }

                const parcoursData = parcoursDoc.data();
                const themeId = parcoursData.themeId || parcoursData.theme;

                // Vérifier si l'utilisateur peut débloquer le parcours
                const { canUnlock, currentDodji, requiredDodji, insufficientFunds } = 
                    await this.canUnlockParcours(userId, parcoursId);

                if (!canUnlock) {
                    return {
                        success: false,
                        error: insufficientFunds ? 
                            "Vous n'avez pas assez de Dodji, il faut accomplir d'autres missions ou passer à la caisse" :
                            "Impossible de débloquer ce parcours"
                    };
                }

                // Mettre à jour le solde de Dodji
                const userRef = doc(db, this.USERS_COLLECTION, userId);
                const newBalance = currentDodji - requiredDodji;
                
                transaction.update(userRef, {
                    dodji: newBalance
                });

                // Mettre à jour le statut du parcours
                await ParcoursStatusService.updateParcoursStatus(
                    userId,
                    parcoursId,
                    themeId,
                    'unblocked'
                );

                return {
                    success: true,
                    newDodjiBalance: newBalance
                };
            });
        } catch (error) {
            console.error('Erreur lors du déblocage du parcours:', error);
            return {
                success: false,
                error: "Une erreur est survenue lors du déblocage du parcours"
            };
        }
    }

    /**
     * Récupère le coût en Dodji pour débloquer un parcours
     */
    static async getUnlockCost(parcoursId: string): Promise<number> {
        try {
            const parcoursRef = doc(db, this.PARCOURS_COLLECTION, parcoursId);
            const parcoursDoc = await getDoc(parcoursRef);

            if (!parcoursDoc.exists()) {
                throw new Error('Parcours non trouvé');
            }

            const parcoursData = parcoursDoc.data();
            console.log('Données du parcours pour le coût:', parcoursData);
            
            // Utiliser directement le champ niveau
            const parcoursLevel = parcoursData.niveau as ParcoursLevel;

            if (!parcoursLevel || !this.UNLOCK_PRICES[parcoursLevel]) {
                console.error('Niveau du parcours invalide:', parcoursData);
                return 0;
            }

            const cost = this.UNLOCK_PRICES[parcoursLevel];
            console.log(`Coût du parcours ${parcoursId} (niveau ${parcoursLevel}):`, cost);
            
            return cost;
        } catch (error) {
            console.error('Erreur lors de la récupération du coût:', error);
            throw error;
        }
    }
} 