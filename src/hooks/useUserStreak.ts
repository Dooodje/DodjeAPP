import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

// Cache global pour le streak
let globalStreakCache: {
  userId: string | null;
  streak: number;
  timestamp: number;
} = {
  userId: null,
  streak: 0,
  timestamp: 0
};

// Durée de validité du cache (5 minutes)
const CACHE_VALIDITY_MS = 5 * 60 * 1000;

export const useUserStreak = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<number>(() => {
    // Initialiser avec la valeur du cache si elle est valide
    if (user && globalStreakCache.userId === user.uid) {
      const now = Date.now();
      if ((now - globalStreakCache.timestamp) < CACHE_VALIDITY_MS) {
        console.log('🔥 useUserStreak: Initialisation avec cache valide:', globalStreakCache.streak);
        return globalStreakCache.streak;
      }
    }
    return 0;
  });

  // Fonction pour mettre à jour le cache global
  const updateCache = useCallback((userId: string, newStreak: number) => {
    globalStreakCache = {
      userId,
      streak: newStreak,
      timestamp: Date.now()
    };
  }, []);

  // Fonction pour rafraîchir manuellement le streak
  const refreshStreak = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      console.log('🔥 useUserStreak: Rafraîchissement manuel du streak');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const newStreak = userDoc.data().streak || 0;
        console.log('🔥 useUserStreak: Nouveau streak récupéré:', newStreak);
        setStreak(newStreak);
        updateCache(user.uid, newStreak);
      }
    } catch (error) {
      console.error('🔥 useUserStreak: Erreur lors du rafraîchissement:', error);
    }
  }, [user, updateCache]);

  useEffect(() => {
    if (!user) {
      setStreak(0);
      return;
    }

    console.log('🔥 useUserStreak: Configuration du listener pour:', user.uid);

    // Vérifier le cache d'abord
    if (globalStreakCache.userId === user.uid) {
      const now = Date.now();
      if ((now - globalStreakCache.timestamp) < CACHE_VALIDITY_MS) {
        console.log('🔥 useUserStreak: Utilisation du cache valide:', globalStreakCache.streak);
        setStreak(globalStreakCache.streak);
      }
    }

    // Utiliser onSnapshot pour écouter les changements en temps réel
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (doc) => {
        if (doc.exists()) {
          const newStreak = doc.data().streak || 0;
          console.log('🔥 useUserStreak: Mise à jour du streak en temps réel:', newStreak);
          setStreak(newStreak);
          updateCache(user.uid, newStreak);
        } else {
          console.log('🔥 useUserStreak: Document utilisateur non trouvé');
          setStreak(0);
          updateCache(user.uid, 0);
        }
      },
      (error) => {
        console.error('🔥 useUserStreak: Erreur du listener:', error);
        // En cas d'erreur, on garde la valeur actuelle
      }
    );

    // Nettoyer le listener quand le composant se démonte ou l'utilisateur change
    return () => {
      console.log('🔥 useUserStreak: Nettoyage du listener');
      unsubscribe();
    };
  }, [user, updateCache]);

  return { streak, refreshStreak };
}; 