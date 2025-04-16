import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserProfile, Quest } from '../../types/profile';

interface QuestsListProps {
  profile: UserProfile;
  onQuestPress?: (quest: Quest) => void;
}

export const QuestsList: React.FC<QuestsListProps> = ({ profile, onQuestPress }) => {
  const renderQuest = (quest: Quest) => {
    const progress = (quest.progress / quest.total) * 100;
    const isCompleted = quest.status === 'completed';

    return (
      <TouchableOpacity
        key={quest.id}
        style={styles.questContainer}
        onPress={() => onQuestPress?.(quest)}
      >
        <View style={styles.questHeader}>
          <MaterialCommunityIcons
            name={getQuestIcon(quest.type)}
            size={24}
            color={isCompleted ? '#06D001' : '#fff'}
          />
          <Text style={styles.questTitle}>{quest.title}</Text>
        </View>
        <Text style={styles.questDescription}>{quest.description}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${progress}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {quest.progress}/{quest.total}
          </Text>
        </View>
        <View style={styles.rewardContainer}>
          <MaterialCommunityIcons name="star" size={16} color="#F3FF90" />
          <Text style={styles.rewardText}>
            {typeof quest.reward === 'object' && quest.reward.amount 
              ? `${quest.reward.amount} Dodji` 
              : "Récompense"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getQuestIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return 'calendar-check';
      case 'weekly':
        return 'calendar-week';
      case 'special':
        return 'trophy';
      default:
        return 'star';
    }
  };

  // Vérifier si profile.quests existe et est un tableau
  const quests = Array.isArray(profile.quests) ? profile.quests : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quêtes en cours</Text>
      <ScrollView style={styles.scrollView}>
        {quests.length > 0 ? (
          quests.map(renderQuest)
        ) : (
          <Text style={styles.emptyText}>Aucune quête disponible pour le moment</Text>
        )}
      </ScrollView>
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
  scrollView: {
    maxHeight: 300,
  },
  questContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  questDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#06D001',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 14,
    color: '#F3FF90',
    marginLeft: 4,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
}); 