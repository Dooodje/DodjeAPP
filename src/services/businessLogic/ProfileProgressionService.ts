import { db } from '@/config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { profileService } from '../profile';
import { Progress } from '@/types/profile';

export class ProfileProgressionService {
    private static readonly PARCOURS_COLLECTION = 'parcours';
    private static readonly USERS_COLLECTION = 'users';
    
    /**
     * Calcule et met à jour la progression des parcours pour un utilisateur
     * @param userId ID de l'utilisateur
     */
    static async calculateAndUpdateUserProgress(userId: string): Promise<Progress> {
        try {
            // 1. Récupérer tous les parcours disponibles par domaine
            const bourseParcoursQuery = query(
                collection(db, this.PARCOURS_COLLECTION),
                where('domaine', '==', 'Bourse')
            );
            const cryptoParcoursQuery = query(
                collection(db, this.PARCOURS_COLLECTION),
                where('domaine', '==', 'Crypto')
            );
            
            // Si certains parcours utilisent 'theme' au lieu de 'domaine'
            const bourseThemeQuery = query(
                collection(db, this.PARCOURS_COLLECTION),
                where('theme', '==', 'Bourse')
            );
            const cryptoThemeQuery = query(
                collection(db, this.PARCOURS_COLLECTION),
                where('theme', '==', 'Crypto')
            );
            
            // Récupérer tous les parcours
            const [
                bourseParcoursSnapshot, 
                cryptoParcoursSnapshot, 
                bourseThemeSnapshot, 
                cryptoThemeSnapshot
            ] = await Promise.all([
                getDocs(bourseParcoursQuery),
                getDocs(cryptoParcoursQuery),
                getDocs(bourseThemeQuery),
                getDocs(cryptoThemeQuery)
            ]);
            
            // Combiner les résultats (en évitant les doublons par ID)
            const bourseParcoursMap = new Map();
            const cryptoParcoursMap = new Map();
            
            // Ajouter les parcours avec 'domaine'
            bourseParcoursSnapshot.docs.forEach(doc => bourseParcoursMap.set(doc.id, doc.data()));
            cryptoParcoursSnapshot.docs.forEach(doc => cryptoParcoursMap.set(doc.id, doc.data()));
            
            // Ajouter les parcours avec 'theme' s'ils n'existent pas déjà
            bourseThemeSnapshot.docs.forEach(doc => {
                if (!bourseParcoursMap.has(doc.id)) {
                    bourseParcoursMap.set(doc.id, doc.data());
                }
            });
            cryptoThemeSnapshot.docs.forEach(doc => {
                if (!cryptoParcoursMap.has(doc.id)) {
                    cryptoParcoursMap.set(doc.id, doc.data());
                }
            });
            
            // Compter le total des parcours par domaine
            const totalBourseParcours = bourseParcoursMap.size;
            const totalCryptoParcours = cryptoParcoursMap.size;
            
            // 2. Récupérer les parcours complétés par l'utilisateur
            const userParcoursQuery = query(
                collection(db, this.USERS_COLLECTION, userId, 'parcours'),
                where('status', '==', 'completed')
            );
            
            const userParcoursSnapshot = await getDocs(userParcoursQuery);
            
            // Compter les parcours complétés par domaine
            let completedBourseParcours = 0;
            let completedCryptoParcours = 0;
            
            userParcoursSnapshot.docs.forEach(doc => {
                const parcoursData = doc.data();
                const domaine = parcoursData.domaine;
                
                if (domaine === 'Bourse') {
                    completedBourseParcours++;
                } else if (domaine === 'Crypto') {
                    completedCryptoParcours++;
                }
            });
            
            // 3. Calculer les pourcentages
            const boursePercentage = totalBourseParcours > 0 
                ? Math.round((completedBourseParcours / totalBourseParcours) * 100) 
                : 0;
                
            const cryptoPercentage = totalCryptoParcours > 0 
                ? Math.round((completedCryptoParcours / totalCryptoParcours) * 100) 
                : 0;
            
            // 4. Mettre à jour le profil de l'utilisateur
            const progress: Progress = {
                bourse: {
                    percentage: boursePercentage,
                    completedCourses: completedBourseParcours,
                    totalCourses: totalBourseParcours
                },
                crypto: {
                    percentage: cryptoPercentage,
                    completedCourses: completedCryptoParcours,
                    totalCourses: totalCryptoParcours
                }
            };
            
            // Mettre à jour le profil avec les nouvelles données de progression
            await profileService.updateProfileProgress(userId, progress);
            
            console.log('Progression mise à jour avec succès:', {
                userId,
                progress,
                stats: {
                    bourse: `${completedBourseParcours}/${totalBourseParcours} (${boursePercentage}%)`,
                    crypto: `${completedCryptoParcours}/${totalCryptoParcours} (${cryptoPercentage}%)`
                }
            });
            
            return progress;
            
        } catch (error) {
            console.error('Erreur lors du calcul de la progression:', error);
            throw error;
        }
    }
} 