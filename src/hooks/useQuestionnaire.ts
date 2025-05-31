import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { QuestionnaireService, QuestionnaireAnswers, UserQuestionnaireData } from '../services/questionnaireService';

export const useQuestionnaire = () => {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<QuestionnaireAnswers | null>(null);
  const [userData, setUserData] = useState<UserQuestionnaireData | null>(null);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les réponses du questionnaire au montage du hook
  useEffect(() => {
    const loadQuestionnaireData = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Vérifier si l'utilisateur a complété le questionnaire
        const completed = await QuestionnaireService.hasCompletedQuestionnaire(user.uid);
        setHasCompleted(completed);

        // Si complété, récupérer les données utilisateur et l'historique
        if (completed) {
          const [userQuestionnaireData, questionnaireAnswers] = await Promise.all([
            QuestionnaireService.getUserQuestionnaireData(user.uid),
            QuestionnaireService.getQuestionnaireAnswers(user.uid)
          ]);
          
          setUserData(userQuestionnaireData);
          setAnswers(questionnaireAnswers);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données du questionnaire:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestionnaireData();
  }, [user?.uid]);

  // Fonction pour sauvegarder les réponses
  const saveAnswers = async (questionnaireAnswers: Record<string, string>) => {
    if (!user?.uid) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      await QuestionnaireService.saveQuestionnaireAnswers(user.uid, questionnaireAnswers);
      
      // Recharger les données après sauvegarde
      const [savedUserData, savedAnswers] = await Promise.all([
        QuestionnaireService.getUserQuestionnaireData(user.uid),
        QuestionnaireService.getQuestionnaireAnswers(user.uid)
      ]);
      
      setUserData(savedUserData);
      setAnswers(savedAnswers);
      setHasCompleted(true);
      
      return { userData: savedUserData, answers: savedAnswers };
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des réponses:', err);
      throw err;
    }
  };

  // Fonction pour analyser les réponses (legacy)
  const analyzeAnswers = () => {
    if (!answers?.answers) {
      return null;
    }
    return QuestionnaireService.analyzeAnswers(answers.answers);
  };

  // Fonction pour forcer le rechargement des données
  const refresh = async () => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      setError(null);

      const completed = await QuestionnaireService.hasCompletedQuestionnaire(user.uid);
      setHasCompleted(completed);

      if (completed) {
        const [userQuestionnaireData, questionnaireAnswers] = await Promise.all([
          QuestionnaireService.getUserQuestionnaireData(user.uid),
          QuestionnaireService.getQuestionnaireAnswers(user.uid)
        ]);
        
        setUserData(userQuestionnaireData);
        setAnswers(questionnaireAnswers);
      } else {
        setUserData(null);
        setAnswers(null);
      }
    } catch (err) {
      console.error('Erreur lors du rechargement des données:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Nouvelles données structurées
    userData,
    
    // Données legacy pour compatibilité
    answers,
    hasCompleted,
    isLoading,
    error,
    saveAnswers,
    analyzeAnswers,
    refresh,
    analysis: analyzeAnswers()
  };
}; 