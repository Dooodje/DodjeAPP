import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { QuizResultProps } from '../../types/quiz';

export const QuizResult: React.FC<QuizResultProps> = ({
  quiz,
  score,
  answers,
  onRetry,
  onNext
}) => {
  const percentage = (score / quiz.totalPoints) * 100;
  const isPassed = score >= quiz.passingScore;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* En-tête du résultat */}
        <View style={styles.header}>
          <View style={[
            styles.scoreContainer,
            isPassed ? styles.passedContainer : styles.failedContainer
          ]}>
            <MaterialCommunityIcons
              name={isPassed ? 'trophy' : 'emoticon-sad'}
              size={48}
              color="#fff"
            />
            <Text style={styles.scoreText}>
              {score} / {quiz.totalPoints}
            </Text>
            <Text style={styles.percentageText}>
              {percentage.toFixed(1)}%
            </Text>
          </View>

          <Text style={styles.resultText}>
            {isPassed ? 'Félicitations !' : 'Continuez vos efforts !'}
          </Text>
        </View>

        {/* Récompense */}
        {isPassed && (
          <View style={styles.rewardContainer}>
            <MaterialCommunityIcons name="currency-dodji" size={24} color="#06D001" />
            <Text style={styles.rewardText}>
              +{quiz.dodjiReward} Dodji
            </Text>
          </View>
        )}

        {/* Résumé des réponses */}
        <View style={styles.answersSummary}>
          <Text style={styles.sectionTitle}>Résumé des réponses</Text>
          {Object.entries(answers).map(([questionId, answerIds]) => {
            const question = quiz.questions.find(q => q.id === questionId);
            if (!question) return null;

            const isCorrect = answerIds.every(id => {
              const answer = question.answers.find(a => a.id === id);
              return answer?.isCorrect;
            });

            return (
              <View key={questionId} style={styles.answerItem}>
                <View style={styles.answerHeader}>
                  <MaterialCommunityIcons
                    name={isCorrect ? 'check-circle' : 'close-circle'}
                    size={20}
                    color={isCorrect ? '#06D001' : '#FF3B30'}
                  />
                  <Text style={styles.questionText}>
                    {question.text}
                  </Text>
                </View>
                <Text style={styles.pointsText}>
                  {isCorrect ? question.points : 0} points
                </Text>
              </View>
            );
          })}
        </View>

        {/* Boutons d'action */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.retryButton]}
            onPress={onRetry}
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.buttonText}>Réessayer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.nextButton]}
            onPress={onNext}
          >
            <Text style={styles.buttonText}>Continuer</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  content: {
    padding: 16,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 16,
  },
  scoreContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  passedContainer: {
    backgroundColor: '#06D001',
  },
  failedContainer: {
    backgroundColor: '#FF3B30',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  percentageText: {
    fontSize: 16,
    color: '#fff',
  },
  resultText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#fff',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#06D001',
  },
  answersSummary: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
  },
  answerItem: {
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    gap: 8,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  pointsText: {
    fontSize: 12,
    color: '#06D001',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 8,
  },
  retryButton: {
    backgroundColor: '#2A2A2A',
  },
  nextButton: {
    backgroundColor: '#06D001',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
}); 