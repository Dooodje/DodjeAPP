import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import { UserProfile, Badge } from '../../types/profile';

interface AchievementBadgesProps {
  profile: UserProfile;
  onBadgePress?: (badge: Badge) => void;
}

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({ profile, onBadgePress }) => {
  const badges = profile?.badges || [];

  const renderBadge = (badge: Badge, index: number) => {
    return (
      <TouchableOpacity
        key={badge.id || index}
        style={styles.badgeContainer}
        onPress={() => onBadgePress?.(badge)}
      >
        {badge.iconUrl ? (
          <Image 
            source={{ uri: badge.iconUrl }} 
            style={styles.badgeImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.badgePlaceholder}>
            <Text style={styles.placeholderText}>?</Text>
          </View>
        )}
        <Text style={styles.badgeLabel} numberOfLines={1}>
          {badge.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Si pas de badges, afficher un message
  if (badges.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Complétez des quêtes pour gagner des badges !
        </Text>
      </View>
    );
  }

  // Afficher les badges en grille
  return (
    <View style={styles.container}>
      <View style={styles.badgesGrid}>
        {badges.map((badge, index) => renderBadge(badge, index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  badgeContainer: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 8,
  },
  badgeImage: {
    width: '80%',
    height: '80%',
    marginBottom: 4,
  },
  badgePlaceholder: {
    width: '80%',
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 24,
    fontFamily: 'Arboria-Bold',
  },
  badgeLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Arboria-Medium',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontFamily: 'Arboria-Medium',
  },
}); 