import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuiz } from '../../hooks/useQuiz';
import { QuizHeader } from '../../components/quiz/QuizHeader';
import { QuizProgress } from '../../components/quiz/QuizProgress';
import { QuizQuestion } from '../../components/quiz/QuizQuestion';
import { QuizResult } from '../../components/quiz/QuizResult';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import MediaError from '../../components/ui/MediaError';

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const {
    currentQuiz,
    currentQuestionIndex,
    answers,
    score,
    timeRemaining,
    isSubmitting,
    isLoading,
    error,
    isShowingResults,
    answerQuestion,
    nextQuestion,
    submitQuiz,
    reset
  } = useQuiz(id as string, 'userId'); // TODO: Remplacer 'userId' par l'ID réel de l'utilisateur

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error || !currentQuiz) {
    return (
      <View style={styles.container}>
        <MediaError
          message={error || 'Quiz non trouvé'}
          onRetry={() => reset()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <QuizHeader
        quiz={currentQuiz}
        onBack={() => router.back()}
      />

      {!isShowingResults ? (
        <>
          <QuizProgress
            currentIndex={currentQuestionIndex}
            totalQuestions={currentQuiz.questions.length}
            timeRemaining={timeRemaining}
          />

          <QuizQuestion
            question={currentQuiz.questions[currentQuestionIndex]}
            onAnswer={(answerIds) => {
              answerQuestion(currentQuiz.questions[currentQuestionIndex].id, answerIds);
              if (currentQuestionIndex < currentQuiz.questions.length - 1) {
                nextQuestion();
              } else {
                submitQuiz();
              }
            }}
            selectedAnswers={answers[currentQuiz.questions[currentQuestionIndex].id] || []}
            isSubmitting={isSubmitting}
          />
        </>
      ) : (
        <QuizResult
          quiz={currentQuiz}
          score={score}
          answers={answers}
          onRetry={() => reset()}
          onNext={() => router.back()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
}); 