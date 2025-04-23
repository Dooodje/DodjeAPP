import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type LevelType = 'debutant' | 'avance' | 'expert';

interface LevelSelectorProps {
  selectedLevel: LevelType;
  onLevelChange: (level: LevelType) => void;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({
  selectedLevel,
  onLevelChange
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.selectorContainer}>
        <TouchableOpacity
          style={[
            styles.levelButton,
            selectedLevel === 'debutant' && styles.selectedLevelButton
          ]}
          onPress={() => onLevelChange('debutant')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.levelText,
            selectedLevel === 'debutant' && styles.selectedLevelText
          ]}>
            Débutant
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.levelButton,
            selectedLevel === 'avance' && styles.selectedLevelButton
          ]}
          onPress={() => onLevelChange('avance')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.levelText,
            selectedLevel === 'avance' && styles.selectedLevelText
          ]}>
            Avancé
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.levelButton,
            selectedLevel === 'expert' && styles.selectedLevelButton
          ]}
          onPress={() => onLevelChange('expert')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.levelText,
            selectedLevel === 'expert' && styles.selectedLevelText
          ]}>
            Expert
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    padding: 6,
    width: 300,
  },
  levelButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  selectedLevelButton: {
    backgroundColor: '#F3FF90',
  },
  levelText: {
    fontSize: 14,
    fontFamily: 'Arboria-Medium',
    color: '#FFFFFF',
  },
  selectedLevelText: {
    color: '#0A0400',
    fontFamily: 'Arboria-Bold',
  },
});

export default LevelSelector; 