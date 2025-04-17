import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserProfile } from '../../types/profile';

interface ProgressCirclesProps {
  profile: UserProfile;
}

export const ProgressCircles: React.FC<ProgressCirclesProps> = ({ profile }) => {
  // Ensure progress data exists with safe defaults
  const getProgressData = (category: 'bourse' | 'crypto') => {
    if (!profile.progress || !profile.progress[category]) {
      return { percentage: 0 };
    }
    
    return { 
      percentage: profile.progress[category].percentage || 0 
    };
  };

  const bourseProgress = getProgressData('bourse');
  const cryptoProgress = getProgressData('crypto');

  // Render a circular progress indicator
  const renderProgressCircle = (percentage: number, label: string) => {
    // Calculate the circle's path
    const size = 100;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.circleContainer}>
          {/* Background Circle */}
          <View style={[styles.circle, styles.backgroundCircle]} />
          
          {/* Foreground Circle (SVG would be better, but using View for simplicity) */}
          <View style={styles.progressCircleContainer}>
            <View 
              style={[
                styles.progressCircle,
                {
                  borderWidth: 5,
                  borderColor: '#9BEC00',
                  backgroundColor: 'transparent',
                  // Using opacity to simulate partial circle
                  opacity: percentage / 100,
                }
              ]} 
            />
          </View>
          
          {/* Percentage Text */}
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
        <Text style={styles.labelText}>{label}</Text>
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
    marginVertical: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  circleContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  circle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    position: 'absolute',
  },
  backgroundCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressCircleContainer: {
    width: 90,
    height: 90,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  percentageText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  labelText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 5,
  },
}); 