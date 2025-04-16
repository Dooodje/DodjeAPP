import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserProfile } from '../../types/profile';

interface StreakCounterProps {
  profile: UserProfile;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ profile }) => {
  // Formater la date de dernière connexion de façon sécurisée
  const formatLastLoginDate = () => {
    // Vérifier si lastLoginDate existe
    if (!profile.lastLoginDate) {
      return 'Non disponible';
    }
    
    // Si c'est une chaîne de caractères, la convertir en Date
    let dateObj = profile.lastLoginDate;
    if (typeof dateObj === 'string') {
      dateObj = new Date(dateObj);
    }
    
    // Vérifier si c'est un objet Date valide
    if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
      try {
        return dateObj.toLocaleDateString();
      } catch (error) {
        return dateObj.toString().split('T')[0]; // Fallback si toLocaleDateString échoue
      }
    }
    
    return 'Date invalide';
  };

  return (
    <View style={styles.container}>
      <View style={styles.streakContainer}>
        <MaterialCommunityIcons name="fire" size={24} color="#FF6B00" />
        <Text style={styles.streakText}>{profile.streak || 0}</Text>
        <Text style={styles.streakLabel}>jours</Text>
      </View>
      <Text style={styles.lastLogin}>
        Dernière connexion : {formatLastLoginDate()}
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