import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface ParcoursData {
  videoCount: number;
  titre: string;
  description: string;
  // autres champs si nécessaire
}

export function useParcours(parcoursId: string | undefined) {
  const [parcoursData, setParcoursData] = useState<ParcoursData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchParcours() {
      if (!parcoursId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const parcoursRef = doc(db, 'parcours', parcoursId);
        const parcoursDoc = await getDoc(parcoursRef);

        if (!parcoursDoc.exists()) {
          setError('Parcours non trouvé');
          setParcoursData(null);
        } else {
          const data = parcoursDoc.data() as ParcoursData;
          setParcoursData(data);
          setError(null);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du parcours:', err);
        setError('Erreur lors de la récupération du parcours');
        setParcoursData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchParcours();
  }, [parcoursId]);

  return { parcoursData, loading, error };
} 