import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserProfile } from '../../types/profile';
import { ProgressUpdateButton } from './ProgressUpdateButton';

interface ProgressBarsProps {
  profile: UserProfile;
}

export const ProgressBars: React.FC<ProgressBarsProps> = ({ profile }) => {
  // Vérifier si les données de progression sont disponibles et fournir des valeurs par défaut si nécessaire
  const getProgressData = (category: 'bourse' | 'crypto') => {
    // Vérifier si progress existe
    if (!profile.progress) {
      return { percentage: 0, completedCourses: 0, totalCourses: 0 };
    }
    
    // Vérifier si la catégorie existe
    if (!profile.progress[category]) {
      return { percentage: 0, completedCourses: 0, totalCourses: 0 };
    }
    
    const { percentage = 0, completedCourses = 0, totalCourses = 0 } = profile.progress[category];
    return { percentage, completedCourses, totalCourses };
  };

  const renderProgressBar = (
    category: 'bourse' | 'crypto',
    percentage: number,
    completed: number,
    total: number
  ) => {
    const color = category === 'bourse' ? '#06D001' : '#9BEC00';

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <MaterialCommunityIcons
            name={category === 'bourse' ? 'chart-line' : 'bitcoin'}
            size={20}
            color={color}
          />
          <Text style={styles.categoryText}>
            {category === 'bourse' ? 'Bourse' : 'Crypto'}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${percentage}%`, backgroundColor: color }
            ]}
          />
        </View>
        <View style={styles.progressFooter}>
          <Text style={styles.progressText}>
            {completed}/{total} cours complétés
          </Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
      </View>
    );
  };

  // Récupérer les données de progression avec des valeurs par défaut
  const bourseData = getProgressData('bourse');
  const cryptoData = getProgressData('crypto');

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Progression</Text>
        <ProgressUpdateButton 
          onUpdateComplete={() => console.log('Progression mise à jour avec succès')}
        />
      </View>
      {renderProgressBar(
        'bourse',
        bourseData.percentage,
        bourseData.completedCourses,
        bourseData.totalCourses
      )}
      {renderProgressBar(
        'crypto',
        cryptoData.percentage,
        cryptoData.completedCourses,
        cryptoData.totalCourses
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0400',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
}); 