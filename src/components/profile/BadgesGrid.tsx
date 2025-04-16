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
    if (!badge) {
      return null;
    }

    const name = badge.name || 'Badge inconnu';
    const iconUrl = badge.iconUrl || '';
    const category = badge.category || 'général';
    const id = badge.id || `badge-${Math.random()}`;
    
    const isUnlocked = badge.unlockedAt !== null && badge.unlockedAt !== undefined;

    return (
      <TouchableOpacity
        key={id}
        style={[
          styles.badgeContainer,
          !isUnlocked && styles.lockedBadge
        ]}
        onPress={() => onBadgePress?.(badge)}
      >
        <View style={styles.badgeIconContainer}>
          {isUnlocked ? (
            <Image
              source={{ uri: iconUrl }}
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
        <Text style={styles.badgeName}>{name}</Text>
        {isUnlocked && (
          <Text style={styles.badgeCategory}>
            {category}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const badges = Array.isArray(profile?.badges) ? profile.badges : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Badges</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.grid}>
          {badges.length > 0 ? (
            badges.map(renderBadge)
          ) : (
            <Text style={styles.emptyText}>Aucun badge disponible pour le moment</Text>
          )}
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
  emptyText: {
    width: '100%',
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
}); 