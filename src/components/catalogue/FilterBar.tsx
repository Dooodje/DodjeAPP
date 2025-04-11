import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemeFilter, LevelFilter } from '../../hooks/useCatalogue';

interface FilterBarProps {
  currentTheme: ThemeFilter;
  currentLevel: LevelFilter;
  onThemeChange: (theme: ThemeFilter) => void;
  onLevelChange: (level: LevelFilter) => void;
}

const THEMES: { id: ThemeFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'bourse', label: 'Bourse' },
  { id: 'crypto', label: 'Crypto' },
];

const LEVELS: { id: LevelFilter; label: string }[] = [
  { id: 'all', label: 'Tous niveaux' },
  { id: 'debutant', label: 'Débutant' },
  { id: 'avance', label: 'Avancé' },
  { id: 'expert', label: 'Expert' },
];

const FilterBar: React.FC<FilterBarProps> = ({
  currentTheme,
  currentLevel,
  onThemeChange,
  onLevelChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Thème</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {THEMES.map((theme) => (
          <TouchableOpacity 
            key={theme.id}
            style={[
              styles.filterItem, 
              currentTheme === theme.id && styles.activeFilter
            ]}
            onPress={() => onThemeChange(theme.id)}
          >
            <Text 
              style={[
                styles.filterText, 
                currentTheme === theme.id && styles.activeFilterText
              ]}
            >
              {theme.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <Text style={styles.sectionTitle}>Niveau</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {LEVELS.map((level) => (
          <TouchableOpacity 
            key={level.id}
            style={[
              styles.filterItem, 
              currentLevel === level.id && styles.activeFilter
            ]}
            onPress={() => onLevelChange(level.id)}
          >
            <Text 
              style={[
                styles.filterText, 
                currentLevel === level.id && styles.activeFilterText
              ]}
            >
              {level.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Arboria-Medium',
    color: '#FFF',
    marginBottom: 8,
    marginTop: 5,
  },
  filtersContainer: {
    paddingRight: 15,
    paddingBottom: 15,
  },
  filterItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  activeFilter: {
    backgroundColor: '#059212',
    borderColor: '#059212',
  },
  filterText: {
    color: '#CCC',
    fontFamily: 'Arboria-Book',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#FFF',
    fontFamily: 'Arboria-Medium',
  },
});

export default FilterBar; 