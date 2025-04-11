import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserProfile, Badge } from '../../types/profile';

interface BadgesGridProps {
  profile: UserProfile;
  onBadgePress?: (badge: Badge) => void;
}

export const BadgesGrid: React.FC<BadgesGridProps> = ({ profile, onBadgePress }) => {
  const renderBadge = (badge: Badge) => {
    const isUnlocked = badge.unlockedAt !== null;

    return (
      <TouchableOpacity
        key={badge.id}
        style={[
          styles.badgeContainer,
          !isUnlocked && styles.lockedBadge
        ]}
        onPress={() => onBadgePress?.(badge)}
      >
        <View style={styles.badgeIconContainer}>
          {isUnlocked ? (
            <Image
              source={{ uri: badge.iconUrl }}
              style={styles.badgeIcon}
            />
          ) : (
            <MaterialCommunityIcons
              name="lock"
              size={32}
              color="#666"
            />
          )}
        </View>
        <Text style={styles.badgeName}>{badge.name}</Text>
        {isUnlocked && (
          <Text style={styles.badgeCategory}>
            {badge.category}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Badges</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.grid}>
          {profile.badges.map(renderBadge)}
        </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeContainer: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  lockedBadge: {
    opacity: 0.5,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeCategory: {
    fontSize: 12,
    color: '#666',
  },
}); 