import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { QuizHeaderProps } from '../../types/quiz';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const QuizHeader: React.FC<QuizHeaderProps> = ({ quiz, onBack }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: Math.max(16, insets.top) }]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{quiz.title}</Text>
        <Text style={styles.description}>{quiz.description}</Text>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#fff" />
            <Text style={styles.infoText}>
              {quiz.timeLimit ? `${quiz.timeLimit} min` : 'Sans limite'}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="star-outline" size={16} color="#fff" />
            <Text style={styles.infoText}>
              {quiz.totalPoints} points
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="currency-dodji" size={16} color="#06D001" />
            <Text style={[styles.infoText, styles.dodjiText]}>
              {quiz.dodjiReward} Dodji
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            quiz.status === 'completed' && styles.completedBadge,
            quiz.status === 'locked' && styles.lockedBadge
          ]}>
            <MaterialCommunityIcons
              name={
                quiz.status === 'completed' ? 'check-circle' :
                quiz.status === 'locked' ? 'lock' : 'lock-open'
              }
              size={16}
              color="#fff"
            />
            <Text style={styles.statusText}>
              {quiz.status === 'completed' ? 'Terminé' :
               quiz.status === 'locked' ? 'Verrouillé' : 'Débloqué'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    marginBottom: 16,
  },
  content: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#fff',
  },
  dodjiText: {
    color: '#06D001',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
  },
  completedBadge: {
    backgroundColor: '#06D001',
  },
  lockedBadge: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
}); 