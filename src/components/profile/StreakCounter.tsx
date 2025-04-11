import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserProfile } from '../../types/profile';

interface StreakCounterProps {
  profile: UserProfile;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ profile }) => {
  return (
    <View style={styles.container}>
      <View style={styles.streakContainer}>
        <MaterialCommunityIcons name="fire" size={24} color="#FF6B00" />
        <Text style={styles.streakText}>{profile.streak}</Text>
        <Text style={styles.streakLabel}>jours</Text>
      </View>
      <Text style={styles.lastLogin}>
        Dernière connexion : {profile.lastLoginDate.toLocaleDateString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0400',
    padding: 20,
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  streakText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginHorizontal: 8,
  },
  streakLabel: {
    fontSize: 16,
    color: '#FF6B00',
  },
  lastLogin: {
    fontSize: 14,
    color: '#666',
  },
}); 