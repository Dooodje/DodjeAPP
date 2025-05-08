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
const QuizHeader = ({ onBack, questionNumber, totalQuestions }: { 
  onBack: () => void;
  questionNumber: number;
  totalQuestions: number;
}) => (
  <View style={styles.headerContainer}>
    <Text style={styles.headerTitle}>Question {questionNumber}</Text>
    <TouchableOpacity style={styles.closeButton} onPress={onBack}>
      <MaterialIcons name="close" size={24} color="#FFFFFF" />
    </TouchableOpacity>
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

// Composant pour le popup d'explication
const ExplanationPopup = ({ 
  isVisible, 
  explanation, 
  onClose,
  isCorrect
}: { 
  isVisible: boolean; 
  explanation: string;
  onClose: () => void;
  isCorrect: boolean;
}) => {
  if (!isVisible) return null;
  
  return (
    <View style={styles.explanationOverlay}>
      <View style={styles.explanationPopup}>
        <View style={styles.explanationContent}>
          <View style={[
            styles.explanationHeader,
            isCorrect ? styles.correctHeader : styles.incorrectHeader
          ]}>
            <MaterialIcons 
              name={isCorrect ? "check-circle" : "close"} 
              size={20} 
              color={isCorrect ? "#06D001" : "#FF3B30"} 
            />
            <Text style={[
              styles.explanationHeaderText,
              isCorrect ? styles.correctHeaderText : styles.incorrectHeaderText
            ]}>
              {isCorrect ? "Bonne réponse" : "Mauvaise réponse"}
            </Text>
          </View>
          <Text style={styles.explanationPopupText}>{explanation}</Text>
        </View>
      </View>
    </View>
  );
};

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
  return (
    <TouchableOpacity 
      style={[
        styles.answerContainer,
        selected && styles.selectedAnswer,
        showResult && answer.isCorrect && styles.correctAnswer,
        showResult && selected && !answer.isCorrect && styles.wrongAnswer
      ]} 
      onPress={onSelect}
      disabled={showResult}
    >
      <View style={[
        styles.answerCheckbox,
        selected && styles.selectedCheckbox
      ]}>
        {selected && (
          <View style={styles.checkboxInner} />
        )}
      </View>
      <Text style={[
        styles.answerText,
        selected && styles.selectedAnswerText,
        showResult && answer.isCorrect && styles.correctAnswerText,
        showResult && selected && !answer.isCorrect && styles.wrongAnswerText
      ]}>
        {answer.text}
      </Text>
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
    console.log('Fermeture du quiz');
    // Utiliser la méthode dismiss pour fermer la modal
    router.dismiss();
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
        <View style={styles.introHeader}>
          <Text style={styles.introTitle}>Quiz</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleBackPress}>
            <MaterialIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.introContent}>
          <Text style={styles.quizTitle}>{quiz.titre || quiz.title}</Text>
          
          <Text style={styles.quizDescription}>{quiz.description}</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <MaterialIcons name="help" size={20} color="#FFFFFF" />
              <Text style={styles.infoText}>{quiz.questions?.length || 0} questions</Text>
            </View>
            
            <View style={styles.infoItem}>
              <MaterialIcons name="stars" size={20} color="#FFFFFF" />
              <Text style={styles.infoText}>Seuil de réussite : 70%</Text>
            </View>
            
            <View style={styles.infoItem}>
              <MaterialIcons name="monetization-on" size={20} color="#06D001" />
              <Text style={styles.infoText}>{quiz.tokenReward || quiz.dodjiReward || 0} Dodji à gagner</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.introActionContainer}>
          <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
            <Text style={styles.startButtonText}>Commencer le quiz</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#000000" />
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

    const hasSelectedAnswer = answers[question.id]?.length > 0;
    const isMultipleChoice = question.type === 'multiple';
    
    // Vérifier si la réponse est correcte
    const isAnswerCorrect = () => {
      const userAnswers = answers[question.id] || [];
      const correctAnswers = question.answers
        .filter(answer => answer.isCorrect)
        .map(answer => answer.id);
      
      return correctAnswers.length > 0 && 
             userAnswers.length === correctAnswers.length &&
             correctAnswers.every(id => userAnswers.includes(id));
    };
    
    return (
      <View style={styles.questionContainer}>
        <QuizProgress 
          current={currentQuestionIndex + 1} 
          total={quiz.questions.length} 
        />
        
        <ScrollView style={styles.questionScroll}>
          <Text style={styles.questionText}>{question.text}</Text>
          {isMultipleChoice && (
            <Text style={styles.multipleChoiceText}>
              Il peut y avoir une ou plusieurs réponse(s) correcte(s)
            </Text>
          )}
          
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
        </ScrollView>
        
        <ExplanationPopup 
          isVisible={showAnswer}
          explanation={question.explanation || ""}
          onClose={nextQuestion}
          isCorrect={isAnswerCorrect()}
        />
        
        <View style={styles.actionContainer}>
          {!showAnswer ? (
            <TouchableOpacity 
              style={[
                styles.validateButton,
                hasSelectedAnswer ? styles.validateButtonActive : styles.validateButtonInactive
              ]} 
              onPress={validateAnswer}
            >
              <Text style={[
                styles.validateButtonText,
                hasSelectedAnswer ? styles.validateButtonTextActive : styles.validateButtonTextInactive
              ]}>Réponse</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.nextQuestionButton} 
              onPress={nextQuestion}
            >
              <Text style={styles.nextQuestionButtonText}>
                {currentQuestionIndex < quiz.questions.length - 1 
                  ? "Question suivante" 
                  : "Voir les résultats"}
              </Text>
              <MaterialIcons name="arrow-forward" size={16} color="#000000" />
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
        <View style={styles.introHeader}>
          <Text style={styles.introTitle}>Résultats</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleBackPress}>
            <MaterialIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.resultContent}>
          <View style={[
            styles.resultStatusContainer,
            isPassed ? styles.resultStatusSuccess : styles.resultStatusFail
          ]}>
            <MaterialIcons 
              name={isPassed ? "check-circle" : "cancel"} 
              size={40} 
              color={isPassed ? "#06D001" : "#FF3B30"} 
            />
            <Text style={[
              styles.resultStatusText,
              isPassed ? styles.resultStatusTextSuccess : styles.resultStatusTextFail
            ]}>
              {isPassed ? "Quiz réussi !" : "Quiz échoué"}
            </Text>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Votre score</Text>
            <Text style={styles.scoreValue}>
              {score}/{totalPoints}
            </Text>
            <Text style={styles.scorePercentage}>
              {Math.round(scorePercentage)}%
            </Text>
          </View>

          <View style={styles.resultInfoContainer}>
            <Text style={styles.resultMessage}>
              {isPassed 
                ? `Félicitations ! Vous avez obtenu un score supérieur à ${passingScore}%${hasEarnedReward ? ` et gagné ${rewardAmount} Dodji !` : ' !'}`
                : `Vous devez obtenir au moins ${passingScore}% pour réussir le quiz. N'hésitez pas à revoir le contenu du cours et à réessayer.`
              }
            </Text>

            {isPassed && hasEarnedReward && (
              <View style={styles.rewardInfoContainer}>
                <MaterialIcons name="emoji-events" size={24} color="#06D001" />
                <Text style={styles.rewardInfoText}>
                  +{rewardAmount} Dodji
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.resultActionsContainer}>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={retryQuiz}
          >
            <MaterialIcons name="replay" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quitButton} 
            onPress={handleBackPress}
          >
            <Text style={styles.quitButtonText}>Quitter</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <>
      <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
        {currentState === QuizState.QUESTION && (
          <QuizHeader 
            onBack={handleBackPress}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={quiz?.questions?.length || 0}
          />
        )}
        
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0A0400',
  },
  headerTitle: {
    fontSize: 50,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    letterSpacing: -2.5,
  },
  closeButton: {
    padding: 8,
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
  
  introContainer: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  introTitle: {
    fontSize: 50,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    letterSpacing: -2.5,
  },
  introContent: {
    flex: 1,
    padding: 20,
  },
  quizTitle: {
    color: '#FFFFFF',
    fontSize: 40,
    fontFamily: 'Arboria-Bold',
    marginBottom: 16,
    letterSpacing: -1,
  },
  quizDescription: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 28,
    fontFamily: 'Arboria-Medium',
    marginBottom: 32,
    opacity: 0.8,
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Arboria-Medium',
  },
  introActionContainer: {
    padding: 20,
    paddingBottom: 34,
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 50,
    gap: 8,
  },
  startButtonText: {
    color: '#000000',
    fontSize: 15,
    fontFamily: 'Arboria-Bold',
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
    backgroundColor: '#0A0400',
  },
  questionScroll: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  questionText: {
    fontSize: 40,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -1,
  },
  multipleChoiceText: {
    fontSize: 11,
    fontFamily: 'Arboria-Bold',
    color: '#0A0400',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 15,
    overflow: 'hidden',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  answersContainer: {
    gap: 10,
    padding: 10,
    marginBottom: 0,
  },
  answerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    gap: 24,
  },
  selectedAnswer: {
    backgroundColor: 'rgba(6, 208, 1, 0.1)',
    borderColor: '#06D001',
    borderWidth: 1,
  },
  answerCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckbox: {
    borderColor: '#06D001',
    backgroundColor: '#06D001',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  answerText: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Arboria-Medium',
    color: '#FFFFFF',
  },
  selectedAnswerText: {
    color: '#FFFFFF',
  },
  correctAnswer: {
    backgroundColor: 'rgba(6, 208, 1, 0.1)',
    borderColor: '#06D001',
    borderWidth: 1,
  },
  wrongAnswer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  correctAnswerText: {
    color: '#06D001',
  },
  wrongAnswerText: {
    color: '#FF3B30',
  },
  actionContainer: {
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  validateButton: {
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  validateButtonActive: {
    backgroundColor: '#06D001',
  },
  validateButtonInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  validateButtonText: {
    fontSize: 15,
    fontFamily: 'Arboria-Bold',
  },
  validateButtonTextActive: {
    color: '#000000',
  },
  validateButtonTextInactive: {
    color: '#FFFFFF',
  },
  nextQuestionButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 50,
    gap: 8,
  },
  nextQuestionButtonText: {
    color: '#000000',
    fontSize: 15,
    fontFamily: 'Arboria-Bold',
  },
  
  // Styles pour les résultats
  resultContainer: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  resultContent: {
    flex: 1,
    padding: 20,
  },
  resultStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderRadius: 15,
    marginBottom: 32,
  },
  resultStatusSuccess: {
    backgroundColor: 'rgba(6, 208, 1, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#06D001',
  },
  resultStatusFail: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
  },
  resultStatusText: {
    fontSize: 24,
    fontFamily: 'Arboria-Bold',
  },
  resultStatusTextSuccess: {
    color: '#06D001',
  },
  resultStatusTextFail: {
    color: '#FF3B30',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Arboria-Medium',
    opacity: 0.8,
    marginBottom: 8,
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 50,
    fontFamily: 'Arboria-Bold',
    letterSpacing: -2.5,
  },
  scorePercentage: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Arboria-Bold',
    opacity: 0.8,
  },
  resultInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
  },
  resultMessage: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 28,
    fontFamily: 'Arboria-Medium',
    marginBottom: 16,
  },
  rewardInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(6, 208, 1, 0.1)',
    padding: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  rewardInfoText: {
    color: '#06D001',
    fontSize: 18,
    fontFamily: 'Arboria-Bold',
  },
  resultActionsContainer: {
    padding: 20,
    paddingBottom: 34,
    gap: 12,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 50,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Arboria-Bold',
  },
  quitButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 50,
    gap: 8,
  },
  quitButtonText: {
    color: '#000000',
    fontSize: 15,
    fontFamily: 'Arboria-Bold',
  },
  explanationOverlay: {
    position: 'absolute',
    bottom: 160,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  explanationPopup: {
    backgroundColor: '#0A0400',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    margin: 20,
    minHeight: 100,
    maxHeight: '50%',
  },
  explanationContent: {
    gap: 12,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  correctHeader: {
    backgroundColor: 'rgba(6, 208, 1, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#06D001',
  },
  incorrectHeader: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
  },
  explanationHeaderText: {
    fontSize: 15,
    fontFamily: 'Arboria-Medium',
  },
  correctHeaderText: {
    color: '#06D001',
  },
  incorrectHeaderText: {
    color: '#FF3B30',
  },
  explanationPopupText: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 28,
    fontFamily: 'Arboria-Medium',
  },
  explanationCloseButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 50,
    gap: 8,
    marginTop: 20,
  },
  explanationCloseButtonText: {
    color: '#000000',
    fontSize: 15,
    fontFamily: 'Arboria-Bold',
  },
}); 