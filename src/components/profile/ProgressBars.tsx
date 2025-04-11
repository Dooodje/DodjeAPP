import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserProfile } from '../../types/profile';

interface ProgressBarsProps {
  profile: UserProfile;
}

export const ProgressBars: React.FC<ProgressBarsProps> = ({ profile }) => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progression</Text>
      {renderProgressBar(
        'bourse',
        profile.progress.bourse.percentage,
        profile.progress.bourse.completedCourses,
        profile.progress.bourse.totalCourses
      )}
      {renderProgressBar(
        'crypto',
        profile.progress.crypto.percentage,
        profile.progress.crypto.completedCourses,
        profile.progress.crypto.totalCourses
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0400',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
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