import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { StreakService } from '../services/StreakService';
import { StreakData, StreakModalData } from '../types';

// Import du contexte FirstConnection pour éviter les conflits de modals
let useFirstConnection: (() => { showQuestionnaire: boolean }) | null = null;
try {
  const firstConnectionModule = require('../../../app/contexts/FirstConnectionContext');
  useFirstConnection = firstConnectionModule.useFirstConnection;
} catch (error) {
  // Le contexte n'est pas disponible, on continue sans
  console.log('FirstConnectionContext non disponible dans useStreak');
}

// Cache global pour éviter les vérifications multiples entre différentes instances du hook
let globalEligibilityCache: {
  userId: string | null;
  timestamp: number;
  isChecking: boolean;
  hasCheckedToday: boolean;
} = {
  userId: null,
  timestamp: 0,
  isChecking: false,
  hasCheckedToday: false
};

// Durée de validité du cache (5 minutes)
const CACHE_VALIDITY_MS = 5 * 60 * 1000;

export const useStreak = () => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [modalData, setModalData] = useState<StreakModalData>({
    visible: false,
    streakCount: 0,
    dodjiEarned: 0,
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Utiliser useRef pour suivre l'état de connexion précédent
  const previousUserRef = useRef<string | null>(null);
  const hasCheckedForNewLoginRef = useRef(false);
  const isCheckingEligibilityRef = useRef(false); // Protection contre les appels multiples

  // Vérifier si le questionnaire de première connexion est visible
  let isQuestionnaireVisible = false;
  try {
    if (useFirstConnection) {
      const firstConnectionContext = useFirstConnection();
      isQuestionnaireVisible = firstConnectionContext.showQuestionnaire;
    }
  } catch (error) {
    // Ignorer l'erreur si le contexte n'est pas disponible
  }

  /**
   * Vérifie si le cache global est valide pour l'utilisateur actuel
   */
  const isGlobalCacheValid = useCallback((userId: string) => {
    const now = Date.now();
    return (
      globalEligibilityCache.userId === userId &&
      (now - globalEligibilityCache.timestamp) < CACHE_VALIDITY_MS &&
      globalEligibilityCache.hasCheckedToday
    );
  }, []);

  /**
   * Met à jour le cache global
   */
  const updateGlobalCache = useCallback((userId: string, hasChecked: boolean) => {
    globalEligibilityCache = {
      userId,
      timestamp: Date.now(),
      isChecking: false,
      hasCheckedToday: hasChecked
    };
  }, []);

  /**
   * Vérifie l'éligibilité au streak (sans donner les récompenses)
   */
  const checkStreakEligibility = useCallback(async () => {
    if (!user) {
      setError('Utilisateur non connecté');
      return null;
    }

    // Vérifier le cache global d'abord
    if (isGlobalCacheValid(user.uid)) {
      console.log('🎯 useStreak: Cache global valide, vérification ignorée');
      return null;
    }

    // Éviter les appels multiples simultanés (protection locale)
    if (isCheckingEligibilityRef.current) {
      console.log('🎯 useStreak: Vérification locale déjà en cours, ignoré');
      return null;
    }

    // Éviter les appels multiples simultanés (protection globale)
    if (globalEligibilityCache.isChecking) {
      console.log('🎯 useStreak: Vérification globale déjà en cours, ignoré');
      return null;
    }

    try {
      isCheckingEligibilityRef.current = true;
      globalEligibilityCache.isChecking = true;
      setLoading(true);
      setError(null);
      console.log('🎯 useStreak: Vérification de l\'éligibilité au streak pour:', user.uid);
      
      const result = await StreakService.checkStreakEligibility(user.uid);
      setStreakData(result);

      console.log('🎯 useStreak: Résultat de l\'éligibilité:', result);

      // Afficher le modal si c'est un nouveau jour de streak avec récompense
      if (result.isNewStreakDay && result.todayReward && result.totalDodjiEarned > 0) {
        console.log('🎯 useStreak: ✅ CONDITIONS REMPLIES - Affichage du modal de récompense');
        console.log('🎯 useStreak: - isNewStreakDay:', result.isNewStreakDay);
        console.log('🎯 useStreak: - todayReward:', result.todayReward);
        console.log('🎯 useStreak: - totalDodjiEarned:', result.totalDodjiEarned);
        
        // Vérifier qu'aucun modal n'est déjà affiché ET que le questionnaire n'est pas visible
        if (!modalData.visible && !isQuestionnaireVisible) {
          const newModalData = {
            visible: true,
            streakCount: result.currentStreak,
            dodjiEarned: result.totalDodjiEarned,
            title: result.todayReward.title,
            description: result.todayReward.description,
            isNewRecord: result.currentStreak > (streakData?.currentStreak || 0)
          };
          console.log('🎯 useStreak: Données du modal à afficher:', newModalData);
          setModalData(newModalData);
        } else {
          if (isQuestionnaireVisible) {
            console.log('🎯 useStreak: Questionnaire de première connexion visible, modal de streak reporté');
          } else {
            console.log('🎯 useStreak: Modal déjà visible, ignoré');
          }
        }
      } else {
        console.log('🎯 useStreak: ❌ CONDITIONS NON REMPLIES - Pas de modal à afficher');
        console.log('🎯 useStreak: - isNewStreakDay:', result.isNewStreakDay);
        console.log('🎯 useStreak: - todayReward:', result.todayReward);
        console.log('🎯 useStreak: - totalDodjiEarned:', result.totalDodjiEarned);
        console.log('🎯 useStreak: - Conditions détaillées:', {
          isNewStreakDay: result.isNewStreakDay,
          hasTodayReward: !!result.todayReward,
          hasReward: result.totalDodjiEarned > 0
        });
      }

      // Mettre à jour le cache global
      updateGlobalCache(user.uid, true);

      return result;
    } catch (err: any) {
      console.error('🎯 useStreak: Erreur lors de la vérification de l\'éligibilité:', err);
      setError(err.message || 'Erreur lors de la vérification du streak');
      return null;
    } finally {
      setLoading(false);
      isCheckingEligibilityRef.current = false;
      globalEligibilityCache.isChecking = false;
    }
  }, [user, streakData?.currentStreak, isGlobalCacheValid, updateGlobalCache]);

  /**
   * Récupère les données de streak actuelles
   */
  const getCurrentStreak = useCallback(async () => {
    if (!user) {
      setError('Utilisateur non connecté');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await StreakService.getCurrentStreak(user.uid);
      setStreakData(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération du streak');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Réclame les récompenses du streak
   */
  const claimReward = useCallback(async () => {
    if (!user || !streakData) {
      setError('Aucune récompense à réclamer');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🎯 useStreak: Réclamation des récompenses pour:', user.uid);
      
      await StreakService.claimStreakReward(user.uid, streakData);
      
      console.log('🎯 useStreak: Récompenses réclamées avec succès');
      
      // Fermer le modal après avoir réclamé les récompenses
      setModalData(prev => ({ ...prev, visible: false }));
      
      // Marquer qu'on a déjà vérifié et traité le streak aujourd'hui
      hasCheckedForNewLoginRef.current = true;
      
      // Mettre à jour le cache global pour indiquer que le streak a été traité
      updateGlobalCache(user.uid, true);
      
      // Rafraîchir les données de streak pour refléter les changements
      console.log('🎯 useStreak: Rafraîchissement des données après réclamation');
      const updatedStreakData = await getCurrentStreak();
      if (updatedStreakData) {
        setStreakData({
          ...updatedStreakData,
          isNewStreakDay: false, // Plus un nouveau jour après réclamation
          totalDodjiEarned: 0 // Plus de récompense à réclamer
        });
      }
      
      return true;
    } catch (err: any) {
      console.error('🎯 useStreak: Erreur lors de la réclamation des récompenses:', err);
      setError(err.message || 'Erreur lors de la réclamation des récompenses');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, streakData, updateGlobalCache, getCurrentStreak]);

  /**
   * Vérifie et met à jour le streak (ancienne méthode pour compatibilité)
   */
  const checkStreak = useCallback(async () => {
    return await checkStreakEligibility();
  }, [checkStreakEligibility]);

  /**
   * Ferme le modal de streak
   */
  const closeModal = useCallback(() => {
    console.log('🎯 useStreak: Fermeture du modal');
    setModalData(prev => ({ ...prev, visible: false }));
  }, []);

  /**
   * Affiche le modal de streak avec les informations actuelles (sans récompense)
   */
  const showStreakInfo = useCallback(async () => {
    if (!user) {
      setError('Utilisateur non connecté');
      return;
    }

    try {
      // Récupérer les données actuelles du streak
      const currentStreakData = await getCurrentStreak();
      if (currentStreakData) {
        const modalData = {
          visible: true,
          streakCount: currentStreakData.currentStreak,
          dodjiEarned: 0, // Pas de récompense lors d'un affichage manuel
          title: 'Votre streak de connexion',
          description: `Vous vous êtes connecté ${currentStreakData.currentStreak} jour${currentStreakData.currentStreak > 1 ? 's' : ''} consécutif${currentStreakData.currentStreak > 1 ? 's' : ''} !`,
          isNewRecord: false
        };
        
        console.log('🎯 useStreak: Affichage manuel du modal de streak:', modalData);
        setModalData(modalData);
      }
    } catch (err: any) {
      console.error('🎯 useStreak: Erreur lors de l\'affichage du modal de streak:', err);
      setError(err.message || 'Erreur lors de l\'affichage des informations de streak');
    }
  }, [user, getCurrentStreak]);

  /**
   * Vérifie si l'utilisateur peut gagner un streak aujourd'hui
   */
  const canEarnStreakToday = useCallback(async () => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    try {
      setError(null);
      return await StreakService.canEarnStreakToday(user.uid);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la vérification du streak quotidien');
      return false;
    }
  }, [user]);

  /**
   * Réinitialise le streak (pour les tests)
   */
  const resetStreak = useCallback(async () => {
    if (!user) {
      setError('Utilisateur non connecté');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await StreakService.resetStreak(user.uid);
      // Rafraîchir les données après la réinitialisation
      await getCurrentStreak();
      hasCheckedForNewLoginRef.current = false; // Permettre une nouvelle vérification
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation du streak');
    } finally {
      setLoading(false);
    }
  }, [user, getCurrentStreak]);

  // Détecter les nouvelles connexions et vérifier l'éligibilité au streak
  useEffect(() => {
    const currentUserId = user?.uid || null;
    const previousUserId = previousUserRef.current;

    console.log('🎯 useStreak: Effet de détection de connexion:', {
      currentUserId,
      previousUserId,
      hasCheckedForNewLogin: hasCheckedForNewLoginRef.current,
      isCheckingEligibility: isCheckingEligibilityRef.current,
      globalCache: globalEligibilityCache
    });

    // Si l'utilisateur vient de se connecter (passage de null à un utilisateur)
    if (currentUserId && !previousUserId) {
      // Vérifier le cache global d'abord
      if (isGlobalCacheValid(currentUserId)) {
        console.log('🎯 useStreak: Cache global valide, pas de nouvelle vérification nécessaire');
        hasCheckedForNewLoginRef.current = true;
        return;
      }

      // Vérifier les protections locales et globales
      if (!hasCheckedForNewLoginRef.current && !isCheckingEligibilityRef.current && !globalEligibilityCache.isChecking) {
        console.log('🎯 useStreak: Nouvelle connexion détectée, vérification de l\'éligibilité au streak');
        
        // Attendre un peu pour que la navigation soit terminée
        setTimeout(() => {
          // Vérifier à nouveau que la vérification n'est pas déjà en cours
          if (!hasCheckedForNewLoginRef.current && !isCheckingEligibilityRef.current && !globalEligibilityCache.isChecking) {
            checkStreakEligibility().then(() => {
              hasCheckedForNewLoginRef.current = true;
            });
          } else {
            console.log('🎯 useStreak: Vérification déjà effectuée ou en cours, ignoré');
          }
        }, 1000); // Délai de 1 seconde pour laisser la navigation se terminer
      } else {
        console.log('🎯 useStreak: Vérification déjà effectuée ou en cours, ignoré');
      }
    }

    // Si l'utilisateur se déconnecte
    if (!currentUserId && previousUserId) {
      console.log('🎯 useStreak: Déconnexion détectée, réinitialisation de l\'état');
      hasCheckedForNewLoginRef.current = false;
      isCheckingEligibilityRef.current = false;
      
      // Réinitialiser le cache global si c'est le même utilisateur
      if (globalEligibilityCache.userId === previousUserId) {
        globalEligibilityCache = {
          userId: null,
          timestamp: 0,
          isChecking: false,
          hasCheckedToday: false
        };
      }
      
      setStreakData(null);
      setModalData({
        visible: false,
        streakCount: 0,
        dodjiEarned: 0,
        title: '',
        description: ''
      });
    }

    // Mettre à jour la référence
    previousUserRef.current = currentUserId;
  }, [user, checkStreakEligibility, isGlobalCacheValid]);

  // Charger les données de streak au montage du composant si l'utilisateur est déjà connecté
  useEffect(() => {
    if (user && !streakData && hasCheckedForNewLoginRef.current) {
      console.log('🎯 useStreak: Chargement initial des données de streak');
      getCurrentStreak();
    }
  }, [user, streakData, getCurrentStreak]);

  return {
    streakData,
    modalData,
    loading,
    error,
    checkStreak,
    checkStreakEligibility,
    claimReward,
    getCurrentStreak,
    canEarnStreakToday,
    resetStreak,
    closeModal,
    showStreakInfo
  };
}; 