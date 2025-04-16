import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { quizService } from '../../src/services/quiz';
import { dodjiService } from '../../src/services/dodji';
import { Quiz, Question, Answer } from '../../src/types/quiz';
import ConfettiCannon from 'react-native-confetti-cannon';

console.log('Quiz page loaded - full implementation!');

// Composant d'en-tête du quiz
const QuizHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={styles.headerSpacer} />
  </View>
);

// Composant de progression du quiz
const QuizProgress = ({ current, total }: { current: number; total: number }) => (
  <View style={styles.progressContainer}>
    <View style={styles.progressBar}>
      <View 
        style={[
          styles.progressFill, 
          { width: `${(current / total) * 100}%` }
        ]} 
      />
    </View>
    <Text style={styles.progressText}>{current} / {total}</Text>
  </View>
);

// Composant de réponse individuelle
const AnswerOption = ({ 
  answer, 
  selected, 
  showResult, 
  onSelect 
}: { 
  answer: Answer; 
  selected: boolean; 
  showResult: boolean;
  onSelect: () => void; 
}) => {
  let borderColor = selected ? '#06D001' : 'rgba(255, 255, 255, 0.1)';
  let backgroundColor = selected ? 'rgba(6, 208, 1, 0.1)' : 'rgba(0, 0, 0, 0.3)';
  
  if (showResult) {
    if (answer.isCorrect) {
      borderColor = '#06D001';
      backgroundColor = 'rgba(6, 208, 1, 0.2)';
    } else if (selected && !answer.isCorrect) {
      borderColor = '#FF3B30';
      backgroundColor = 'rgba(255, 59, 48, 0.1)';
    }
  }
  
  return (
    <TouchableOpacity 
      style={[styles.answerContainer, { borderColor, backgroundColor }]} 
      onPress={onSelect}
      disabled={showResult}
    >
      <View style={styles.answerCheckbox}>
        {selected && (
          <MaterialIcons name="check-circle" size={20} color="#06D001" />
        )}
        {!selected && (
          <View style={styles.answerCheckboxEmpty} />
        )}
      </View>
      <Text style={styles.answerText}>{answer.text}</Text>
      {showResult && answer.isCorrect && (
        <MaterialIcons name="check-circle" size={20} color="#06D001" />
      )}
      {showResult && selected && !answer.isCorrect && (
        <MaterialIcons name="cancel" size={20} color="#FF3B30" />
      )}
    </TouchableOpacity>
  );
};

// Pages/États du quiz
enum QuizState {
  INTRO = 'intro',
  QUESTION = 'question',
  RESULT = 'result',
}

export default function QuizPage() {
  const { id, parcoursId } = useLocalSearchParams<{ id: string; parcoursId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  // États
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentState, setCurrentState] = useState<QuizState>(QuizState.INTRO);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [hasEarnedReward, setHasEarnedReward] = useState(false);
  const [showRewardMessage, setShowRewardMessage] = useState(false);
  
  // Chargement des données du quiz
  useEffect(() => {
    const loadQuiz = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const quizData = await quizService.getQuizById(id);
        
        if (!quizData) {
          Alert.alert("Erreur", "Ce quiz n'existe pas");
          handleBackPress();
          return;
        }
        
        setQuiz(quizData);
        
        // Initialiser les réponses
        const initialAnswers: Record<string, string[]> = {};
        quizData.questions.forEach(q => {
          initialAnswers[q.id] = [];
        });
        setAnswers(initialAnswers);
        
      } catch (error) {
        console.error("Erreur lors du chargement du quiz:", error);
        Alert.alert("Erreur", "Impossible de charger le quiz");
      } finally {
        setLoading(false);
      }
    };
    
    loadQuiz();
  }, [id]);
  
  // Gérer le retour
  const handleBackPress = () => {
    if (parcoursId) {
      router.push(`/course/${parcoursId}` as any);
    } else {
      router.back();
    }
  };
  
  // Démarrer le quiz
  const startQuiz = () => {
    setCurrentState(QuizState.QUESTION);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setScore(0);
  };
  
  // Sélectionner une réponse
  const selectAnswer = (questionId: string, answerId: string) => {
    const question = quiz?.questions[currentQuestionIndex];
    if (!question) return;
    
    // Pour les questions à choix unique
    if (question.type === 'single') {
      setAnswers(prev => ({
        ...prev,
        [questionId]: [answerId]
      }));
    } 
    // Pour les questions à choix multiples
    else {
      setAnswers(prev => {
        const currentAnswers = prev[questionId] || [];
        
        // Si la réponse est déjà sélectionnée, la retirer
        if (currentAnswers.includes(answerId)) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter(id => id !== answerId)
          };
        } 
        // Sinon, l'ajouter
        else {
          return {
            ...prev,
            [questionId]: [...currentAnswers, answerId]
          };
        }
      });
    }
  };
  
  // Valider la réponse à la question courante
  const validateAnswer = () => {
    const question = quiz?.questions[currentQuestionIndex];
    if (!question) return;
    
    const userAnswers = answers[question.id] || [];
    
    // Vérifier si au moins une réponse est sélectionnée
    if (userAnswers.length === 0) {
      Alert.alert("Attention", "Veuillez sélectionner au moins une réponse");
      return;
    }
    
    setShowAnswer(true);
    
    // Calculer le score pour cette question
    const correctAnswerIds = question.answers
      .filter(a => a.isCorrect)
      .map(a => a.id);
    
    const userCorrectCount = userAnswers.filter(id => correctAnswerIds.includes(id)).length;
    const userIncorrectCount = userAnswers.filter(id => !correctAnswerIds.includes(id)).length;
    
    // Attribution des points (uniquement si toutes les bonnes réponses sont sélectionnées et aucune mauvaise)
    if (userCorrectCount === correctAnswerIds.length && userIncorrectCount === 0) {
      setScore(prev => prev + question.points);
    }
  };
  
  // Passer à la question suivante
  const nextQuestion = () => {
    if (!quiz) return;
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Terminer le quiz et afficher les résultats
      finishQuiz();
    }
  };
  
  // Terminer le quiz et enregistrer les résultats
  const finishQuiz = async () => {
    if (!quiz || !user) return;
    
    setCurrentState(QuizState.RESULT);
    
    // Calculer le score en pourcentage
    const scorePercentage = (score / quiz.totalPoints) * 100;
    const isPassed = scorePercentage >= quiz.passingScore;
    
    // Si l'utilisateur a réussi, lui attribuer la récompense
    if (isPassed && !hasEarnedReward) {
      try {
        // Enregistrer la progression
        await quizService.saveQuizProgress(user.uid, {
          quizId: quiz.id,
          score: scorePercentage,
          answers,
          timeSpent: 0, // À implémenter: tracker le temps passé
          completedAt: new Date()
        });
        
        // Attribuer la récompense en Dodji
        if (quiz.dodjiReward > 0) {
          await dodjiService.rewardQuizCompletion(user.uid, quiz.id, quiz.dodjiReward);
          console.log(`Récompense de ${quiz.dodjiReward} Dodji attribuée pour le quiz ${quiz.id}`);
          
          // Afficher le message de récompense
          setShowRewardMessage(true);
          setTimeout(() => setShowRewardMessage(false), 5000); // Masquer après 5 secondes
        }
        
        // Mettre à jour le statut du quiz
        await quizService.updateQuizStatus(user.uid, quiz.id, 'completed');
        
        setHasEarnedReward(true);
      } catch (error) {
        console.error("Erreur lors de l'enregistrement des résultats:", error);
      }
    }
  };
  
  // Recommencer le quiz
  const retryQuiz = () => {
    const initialAnswers: Record<string, string[]> = {};
    quiz?.questions.forEach(q => {
      initialAnswers[q.id] = [];
    });
    
    setAnswers(initialAnswers);
    setScore(0);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setCurrentState(QuizState.INTRO);
  };
  
  // Render l'écran d'introduction
  const renderIntro = () => {
    if (!quiz) return null;
    
    return (
      <View style={styles.introContainer}>
        <View style={styles.quizInfoCard}>
          <MaterialIcons name="quiz" size={48} color="#FFC107" style={styles.quizIcon} />
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <Text style={styles.quizDescription}>{quiz.description}</Text>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="help" size={24} color="#FFFFFF" />
            <Text style={styles.infoText}>{quiz.questions.length} questions</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="stars" size={24} color="#FFFFFF" />
            <Text style={styles.infoText}>Seuil de réussite: {quiz.passingScore}%</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="monetization-on" size={24} color="#06D001" />
            <Text style={styles.infoText}>Récompense: {quiz.dodjiReward} Dodji</Text>
          </View>
          
          <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
            <Text style={styles.startButtonText}>Commencer le quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Render la question courante
  const renderQuestion = () => {
    if (!quiz) return null;
    
    const question = quiz.questions[currentQuestionIndex];
    
    return (
      <View style={styles.questionContainer}>
        <QuizProgress 
          current={currentQuestionIndex + 1} 
          total={quiz.questions.length} 
        />
        
        <ScrollView style={styles.questionScroll}>
          <Text style={styles.questionTitle}>
            Question {currentQuestionIndex + 1}
          </Text>
          <Text style={styles.questionText}>{question.text}</Text>
          
          <View style={styles.answersContainer}>
            {question.answers.map(answer => (
              <AnswerOption 
                key={answer.id}
                answer={answer}
                selected={answers[question.id]?.includes(answer.id) || false}
                showResult={showAnswer}
                onSelect={() => selectAnswer(question.id, answer.id)}
              />
            ))}
          </View>
          
          {showAnswer && question.explanation && (
            <View style={styles.explanationContainer}>
              <MaterialIcons name="info-outline" size={20} color="#06D001" />
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.actionContainer}>
          {!showAnswer ? (
            <TouchableOpacity 
              style={styles.validateButton} 
              onPress={validateAnswer}
            >
              <Text style={styles.validateButtonText}>Valider</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.nextButton} 
              onPress={nextQuestion}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex < (quiz.questions.length - 1) 
                  ? "Question suivante" 
                  : "Voir les résultats"}
              </Text>
              <MaterialIcons name="arrow-forward" size={20} color="#000000" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  
  // Render l'écran de résultats
  const renderResult = () => {
    if (!quiz) return null;
    
    const totalPoints = quiz.totalPoints;
    const scorePercentage = (score / totalPoints) * 100;
    const isPassed = scorePercentage >= quiz.passingScore;
    
    return (
      <View style={styles.resultContainer}>
        {isPassed && <ConfettiCannon count={200} origin={{x: -10, y: 0}} fallSpeed={2000} />}
        <View style={styles.resultCard}>
          <MaterialIcons 
            name={isPassed ? "check-circle" : "cancel"} 
            size={60} 
            color={isPassed ? "#4CAF50" : "#F44336"} 
          />
          
          <Text style={styles.resultTitle}>
            {isPassed ? "Félicitations !" : "Essayez encore !"}
          </Text>
          
          <Text style={styles.scoreText}>
            Score: {score}/{totalPoints} ({Math.round(scorePercentage)}%)
          </Text>
          
          <Text style={styles.resultDescription}>
            {isPassed 
              ? `Vous avez obtenu un score supérieur à ${quiz.passingScore}% et gagné ${quiz.dodjiReward} Dodji !` 
              : `Vous devez obtenir au moins ${quiz.passingScore}% pour réussir le quiz.`}
          </Text>
          
          {isPassed && hasEarnedReward && (
            <View style={[styles.rewardContainer]}>
              <MaterialIcons name="emoji-events" size={30} color="#FFC107" />
              <Text style={[styles.rewardText]}>
                Vous avez gagné {quiz.dodjiReward} Dodji !
              </Text>
            </View>
          )}
          
          {showRewardMessage && (
            <View style={[styles.rewardMessageContainer]}>
              <Text style={[styles.rewardMessageText]}>
                +{quiz.dodjiReward} Dodji ajoutés à votre compte!
              </Text>
            </View>
          )}
          
          <View style={styles.resultButtonsContainer}>
            <TouchableOpacity 
              style={[styles.resultButton, styles.retryButton]} 
              onPress={retryQuiz}
            >
              <MaterialIcons name="replay" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Recommencer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.resultButton, styles.continueButton]} 
              onPress={handleBackPress}
            >
              <Text style={styles.continueButtonText}>Continuer</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
        <QuizHeader 
          title={quiz?.title || "Quiz"} 
          onBack={handleBackPress} 
        />
        
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#06D001" />
            <Text style={styles.loaderText}>Chargement du quiz...</Text>
          </View>
        ) : (
          <>
            {currentState === QuizState.INTRO && renderIntro()}
            {currentState === QuizState.QUESTION && renderQuestion()}
            {currentState === QuizState.RESULT && renderResult()}
          </>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  headerSpacer: {
    width: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  
  // Styles pour l'écran d'introduction
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  quizInfoCard: {
    backgroundColor: 'rgba(20, 20, 20, 0.7)',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  quizIcon: {
    marginBottom: 16,
  },
  quizTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  quizDescription: {
    color: '#CCCCCC',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  startButton: {
    backgroundColor: '#06D001',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  startButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Styles pour la progression
  progressContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#06D001',
    borderRadius: 4,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Styles pour les questions
  questionContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  questionScroll: {
    flex: 1,
    padding: 16,
  },
  questionTitle: {
    color: '#06D001',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    lineHeight: 28,
  },
  answersContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  answerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  answerCheckbox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  answerCheckboxEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  answerText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  explanationContainer: {
    backgroundColor: 'rgba(6, 208, 1, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: '#06D001',
  },
  explanationText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
  },
  actionContainer: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  validateButton: {
    backgroundColor: '#06D001',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  validateButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  
  // Styles pour les résultats
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultCard: {
    backgroundColor: 'rgba(20, 20, 20, 0.7)',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  resultIcon: {
    marginBottom: 16,
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreText: {
    color: '#06D001',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultDescription: {
    color: '#CCCCCC',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  resultButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  resultButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: '#FFC107',
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  rewardMessageContainer: {
    position: 'absolute',
    top: 40,
    backgroundColor: 'rgba(6, 208, 1, 0.8)',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rewardMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 