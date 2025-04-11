import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CourseProgress as CourseProgressType } from '../../types/course';

interface CourseProgressProps {
  progress: CourseProgressType;
  totalContents: number;
}

export const CourseProgress: React.FC<CourseProgressProps> = ({
  progress,
  totalContents,
}) => {
  const completedContents = progress.completedContents.length;
  const currentContentIndex = progress.currentContentIndex;

  return (
    <View style={styles.container}>
      {/* Barre de progression */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${(completedContents / totalContents) * 100}%`,
            },
          ]}
        />
      </View>

      {/* Informations de progression */}
      <View style={styles.progressInfo}>
        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Progression</Text>
          <Text style={styles.progressValue}>{Math.round(progress.totalProgress)}%</Text>
        </View>
        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Contenu actuel</Text>
          <Text style={styles.progressValue}>
            {currentContentIndex + 1}/{totalContents}
          </Text>
        </View>
        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Contenus complétés</Text>
          <Text style={styles.progressValue}>
            {completedContents}/{totalContents}
          </Text>
        </View>
      </View>

      {/* Dernière mise à jour */}
      <Text style={styles.lastUpdate}>
        Dernière mise à jour :{' '}
        {new Date(progress.lastAccessedAt).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#059212',
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 4,
    fontFamily: 'Arboria-Light',
  },
  progressValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Arboria-Bold',
  },
  lastUpdate: {
    fontSize: 12,
    color: '#A0A0A0',
    textAlign: 'center',
    fontFamily: 'Arboria-Light',
  },
}); 