import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useDodji } from '../../hooks/useDodji';

interface UserStatsProps {
  streak: number;
  totalProgress: number;
  totalCompletedCourses: number;
}

export const UserStats: React.FC<UserStatsProps> = ({
  streak,
  totalProgress,
  totalCompletedCourses
}) => {
  const { user } = useAuth();
  const { dodji } = useDodji(user?.uid);

  return (
    <View style={styles.container}>
      {/* Streak */}
      <View style={styles.statContainer}>
        <MaterialCommunityIcons name="fire" size={24} color="#FF6B6B" />
        <Text style={styles.statValue}>{streak}</Text>
        <Text style={styles.statLabel}>Jours</Text>
      </View>

      {/* Dodji */}
      <View style={styles.statContainer}>
        <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
        <Text style={styles.statValue}>{dodji}</Text>
        <Text style={styles.statLabel}>Dodji</Text>
      </View>

      {/* Progression totale */}
      <View style={styles.statContainer}>
        <MaterialCommunityIcons name="chart-line" size={24} color="#06D001" />
        <Text style={styles.statValue}>{Math.round(totalProgress)}%</Text>
        <Text style={styles.statLabel}>Progression</Text>
      </View>

      {/* Parcours complétés */}
      <View style={styles.statContainer}>
        <MaterialCommunityIcons name="check-circle" size={24} color="#9BEC00" />
        <Text style={styles.statValue}>{totalCompletedCourses}</Text>
        <Text style={styles.statLabel}>Complétés</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: -32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statContainer: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
}); 