import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Section } from '../../types/home';

interface SectionSelectorProps {
  currentSection: Section;
  onSectionChange: (section: Section) => void;
}

export const SectionSelector: React.FC<SectionSelectorProps> = ({ 
  currentSection, 
  onSectionChange 
}) => {
  const sections: Section[] = ['Bourse', 'Crypto'];

  return (
    <View style={styles.container}>
      {sections.map((section) => (
        <TouchableOpacity
          key={section}
          style={[
            styles.sectionButton,
            currentSection === section && styles.activeButton
          ]}
          onPress={() => onSectionChange(section)}
        >
          <MaterialCommunityIcons
            name={section === 'Bourse' ? 'chart-line' : 'bitcoin'}
            size={20}
            color={currentSection === section ? '#FFFFFF' : '#888888'}
          />
          <Text
            style={[
              styles.sectionText,
              currentSection === section && styles.activeText
            ]}
          >
            {section}
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
    marginRight: 8,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeButton: {
    backgroundColor: '#059212',
  },
  sectionText: {
    color: '#888888',
    marginLeft: 4,
    fontFamily: 'Arboria-Medium',
    fontSize: 14,
  },
  activeText: {
    color: '#FFFFFF',
    fontFamily: 'Arboria-Bold',
  },
}); 