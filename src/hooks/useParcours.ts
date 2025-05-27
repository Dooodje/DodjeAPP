import { useState, useEffect, useRef } from 'react';
import { VideoStatusService } from '@/services/businessLogic/VideoStatusService';

interface ParcoursData {
  videoCount: number;
  titre: string;
  description: string;
  // autres champs si nécessaire
}

/**
 * Hook temps réel pour observer les données d'un parcours
 * @param parcoursId - L'ID du parcours
 * @returns Les données du parcours, l'état de chargement et les erreurs
 */
export function useParcours(parcoursId: string | undefined) {
  const [parcoursData, setParcoursData] = useState<ParcoursData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!parcoursId) {
      console.log('❌ useParcours - Pas de parcoursId fourni');
      setLoading(false);
      setError(null);
      setParcoursData(null);
      return;
    }

    console.log(`🔄 useParcours - Configuration du listener pour parcoursId=${parcoursId}`);
    
    setLoading(true);
    setError(null);

    // Nettoyer le listener précédent s'il existe
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      // Configurer le listener temps réel
      const unsubscribe = VideoStatusService.observeParcours(
        parcoursId,
        (data) => {
          if (!data) {
            console.log(`❌ useParcours - Parcours ${parcoursId} non trouvé`);
            setError('Parcours non trouvé');
            setParcoursData(null);
          } else {
            console.log(`✅ useParcours - Données du parcours mises à jour:`, {
              parcoursId,
              videoCount: data.videoCount || 0,
              titre: data.titre || data.title
            });
            setParcoursData(data as ParcoursData);
            setError(null);
          }
          setLoading(false);
        }
      );

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      console.error('❌ useParcours - Erreur lors de la configuration du listener:', err);
      setError('Erreur lors de la récupération du parcours');
      setParcoursData(null);
      setLoading(false);
    }

    // Fonction de nettoyage
    return () => {
      if (unsubscribeRef.current) {
        console.log('🧹 useParcours - Nettoyage du listener');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [parcoursId]);

  // Nettoyer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        console.log('🧹 useParcours - Nettoyage final du listener');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  return { parcoursData, loading, error };
} 