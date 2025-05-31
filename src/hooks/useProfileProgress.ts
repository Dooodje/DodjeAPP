import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Progress } from '../types/profile';

interface UseProfileProgressReturn {
  progress: Progress | null;
  isLoading: boolean;
  error: string | null;
  refreshProgress: () => void;
}

/**
 * Hook personnalisé pour surveiller la progression du profil utilisateur en temps réel
 * Utilise des listeners Firestore pour des mises à jour automatiques
 */
export const useProfileProgress = (userId: string): UseProfileProgressReturn => {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour calculer la progression à partir des parcours
  const calculateProgressFromParcours = useCallback(async (userId: string): Promise<Progress> => {
    try {
      // Récupérer les parcours complétés de l'utilisateur
      const userParcoursRef = collection(db, 'users', userId, 'parcours');
      const completedParcoursQuery = query(
        userParcoursRef,
        where('status', '==', 'completed')
      );
      
      const completedSnapshot = await getDocs(completedParcoursQuery);
      
      // Compter les parcours complétés par domaine
      let completedBourseParcours = 0;
      let completedCryptoParcours = 0;

      completedSnapshot.docs.forEach(doc => {
        const parcoursData = doc.data();
        const domaine = parcoursData.domaine || parcoursData.theme;
        
        if (domaine === 'Bourse') {
          completedBourseParcours++;
        } else if (domaine === 'Crypto') {
          completedCryptoParcours++;
        }
      });

      // Récupérer le total des parcours disponibles
      const bourseParcoursQuery = query(
        collection(db, 'parcours'),
        where('domaine', '==', 'Bourse')
      );
      const cryptoParcoursQuery = query(
        collection(db, 'parcours'),
        where('domaine', '==', 'Crypto')
      );

      const [bourseSnapshot, cryptoSnapshot] = await Promise.all([
        getDocs(bourseParcoursQuery),
        getDocs(cryptoParcoursQuery)
      ]);

      const totalBourseParcours = bourseSnapshot.size;
      const totalCryptoParcours = cryptoSnapshot.size;

      // Calculer les pourcentages
      const boursePercentage = totalBourseParcours > 0 
        ? Math.round((completedBourseParcours / totalBourseParcours) * 100) 
        : 0;
        
      const cryptoPercentage = totalCryptoParcours > 0 
        ? Math.round((completedCryptoParcours / totalCryptoParcours) * 100) 
        : 0;

      return {
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

    } catch (error) {
      console.error('Erreur lors du calcul de la progression:', error);
      throw error;
    }
  }, []);

  // Fonction pour rafraîchir manuellement la progression
  const refreshProgress = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const calculatedProgress = await calculateProgressFromParcours(userId);
      setProgress(calculatedProgress);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      setError('Erreur lors du rafraîchissement de la progression');
    } finally {
      setIsLoading(false);
    }
  }, [userId, calculateProgressFromParcours]);

  // Effet principal pour surveiller la progression
  useEffect(() => {
    if (!userId) {
      setProgress(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Écouter les changements du profil utilisateur
    const userProfileRef = doc(db, 'users', userId);
    
    const unsubscribeProfile = onSnapshot(
      userProfileRef,
      async (profileSnapshot) => {
        try {
          if (profileSnapshot.exists()) {
            const profileData = profileSnapshot.data();
            
            // Si la progression existe dans le profil, l'utiliser
            if (profileData.progress) {
              setProgress(profileData.progress);
              setIsLoading(false);
            } else {
              // Sinon, calculer la progression
              try {
                const calculatedProgress = await calculateProgressFromParcours(userId);
                setProgress(calculatedProgress);
                setIsLoading(false);
              } catch (calcError) {
                console.error('Erreur lors du calcul de la progression:', calcError);
                setError('Erreur lors du calcul de la progression');
                setIsLoading(false);
              }
            }
          } else {
            setProgress(null);
            setError('Profil utilisateur non trouvé');
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Erreur lors de la surveillance du profil:', error);
          setError('Erreur lors de la surveillance du profil');
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Erreur du listener Firestore:', error);
        setError('Erreur de connexion en temps réel');
        setIsLoading(false);
      }
    );

    // Écouter les changements dans les parcours de l'utilisateur
    const userParcoursRef = collection(db, 'users', userId, 'parcours');
    
    const unsubscribeParcours = onSnapshot(
      userParcoursRef,
      async () => {
        // Quand les parcours changent, recalculer la progression
        try {
          const calculatedProgress = await calculateProgressFromParcours(userId);
          setProgress(calculatedProgress);
        } catch (error) {
          console.error('Erreur lors du recalcul de la progression:', error);
        }
      },
      (error) => {
        console.error('Erreur du listener parcours:', error);
      }
    );

    // Nettoyer les listeners au démontage
    return () => {
      unsubscribeProfile();
      unsubscribeParcours();
    };
  }, [userId, calculateProgressFromParcours]);

  return {
    progress,
    isLoading,
    error,
    refreshProgress
  };
}; 