import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/hooks/useAuth';

interface FirstConnectionContextType {
  showQuestionnaire: boolean;
  setShowQuestionnaire: (show: boolean) => void;
  completeQuestionnaire: (answers: Record<string, string>) => Promise<void>;
  isFirstConnection: boolean;
}

const FirstConnectionContext = createContext<FirstConnectionContextType | undefined>(undefined);

const FIRST_CONNECTION_KEY = 'hasCompletedFirstConnection';

export function FirstConnectionProvider({ children }: { children: React.ReactNode }) {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [isFirstConnection, setIsFirstConnection] = useState(false);
  const { user } = useAuth();

  // Vérifier si c'est la première connexion
  useEffect(() => {
    const checkFirstConnection = async () => {
      if (!user?.uid) return;

      try {
        const hasCompleted = await AsyncStorage.getItem(`${FIRST_CONNECTION_KEY}_${user.uid}`);
        const isFirst = !hasCompleted;
        setIsFirstConnection(isFirst);
        
        // Afficher le questionnaire si c'est la première connexion
        if (isFirst) {
          // Délai pour laisser l'interface se charger
          setTimeout(() => {
            setShowQuestionnaire(true);
          }, 1000);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la première connexion:', error);
      }
    };

    checkFirstConnection();
  }, [user?.uid]);

  const completeQuestionnaire = async (answers: Record<string, string>) => {
    if (!user?.uid) return;

    try {
      // Sauvegarder les réponses du questionnaire
      await AsyncStorage.setItem(
        `questionnaire_answers_${user.uid}`, 
        JSON.stringify({
          answers,
          completedAt: new Date().toISOString()
        })
      );

      // Marquer le questionnaire comme complété
      await AsyncStorage.setItem(`${FIRST_CONNECTION_KEY}_${user.uid}`, 'true');

      // Cacher le questionnaire
      setShowQuestionnaire(false);
      setIsFirstConnection(false);

      console.log('Questionnaire de première connexion complété:', answers);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du questionnaire:', error);
    }
  };

  const value: FirstConnectionContextType = {
    showQuestionnaire,
    setShowQuestionnaire,
    completeQuestionnaire,
    isFirstConnection
  };

  return (
    <FirstConnectionContext.Provider value={value}>
      {children}
    </FirstConnectionContext.Provider>
  );
}

export function useFirstConnection() {
  const context = useContext(FirstConnectionContext);
  if (context === undefined) {
    throw new Error('useFirstConnection must be used within a FirstConnectionProvider');
  }
  return context;
} 