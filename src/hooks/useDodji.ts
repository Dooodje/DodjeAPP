import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { usePreopeningContext } from '../contexts/PreopeningContext';

export const useDodji = (userId: string | undefined) => {
  const { isLoading: authLoading } = useAuth();
  const { isPreopeningComplete } = usePreopeningContext();
  const [dodji, setDodji] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // CONDITION PRINCIPALE: Attendre que le preopening soit complètement terminé
    if (!isPreopeningComplete) {
      console.log('⏳ useDodji: En attente de la fin du preopening avant de créer les listeners...');
      return;
    }

    // Attendre que l'authentification soit complètement terminée
    if (authLoading) {
      console.log('🔐 useDodji: Authentification en cours, attente...');
      return;
    }

    if (!userId) {
      console.log('👤 useDodji: Aucun utilisateur connecté');
      setDodji(0);
      setLoading(false);
      return;
    }

    console.log(`🔄 useDodji: Preopening terminé - Configuration du listener pour l'utilisateur ${userId}`);

    // Écouter les changements en temps réel du document utilisateur
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (doc) => {
        if (doc.exists()) {
          const newDodji = doc.data()?.dodji || 0;
          console.log(`✅ useDodji: Dodji mis à jour: ${newDodji}`);
          setDodji(newDodji);
        } else {
          console.log('⚠️ useDodji: Document utilisateur non trouvé');
          setDodji(0);
        }
        setLoading(false);
      },
      (error) => {
        console.error('❌ useDodji: Erreur lors de la récupération des jetons:', error);
        setError('Erreur lors de la récupération des jetons');
        setLoading(false);
      }
    );

    // Nettoyer l'abonnement lors du démontage
    return () => {
      console.log('🧹 useDodji: Nettoyage du listener');
      unsubscribe();
    };
  }, [userId, authLoading, isPreopeningComplete]);

  return { dodji, loading, error };
}; 