import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Level } from '../../types/home';

interface LevelSelectorProps {
  currentLevel: Level;
  onLevelChange: (level: Level) => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  currentLevel,
  onLevelChange
}) => {
  const levels: Level[] = ['Débutant', 'Avancé', 'Expert'];

  return (
    <View style={styles.container}>
      {levels.map((level) => (
        <TouchableOpacity
          key={level}
          style={[
            styles.levelButton,
            currentLevel === level && styles.activeButton
          ]}
          onPress={() => onLevelChange(level)}
        >
          <Text
            style={[
              styles.levelText,
              currentLevel === level && styles.activeText
            ]}
          >
            {level}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 4,
  },
  levelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeButton: {
    backgroundColor: '#059212',
  },
  levelText: {
    color: '#888888',
    fontFamily: 'Arboria-Medium',
    fontSize: 14,
  },
  activeText: {
    color: '#FFFFFF',
    fontFamily: 'Arboria-Bold',
  },
}); 