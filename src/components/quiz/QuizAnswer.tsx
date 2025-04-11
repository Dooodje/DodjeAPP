import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { QuizAnswerProps } from '../../types/quiz';

export const QuizAnswer: React.FC<QuizAnswerProps> = ({
  answer,
  isSelected,
  isCorrect,
  onSelect,
  disabled
}) => {
  const getBackgroundColor = () => {
    if (disabled) {
      if (isCorrect) return '#06D001';
      if (isSelected && !isCorrect) return '#FF3B30';
      return '#2A2A2A';
    }
    return isSelected ? '#1A1A1A' : '#2A2A2A';
  };

  const getBorderColor = () => {
    if (disabled) {
      if (isCorrect) return '#06D001';
      if (isSelected && !isCorrect) return '#FF3B30';
      return '#2A2A2A';
    }
    return isSelected ? '#06D001' : '#2A2A2A';
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor()
        }
      ]}
      onPress={onSelect}
      disabled={disabled}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {disabled ? (
            <MaterialCommunityIcons
              name={isCorrect ? 'check-circle' : 'close-circle'}
              size={24}
              color={isCorrect ? '#06D001' : '#FF3B30'}
            />
          ) : (
            <MaterialCommunityIcons
              name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
              size={24}
              color={isSelected ? '#06D001' : '#fff'}
            />
          )}
        </View>

        <Text style={[
          styles.text,
          disabled && isCorrect && styles.correctText,
          disabled && isSelected && !isCorrect && styles.incorrectText
        ]}>
          {answer.text}
        </Text>
      </View>

      {answer.explanation && disabled && (
        <Text style={styles.explanation}>
          {answer.explanation}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  correctText: {
    color: '#06D001',
  },
  incorrectText: {
    color: '#FF3B30',
  },
  explanation: {
    marginTop: 8,
    fontSize: 14,
    color: '#ccc',
    fontStyle: 'italic',
  },
}); 