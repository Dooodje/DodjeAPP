import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserStats as UserStatsType } from '../../types/home';

interface UserStatsProps {
  stats: UserStatsType;
}

export const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
  return (
    <View style={styles.container}>
      {/* Streak */}
      <View style={styles.statContainer}>
        <MaterialCommunityIcons name="fire" size={24} color="#FF6B6B" />
        <Text style={styles.statValue}>{stats.streak}</Text>
        <Text style={styles.statLabel}>Jours</Text>
      </View>

      {/* Dodji */}
      <View style={styles.statContainer}>
        <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
        <Text style={styles.statValue}>{stats.dodji}</Text>
        <Text style={styles.statLabel}>Dodji</Text>
      </View>

      {/* Progression totale */}
      <View style={styles.statContainer}>
        <MaterialCommunityIcons name="chart-line" size={24} color="#06D001" />
        <Text style={styles.statValue}>{Math.round(stats.totalProgress)}%</Text>
        <Text style={styles.statLabel}>Progression</Text>
      </View>

      {/* Parcours complétés */}
      <View style={styles.statContainer}>
        <MaterialCommunityIcons name="check-circle" size={24} color="#9BEC00" />
        <Text style={styles.statValue}>{stats.totalCompletedCourses}</Text>
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
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  statContainer: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
    fontFamily: 'Arboria-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 2,
    fontFamily: 'Arboria-Book',
  },
}); 