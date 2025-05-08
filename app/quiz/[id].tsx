import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { useQuizReward } from '../../src/hooks/useQuizReward';
import { quizService } from '../../src/services/quiz';
import { dodjiService } from '../../src/services/dodji';
import { Quiz, Question, Answer } from '../../src/types/quiz';
import type { QuizProgress } from '../../src/types/quiz';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebase';
import { ProgressionService } from '../../src/services/businessLogic/ProgressionService';

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
  // Déterminer le style en fonction de l'état
  let styleModifiers = {};
  let textStyle = {};
  
  if (selected) {
    styleModifiers = {
      ...styleModifiers,
      borderColor: '#06D001',
      borderWidth: 2,
      backgroundColor: 'rgba(6, 208, 1, 0.1)',
    };
    textStyle = {
      ...textStyle,
      color: '#FFFFFF',
      fontWeight: 'bold',
    };
  }
  
  if (showResult) {
    if (answer.isCorrect) {
      styleModifiers = {
        ...styleModifiers,
        borderColor: '#06D001',
        borderWidth: 2,
        backgroundColor: 'rgba(6, 208, 1, 0.2)',
      };
      textStyle = {
        ...textStyle,
        color: '#06D001',
        fontWeight: 'bold',
      };
    } else if (selected && !answer.isCorrect) {
      styleModifiers = {
        ...styleModifiers,
        borderColor: '#FF3B30',
        borderWidth: 2,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
      };
      textStyle = {
        ...textStyle,
        color: '#FF3B30',
        fontWeight: 'bold',
      };
    }
  }
  
  return (
    <TouchableOpacity 
      style={[styles.answerContainer, styleModifiers]} 
      onPress={onSelect}
      disabled={showResult}
    >
      <View style={styles.answerCheckbox}>
        {selected && (
          <View style={{
            width: 12,
            height: 12,
            backgroundColor: '#FFFFFF',
            borderRadius: 6,
          }} />
        )}
      </View>
      <Text style={[styles.answerText, textStyle]}>{answer.text}</Text>
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
  const { checkIfClaimed } = useQuizReward(id);
  
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
  const [quizStatus, setQuizStatus] = useState<'blocked' | 'unblocked' | 'completed'>('blocked');
  
  // Chargement des données du quiz
  useEffect(() => {
    const loadQuiz = async () => {
      if (!id || !user?.uid) return;
      
      try {
        setLoading(true);
        
        // Vérifier le statut du quiz
        const quizStatusRef = doc(db, 'users', user.uid, 'quiz', id);
        const quizStatusDoc = await getDoc(quizStatusRef);
        
        if (quizStatusDoc.exists()) {
          const status = quizStatusDoc.data().status;
          setQuizStatus(status);
          
          // Si le quiz est bloqué, rediriger vers la page précédente
          if (status === 'blocked') {
            Alert.alert(
              "Quiz non accessible",
              "Vous devez terminer toutes les vidéos du parcours pour accéder à ce quiz.",
              [{ text: "OK", onPress: handleBackPress }]
            );
            return;
          }
        } else {
          // Si le statut n'existe pas, considérer comme bloqué
          Alert.alert(
            "Quiz non accessible",
            "Vous devez terminer toutes les vidéos du parcours pour accéder à ce quiz.",
            [{ text: "OK", onPress: handleBackPress }]
          );
          return;
        }
        
        const quizData = await quizService.getQuizById(id);
        
        if (!quizData) {
          Alert.alert("Erreur", "Ce quiz n'existe pas");
          handleBackPress();
          return;
        }
        
        // Adapter le format des données pour correspondre à notre structure
        const adaptedQuizData: Quiz = {
          ...quizData,
          questions: Array.isArray(quizData.questions) 
            ? quizData.questions.map((q: any, index: number) => {
                // Adapter chaque question
                return {
                  id: q.id || `question-${index}`,
                  text: q.text || "",
                  type: q.isMultipleChoice === true ? 'multiple' as const : 'single' as const,
                  answers: Array.isArray(q.choices) 
                    ? q.choices.map((choice: any, choiceIndex: number) => ({
                        id: choice.id || `choice-${choiceIndex}`,
                        text: choice.text || "",
                        isCorrect: Boolean(choice.isCorrect),
                        explanation: choice.explanation || ""
                      })) 
                    : [],
                  explanation: q.explanation || "",
                  points: 1, // Par défaut 1 point par question
                  timeLimit: q.timeLimit || undefined
                };
              }) 
            : [],
          title: quizData.title || quizData.titre || "Quiz",
          titre: quizData.titre || quizData.title || "Quiz",
          description: quizData.description || "",
          courseId: quizData.courseId || "",
          videoId: quizData.videoId || "",
          totalPoints: quizData.questions?.length || 0,
          passingScore: 70, // Valeur fixe comme demandé
          dodjiReward: quizData.tokenReward || quizData.dodjiReward || 0,
          tokenReward: quizData.tokenReward || quizData.dodjiReward || 0,
          status: quizData.status || 'unlocked',
          progress: quizData.progress || 0
        };
        
        console.log("Quiz adapté:", adaptedQuizData);
        setQuiz(adaptedQuizData);
        
        // Initialiser les réponses
        const initialAnswers: Record<string, string[]> = {};
        adaptedQuizData.questions.forEach(q => {
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
  }, [id, user?.uid, router]);
  
  // Gérer les retours en arrière
  const handleBackPress = () => {
    console.log('Retour à la page précédente');
    if (parcoursId) {
      // Rediriger vers la page d'accueil au niveau du parcours
      router.replace('/(tabs)');
    } else {
      // Navigation normale vers la page précédente si pas de parcoursId
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
  const selectAnswer = (questionId: string, answerId: string, isMultipleChoice: boolean) => {
    const question = quiz?.questions.find(q => q.id === questionId);
    if (!question) return;
    
    setAnswers(prev => {
      // Crée une copie des réponses actuelles
      const newAnswers = { ...prev };
      
      // Initialise le tableau de réponses pour cette question s'il n'existe pas
      if (!newAnswers[questionId]) {
        newAnswers[questionId] = [];
      }

      // Pour les questions à choix unique, remplace la réponse précédente
      if (!isMultipleChoice) {
        newAnswers[questionId] = [answerId];
      } 
      // Pour les questions à choix multiples, ajoute/supprime selon l'état actuel
      else {
        if (newAnswers[questionId].includes(answerId)) {
          // Si déjà sélectionné, retire-le
          newAnswers[questionId] = newAnswers[questionId].filter(id => id !== answerId);
        } else {
          // Sinon ajoute-le
          newAnswers[questionId].push(answerId);
        }
      }
      
      return newAnswers;
    });
  };
  
  // Calculer le score
  const calculateScore = useCallback(() => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return 0;
    
    let score = 0;
    
    quiz.questions.forEach(question => {
      if (!question || !question.answers) return;
      
      const userAnswers = answers[question.id] || [];
      const correctAnswers = question.answers
        .filter(answer => answer.isCorrect)
        .map(answer => answer.id);
      
      // Vérifier si les réponses de l'utilisateur correspondent exactement aux bonnes réponses
      if (correctAnswers.length > 0 && userAnswers.length === correctAnswers.length &&
          correctAnswers.every(id => userAnswers.includes(id))) {
        score++;
      }
    });
    
    return score;
  }, [quiz, answers]);
  
  // Calculer le score final
  const calculateFinalScore = () => {
    const score = calculateScore();
    const total = quiz?.questions?.length || 0;
    return {
      score,
      total,
      percentage: total > 0 ? Math.round((score / total) * 100) : 0
    };
  };
  
  // Valider la réponse à la question courante
  const validateAnswer = () => {
    if (!quiz || !quiz.questions) return;
    
    const question = quiz.questions[currentQuestionIndex];
    if (!question || !question.answers) return;
    
    const userAnswers = answers[question.id] || [];
    
    // Vérifier si au moins une réponse est sélectionnée
    if (userAnswers.length === 0) {
      Alert.alert("Attention", "Veuillez sélectionner au moins une réponse");
      return;
    }
    
    setShowAnswer(true);
    
    // Calculer le score pour cette question
    if (!Array.isArray(question.answers)) return;
    
    const correctAnswerIds = question.answers
      .filter(a => a && a.isCorrect)
      .map(a => a.id);
    
    const userCorrectCount = userAnswers.filter(id => correctAnswerIds.includes(id)).length;
    const userIncorrectCount = userAnswers.filter(id => !correctAnswerIds.includes(id)).length;
    
    // Attribution des points (uniquement si toutes les bonnes réponses sont sélectionnées et aucune mauvaise)
    if (correctAnswerIds.length > 0 && userCorrectCount === correctAnswerIds.length && userIncorrectCount === 0) {
      setScore(prev => prev + (question.points || 1));
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
  
  // Fonction pour vérifier si une réponse est correcte
  const isQuestionCorrect = (questionId: string, selectedAnswers: string[]): boolean => {
    const question = quiz?.questions.find(q => q.id === questionId);
    if (!question) return false;
    
    return selectedAnswers.every(answerId => {
      const answer = question.answers.find(a => a.id === answerId);
      return answer?.isCorrect;
    });
  };

  // Calculer le nombre de réponses correctes
  const calculateCorrectAnswers = (): number => {
    if (!quiz) return 0;
    return Object.entries(answers).reduce((count, [questionId, selectedAnswers]) => {
      return count + (isQuestionCorrect(questionId, selectedAnswers) ? 1 : 0);
    }, 0);
  };
  
  // Terminer le quiz et enregistrer les résultats
  const finishQuiz = async () => {
    if (!quiz || !user) return;
    
    try {
      setCurrentState(QuizState.RESULT); // Passer à l'écran de résultat immédiatement
      
      // Calculer le score
      const correctAnswers = calculateCorrectAnswers();
      const scorePercentage = (correctAnswers / quiz.questions.length) * 100;
      const isPassed = scorePercentage >= quiz.passingScore;
      const timeRemaining = quiz.timeLimit || 0;
      const rewardAmount = quiz.tokenReward || quiz.dodjiReward || 0;
      
      try {
        // Créer l'objet de résultat du quiz
        const quizResult = {
          score: 0, // Ce champ sera recalculé dans ProgressionService
          totalQuestions: quiz.questions.length,
          correctAnswers: correctAnswers, // Nombre de réponses correctes
          timeSpent: quiz.timeLimit ? quiz.timeLimit - timeRemaining : 0,
          answers: Object.entries(answers).map(([questionId, selectedAnswers]) => ({
            questionId,
            selectedAnswers,
            isCorrect: isQuestionCorrect(questionId, selectedAnswers),
            timeSpent: 0
          }))
        };

        // Enregistrer les résultats et mettre à jour les statuts
        await ProgressionService.handleQuizCompletion(
          user.uid,
          quiz.id,
          parcoursId,
          quizResult
        );
        console.log("Progression du quiz enregistrée avec succès");
        
        // Attribuer la récompense seulement si le quiz est réussi
        if (isPassed && rewardAmount > 0) {
          try {
            // Vérifier si la récompense a déjà été attribuée
            const isAlreadyClaimed = await checkIfClaimed();
            
            if (!isAlreadyClaimed) {
              await dodjiService.rewardQuizCompletion(user.uid, quiz.id, rewardAmount);
              console.log(`Récompense de ${rewardAmount} Dodji attribuée pour le quiz ${quiz.id}`);
              setHasEarnedReward(true);
              
              setShowRewardMessage(true);
              setTimeout(() => setShowRewardMessage(false), 3000);
            } else {
              console.log('Récompense déjà attribuée pour ce quiz');
              setHasEarnedReward(false);
            }
          } catch (rewardError) {
            console.error("Erreur lors de l'attribution de récompense:", rewardError);
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'enregistrement des résultats:", error);
        Alert.alert("Attention", "Une erreur s'est produite lors de l'enregistrement de vos résultats.");
      }
    } catch (error) {
      console.error("Erreur générale dans finishQuiz:", error);
      Alert.alert("Erreur", "Une erreur s'est produite. Veuillez réessayer.");
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
          <Text style={styles.quizTitle}>{quiz.titre || quiz.title}</Text>
          <Text style={styles.quizDescription}>{quiz.description}</Text>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="help" size={24} color="#FFFFFF" />
            <Text style={styles.infoText}>{quiz.questions?.length || 0} questions</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="stars" size={24} color="#FFFFFF" />
            <Text style={styles.infoText}>Seuil de réussite: 70%</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="monetization-on" size={24} color="#06D001" />
            <Text style={styles.infoText}>Récompense: {quiz.tokenReward || quiz.dodjiReward || 0} Dodji</Text>
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
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return null;
    
    const question = quiz.questions[currentQuestionIndex];
    if (!question) return null;
    
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
          <Text style={styles.questionText}>{question.text || `Question ${currentQuestionIndex + 1}`}</Text>
          
          <View style={styles.answersContainer}>
            {question.answers && Array.isArray(question.answers) && question.answers.map(answer => (
              <AnswerOption 
                key={answer.id}
                answer={answer}
                selected={answers[question.id]?.includes(answer.id) || false}
                showResult={showAnswer}
                onSelect={() => selectAnswer(question.id, answer.id, question.type === 'multiple')}
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
    
    const totalPoints = quiz.totalPoints || quiz.questions?.length || 0;
    const scorePercentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const passingScore = quiz.passingScore || 70;
    const isPassed = scorePercentage >= passingScore;
    const rewardAmount = quiz.tokenReward || quiz.dodjiReward || 0;
    
    return (
      <View style={styles.resultContainer}>
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
          
          <Text style={styles.resultDescription || styles.quizDescription}>
            {isPassed 
              ? `Vous avez obtenu un score supérieur à ${passingScore}%${hasEarnedReward ? ` et gagné ${rewardAmount} Dodji !` : ' !'}` 
              : `Vous devez obtenir au moins ${passingScore}% pour réussir le quiz. N'hésitez pas à revoir le contenu du cours et à réessayer.`}
          </Text>
          
          {isPassed && hasEarnedReward && showRewardMessage && (
            <View style={styles.rewardContainer}>
              <MaterialIcons name="emoji-events" size={30} color="#FFC107" />
              <Text style={styles.rewardText}>
                Vous avez gagné {rewardAmount} Dodji !
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
              <Text style={styles.continueButtonText}>Quitter</Text>
              <MaterialIcons name="exit-to-app" size={20} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <>
      <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
        <QuizHeader 
          title={quiz?.titre || quiz?.title || "Quiz"} 
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
  answerOptionText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  selectedAnswer: {
    borderColor: '#06D001',
    borderWidth: 2,
    backgroundColor: 'rgba(6, 208, 1, 0.1)',
  },
  correctAnswer: {
    borderColor: '#06D001',
    borderWidth: 2,
    backgroundColor: 'rgba(6, 208, 1, 0.2)',
  },
  wrongAnswer: {
    borderColor: '#FF3B30',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  disabledAnswer: {
    opacity: 0.8,
  },
  selectedAnswerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  correctAnswerText: {
    color: '#06D001',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  wrongAnswerText: {
    color: '#FF3B30',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  checkboxContainer: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#06D001',
    borderColor: '#06D001',
  },
  checkboxCorrect: {
    borderColor: '#06D001',
  },
  checkboxWrong: {
    borderColor: '#FF3B30',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
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
  finishButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
}); 