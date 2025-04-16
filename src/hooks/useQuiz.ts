import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { quizService } from '../services/quiz';
import { dodjiService } from '../services/dodji';
import {
  setCurrentQuiz,
  setCurrentQuestionIndex,
  setAnswer,
  updateScore,
  updateTimeRemaining,
  setSubmitting,
  setLoading,
  setError,
  showResults,
  resetQuiz
} from '../store/slices/quizSlice';
import { Quiz, QuizProgress } from '../types/quiz';

export const useQuiz = (quizId: string, userId: string) => {
  const dispatch = useDispatch();
  const {
    currentQuiz,
    currentQuestionIndex,
    answers,
    score,
    timeRemaining,
    isSubmitting,
    isLoading,
    error,
    showResults: isShowingResults
  } = useSelector((state: RootState) => state.quiz);
  
  // État local pour suivre si la récompense a été attribuée
  const [rewardGranted, setRewardGranted] = useState(false);

  // Charger le quiz
  const loadQuiz = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const quiz = await quizService.getQuizById(quizId);
      if (quiz) {
        dispatch(setCurrentQuiz(quiz));
      } else {
        dispatch(setError('Quiz non trouvé'));
      }
    } catch (error) {
      dispatch(setError('Erreur lors du chargement du quiz'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, quizId]);

  // Répondre à une question
  const answerQuestion = useCallback((questionId: string, answerIds: string[]) => {
    dispatch(setAnswer({ questionId, answerIds }));
  }, [dispatch]);

  // Passer à la question suivante
  const nextQuestion = useCallback(() => {
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      dispatch(setCurrentQuestionIndex(currentQuestionIndex + 1));
    }
  }, [dispatch, currentQuiz, currentQuestionIndex]);

  // Soumettre le quiz
  const submitQuiz = useCallback(async () => {
    if (!currentQuiz || !userId) return;

    try {
      dispatch(setSubmitting(true));
      
      // Calculer le score
      let totalScore = 0;
      Object.entries(answers).forEach(([questionId, answerIds]) => {
        const question = currentQuiz.questions.find(q => q.id === questionId);
        if (question) {
          const isCorrect = answerIds.every(id => {
            const answer = question.answers.find(a => a.id === id);
            return answer?.isCorrect;
          });
          if (isCorrect) {
            totalScore += question.points;
          }
        }
      });

      // Mettre à jour le score
      dispatch(updateScore(totalScore));

      // Sauvegarder la progression
      const progress: QuizProgress = {
        quizId,
        score: totalScore,
        answers,
        timeSpent: currentQuiz.timeLimit ? currentQuiz.timeLimit - timeRemaining : 0,
        completedAt: new Date()
      };

      await quizService.saveQuizProgress(userId, progress);

      // Calculer le pourcentage du score
      const scorePercentage = (totalScore / currentQuiz.totalPoints) * 100;
      const isPassed = scorePercentage >= currentQuiz.passingScore;
      
      // Attribuer la récompense si le quiz est réussi et que la récompense n'a pas encore été attribuée
      if (isPassed && !rewardGranted && currentQuiz.dodjiReward > 0) {
        try {
          await dodjiService.rewardQuizCompletion(userId, quizId, currentQuiz.dodjiReward);
          setRewardGranted(true);
        } catch (rewardError) {
          console.error('Erreur lors de l\'attribution de la récompense:', rewardError);
          // Continuer même en cas d'erreur pour ne pas bloquer l'utilisateur
        }
      }

      // Mettre à jour le statut et le meilleur score si nécessaire
      if (totalScore >= currentQuiz.passingScore) {
        await quizService.updateQuizStatus(userId, quizId, 'completed');
        if (!currentQuiz.bestScore || totalScore > currentQuiz.bestScore) {
          await quizService.updateBestScore(userId, quizId, totalScore);
        }
      }

      // Afficher les résultats
      dispatch(showResults());
    } catch (error) {
      dispatch(setError('Erreur lors de la soumission du quiz'));
    } finally {
      dispatch(setSubmitting(false));
    }
  }, [dispatch, currentQuiz, answers, timeRemaining, userId, quizId, rewardGranted]);

  // Réinitialiser le quiz
  const reset = useCallback(() => {
    dispatch(resetQuiz());
    setRewardGranted(false);
  }, [dispatch]);

  // Gérer le timer
  useEffect(() => {
    if (!currentQuiz?.timeLimit || isShowingResults) return;

    const timer = setInterval(() => {
      if (timeRemaining > 0) {
        dispatch(updateTimeRemaining(timeRemaining - 1));
      } else {
        submitQuiz();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuiz?.timeLimit, timeRemaining, isShowingResults, dispatch, submitQuiz]);

  // Charger le quiz au montage
  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  return {
    currentQuiz,
    currentQuestionIndex,
    answers,
    score,
    timeRemaining,
    isSubmitting,
    isLoading,
    error,
    isShowingResults,
    rewardGranted,
    answerQuestion,
    nextQuestion,
    submitQuiz,
    reset
  };
}; 