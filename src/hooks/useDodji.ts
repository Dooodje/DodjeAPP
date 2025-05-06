import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useDodji = (userId: string | undefined) => {
  const [dodji, setDodji] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setDodji(0);
      setLoading(false);
      return;
    }

    // Écouter les changements en temps réel du document utilisateur
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (doc) => {
        if (doc.exists()) {
          setDodji(doc.data()?.dodji || 0);
        } else {
          setDodji(0);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Erreur lors de la récupération des jetons:', error);
        setError('Erreur lors de la récupération des jetons');
        setLoading(false);
      }
    );

    // Nettoyer l'abonnement lors du démontage
    return () => unsubscribe();
  }, [userId]);

  return { dodji, loading, error };
}; 