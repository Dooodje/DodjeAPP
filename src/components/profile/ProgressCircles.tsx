import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { UserProfile } from '../../types/profile';
import { useProfileProgress } from '../../hooks/useProfileProgress';
import { useAuth } from '../../hooks/useAuth';
import Svg, { Circle } from 'react-native-svg';

interface ProgressCirclesProps {
  profile: UserProfile;
}

export const ProgressCircles: React.FC<ProgressCirclesProps> = ({ profile }) => {
  const { user } = useAuth();
  const { progress, isLoading, error } = useProfileProgress(user?.uid || '');

  // Utiliser les données en temps réel si disponibles, sinon fallback sur le profil
  const progressData = progress || profile.progress;

  // Ensure progress data exists with safe defaults
  const getProgressData = (category: 'bourse' | 'crypto') => {
    if (!progressData || !progressData[category]) {
      return { percentage: 0 };
    }
    
    return { 
      percentage: progressData[category].percentage || 0 
    };
  };

  const bourseProgress = getProgressData('bourse');
  const cryptoProgress = getProgressData('crypto');

  // Render a circular progress indicator
  const renderProgressCircle = (percentage: number, label: string) => {
    const size = 120;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.circleContainer}>
          <Svg width={size} height={size}>
          {/* Background Circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={strokeWidth}
              fill="none"
            />
          
            {/* Progress Circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#9BEC00"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          
          {/* Percentage Text */}
          <View style={styles.percentageContainer}>
            {isLoading ? (
              <ActivityIndicator color="#9BEC00" size="small" />
            ) : (
              <Text style={styles.percentageText}>{percentage}%</Text>
            )}
          </View>
        </View>
        <Text style={styles.labelText}>{label}</Text>
        {error && (
          <Text style={styles.errorText}>Erreur de synchronisation</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderProgressCircle(bourseProgress.percentage, 'Bourse')}
      {renderProgressCircle(cryptoProgress.percentage, 'Crypto')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  circleContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  percentageContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Arboria-Bold',
  },
  labelText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Arboria-Medium',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontFamily: 'Arboria-Medium',
    marginTop: 4,
  },
}); 