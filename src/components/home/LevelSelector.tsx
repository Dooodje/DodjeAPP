import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import theme from '../../config/theme';

type LevelType = 'debutant' | 'avance' | 'expert';

interface LevelSelectorProps {
  selectedLevel: LevelType;
  onLevelChange: (level: LevelType) => void;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({
  selectedLevel,
  onLevelChange
}) => {
  // Calcul de la position de l'indicateur de sélection
  const getIndicatorPosition = () => {
    switch (selectedLevel) {
      case 'debutant':
        return 0;
      case 'avance':
        return 100;
      case 'expert':
        return 200;
      default:
        return 0;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.selectorContainer}>
        <Animated.View 
          style={[
            styles.selectionIndicator, 
            { transform: [{ translateX: getIndicatorPosition() }] }
          ]} 
        />
        <TouchableOpacity
          style={styles.levelButton}
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
          style={styles.levelButton}
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
          style={styles.levelButton}
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
    width: 300,
    height: 40,
    flexDirection: 'row',
    backgroundColor: theme.colors.background.light,
    borderRadius: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  selectionIndicator: {
    position: 'absolute',
    width: 100,
    height: 40,
    backgroundColor: theme.colors.primary.main,
    borderRadius: 30,
    zIndex: 1,
  },
  levelButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  selectedLevelText: {
    color: theme.colors.text.highlight,
    fontWeight: '700',
  },
});

export default LevelSelector; 