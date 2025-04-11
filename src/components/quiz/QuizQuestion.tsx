import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { QuizQuestionProps } from '../../types/quiz';
import { QuizAnswer } from './QuizAnswer';

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  onAnswer,
  selectedAnswers,
  isSubmitting
}) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* En-tête de la question */}
        <View style={styles.header}>
          <View style={styles.typeBadge}>
            <MaterialCommunityIcons
              name={question.type === 'single' ? 'radiobox-marked' : 'checkbox-marked'}
              size={16}
              color="#fff"
            />
            <Text style={styles.typeText}>
              {question.type === 'single' ? 'Question unique' : 'Question multiple'}
            </Text>
          </View>
          <Text style={styles.points}>
            {question.points} points
          </Text>
        </View>

        {/* Texte de la question */}
        <Text style={styles.questionText}>
          {question.text}
        </Text>

        {/* Réponses */}
        <View style={styles.answersContainer}>
          {question.answers.map((answer) => (
            <QuizAnswer
              key={answer.id}
              answer={answer}
              isSelected={selectedAnswers.includes(answer.id)}
              isCorrect={isSubmitting ? answer.isCorrect : undefined}
              onSelect={() => {
                if (question.type === 'single') {
                  onAnswer([answer.id]);
                } else {
                  const newAnswers = selectedAnswers.includes(answer.id)
                    ? selectedAnswers.filter(id => id !== answer.id)
                    : [...selectedAnswers, answer.id];
                  onAnswer(newAnswers);
                }
              }}
              disabled={isSubmitting}
            />
          ))}
        </View>

        {/* Explication (si disponible) */}
        {question.explanation && (
          <View style={styles.explanationContainer}>
            <MaterialCommunityIcons name="information" size={20} color="#06D001" />
            <Text style={styles.explanationText}>
              {question.explanation}
            </Text>
          </View>
        )}
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
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
  },
  typeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  points: {
    fontSize: 14,
    color: '#06D001',
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
    lineHeight: 24,
  },
  answersContainer: {
    gap: 12,
  },
  explanationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  explanationText: {
    flex: 1,
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
}); 