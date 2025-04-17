import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UserProfile, Quest } from '../../types/profile';

interface WeeklyQuestsProps {
  profile: UserProfile;
  onQuestPress?: (quest: Quest) => void;
}

export const WeeklyQuests: React.FC<WeeklyQuestsProps> = ({ profile, onQuestPress }) => {
  // Mock quests data based on the screenshots
  const mockQuests: Quest[] = [
    {
      id: '1',
      title: 'Compléter un parcours d\'introduction',
      description: 'Terminer le parcours débutant en bourse',
      type: 'weekly',
      status: 'active',
      progress: 0,
      total: 1,
      reward: {
        type: 'dodji',
        amount: 100
      }
    },
    {
      id: '2',
      title: 'Réaliser un quiz quotidien',
      description: 'Compléter un quiz quotidien sur les cryptomonnaies',
      type: 'weekly',
      status: 'active',
      progress: 0,
      total: 1,
      reward: {
        type: 'dodji',
        amount: 50
      }
    },
    {
      id: '3',
      title: 'Connecter 3 jours de suite',
      description: 'Se connecter à l\'application 3 jours consécutifs',
      type: 'weekly',
      status: 'active',
      progress: 1,
      total: 3,
      reward: {
        type: 'dodji',
        amount: 150
      }
    }
  ];

  // Ensure we always have quests to display
  const quests = Array.isArray(profile?.quests) && profile.quests.length > 0 
    ? profile.quests.filter(q => q.type === 'weekly' || q.type === 'special')
    : mockQuests;

  const renderQuest = (quest: Quest) => {
    return (
      <TouchableOpacity 
        key={quest.id}
        style={styles.questContainer}
        onPress={() => onQuestPress?.(quest)}
      >
        <View style={styles.questContent}>
          <Text style={styles.questTitle}>{quest.title}</Text>
          <Text style={styles.questDescription}>{quest.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {quests.map(renderQuest)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  questContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  questContent: {
    flex: 1,
  },
  questTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 14,
    color: '#888888',
  },
}); 