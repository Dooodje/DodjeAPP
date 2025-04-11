import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CourseNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  isFirstContent: boolean;
  isLastContent: boolean;
}

export const CourseNavigation: React.FC<CourseNavigationProps> = ({
  onPrevious,
  onNext,
  isFirstContent,
  isLastContent,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isFirstContent && styles.buttonDisabled]}
        onPress={onPrevious}
        disabled={isFirstContent}
      >
        <MaterialCommunityIcons
          name="chevron-left"
          size={32}
          color={isFirstContent ? '#666666' : '#FFFFFF'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isLastContent && styles.buttonDisabled]}
        onPress={onNext}
        disabled={isLastContent}
      >
        <MaterialCommunityIcons
          name="chevron-right"
          size={32}
          color={isLastContent ? '#666666' : '#FFFFFF'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    margin: 16,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#1A1A1A',
  },
}); 