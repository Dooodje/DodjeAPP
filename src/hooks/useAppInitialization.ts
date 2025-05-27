import { useState, useEffect, useCallback } from 'react';
import { appInitializationService, InitializationProgress } from '../services/appInitialization';

interface UseAppInitializationReturn {
  isInitialized: boolean;
  isInitializing: boolean;
  initializationProgress: InitializationProgress | null;
  error: string | null;
  retry: () => void;
  forceReinitialize: () => void;
  stats: any;
}

export const useAppInitialization = (loadGlobalDataOnly: boolean = false): UseAppInitializationReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationProgress, setInitializationProgress] = useState<InitializationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProgress = useCallback((progress: InitializationProgress) => {
    setInitializationProgress(progress);
    console.log(`📊 Progression: ${progress.progress}% - ${progress.message}`);
  }, []);

  const initializeApp = useCallback(async () => {
    if (isInitializing) {
      console.log('⏳ Initialisation déjà en cours...');
      return;
    }

    setIsInitializing(true);
    setError(null);
    setInitializationProgress({
      step: 'start',
      progress: 0,
      message: loadGlobalDataOnly ? 'Chargement des données globales...' : 'Démarrage de l\'initialisation...'
    });

    try {
      console.log(`🚀 Début de l'initialisation ${loadGlobalDataOnly ? '(données globales uniquement)' : '(complète)'}`);
      
      await appInitializationService.initialize(handleProgress, loadGlobalDataOnly);
      
      setIsInitialized(true);
      setInitializationProgress({
        step: 'complete',
        progress: 100,
        message: loadGlobalDataOnly ? 'Données globales chargées !' : 'Application prête !'
      });
      
      console.log('✅ Initialisation terminée avec succès');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue lors de l\'initialisation';
      console.error('❌ Erreur lors de l\'initialisation:', errorMessage);
      
      setError(errorMessage);
      setInitializationProgress({
        step: 'error',
        progress: 0,
        message: 'Erreur lors de l\'initialisation'
      });
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, handleProgress, loadGlobalDataOnly]);

  const retry = useCallback(() => {
    console.log('🔄 Nouvelle tentative d\'initialisation');
    setError(null);
    setIsInitialized(false);
    initializeApp();
  }, [initializeApp]);

  const forceReinitialize = useCallback(async () => {
    console.log('🔄 Réinitialisation forcée');
    setIsInitialized(false);
    setIsInitializing(true);
    setError(null);
    
    try {
      await appInitializationService.reinitialize(handleProgress);
      setIsInitialized(true);
      setInitializationProgress({
        step: 'complete',
        progress: 100,
        message: 'Réinitialisation terminée !'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la réinitialisation';
      setError(errorMessage);
      setInitializationProgress({
        step: 'error',
        progress: 0,
        message: 'Erreur lors de la réinitialisation'
      });
    } finally {
      setIsInitializing(false);
    }
  }, [handleProgress]);

  const getStats = useCallback(() => {
    return appInitializationService.getInitializationStats();
  }, []);

  // Initialiser automatiquement au montage du hook
  useEffect(() => {
    if (!isInitialized && !isInitializing) {
      // Vérifier d'abord si l'app est déjà initialisée
      if (appInitializationService.isAppInitialized()) {
        console.log('✅ Application déjà initialisée');
        setIsInitialized(true);
        setInitializationProgress({
          step: 'complete',
          progress: 100,
          message: 'Application déjà prête !'
        });
      } else {
        initializeApp();
      }
    }
  }, [isInitialized, isInitializing, initializeApp]);

  return {
    isInitialized,
    isInitializing,
    initializationProgress,
    error,
    retry,
    forceReinitialize,
    stats: getStats()
  };
}; 