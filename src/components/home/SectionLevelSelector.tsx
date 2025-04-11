import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Section, Level } from '../../types/home';

interface SectionLevelSelectorProps {
  currentSection: Section;
  currentLevel: Level;
  onSectionChange: (section: Section) => void;
  onLevelChange: (level: Level) => void;
}

const SECTIONS: { value: Section; label: string }[] = [
  { value: 'bourse', label: 'Bourse' },
  { value: 'crypto', label: 'Crypto' },
];

const LEVELS: { value: Level; label: string }[] = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'avance', label: 'Avancé' },
  { value: 'expert', label: 'Expert' },
];

export const SectionLevelSelector: React.FC<SectionLevelSelectorProps> = ({
  currentSection,
  currentLevel,
  onSectionChange,
  onLevelChange,
}) => {
  return (
    <View style={styles.container}>
      {/* Sélection de la section */}
      <View style={styles.sectionContainer}>
        {SECTIONS.map(section => (
          <TouchableOpacity
            key={section.value}
            style={[
              styles.sectionButton,
              currentSection === section.value && styles.activeButton,
            ]}
            onPress={() => onSectionChange(section.value)}
          >
            <Text
              style={[
                styles.sectionText,
                currentSection === section.value && styles.activeText,
              ]}
            >
              {section.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sélection du niveau */}
      <View style={styles.levelContainer}>
        {LEVELS.map(level => (
          <TouchableOpacity
            key={level.value}
            style={[
              styles.levelButton,
              currentLevel === level.value && styles.activeButton,
            ]}
            onPress={() => onLevelChange(level.value)}
          >
            <Text
              style={[
                styles.levelText,
                currentLevel === level.value && styles.activeText,
              ]}
            >
              {level.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sectionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
  },
  levelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
  },
  activeButton: {
    backgroundColor: '#059212',
  },
  sectionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  activeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
}); 