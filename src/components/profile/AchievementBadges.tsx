import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { UserProfile, Badge } from '../../types/profile';

interface AchievementBadgesProps {
  profile: UserProfile;
  onBadgePress?: (badge: Badge) => void;
}

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({ profile, onBadgePress }) => {
  // Mock badges data based on the screenshots
  const mockBadges: Badge[] = [
    // First row
    {
      id: '1',
      name: 'Débutant Bourse',
      category: 'course',
      iconUrl: '',
      description: 'Complété le premier cours sur la bourse',
      unlockedAt: new Date()
    },
    {
      id: '2',
      name: 'Intermédiaire Bourse',
      category: 'course',
      iconUrl: '',
      description: 'Complété les cours intermédiaires sur la bourse',
      unlockedAt: new Date()
    },
    {
      id: '3',
      name: 'Expert Bourse',
      category: 'course',
      iconUrl: '',
      description: 'Complété tous les cours sur la bourse',
      unlockedAt: new Date()
    },
    // Second row
    {
      id: '4',
      name: 'Débutant Crypto',
      category: 'course',
      iconUrl: '',
      description: 'Complété le premier cours sur les cryptomonnaies',
      unlockedAt: new Date()
    },
    {
      id: '5',
      name: 'Intermédiaire Crypto',
      category: 'course',
      iconUrl: '',
      description: 'Complété les cours intermédiaires sur les cryptomonnaies',
      unlockedAt: new Date()
    },
    {
      id: '6',
      name: 'Expert Crypto',
      category: 'course',
      iconUrl: '',
      description: 'Complété tous les cours sur les cryptomonnaies',
      unlockedAt: new Date()
    }
  ];

  // Ensure we always have badges to display
  const badges = Array.isArray(profile?.badges) && profile.badges.length > 0 
    ? profile.badges 
    : mockBadges;

  const renderBadge = (badge: Badge, index: number) => {
    return (
      <TouchableOpacity
        key={badge.id || index}
        style={styles.badgeContainer}
        onPress={() => onBadgePress?.(badge)}
      >
        {badge.iconUrl ? (
          <Image source={{ uri: badge.iconUrl }} style={styles.badgeImage} />
        ) : (
          <View style={styles.badgePlaceholder}>
            {/* Render a placeholder shield icon based on the index */}
            <View style={styles.badgeShield}>
              {/* Render stars based on the badge level */}
              <View style={styles.starsContainer}>
                {Array(Math.floor(index / 3) + 1).fill(0).map((_, starIndex) => (
                  <View key={starIndex} style={styles.star} />
                ))}
              </View>
              {/* Render icon inside shield based on category */}
              <View style={styles.badgeIcon} />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Show badges in two rows of three
  const firstRow = badges.slice(0, 3);
  const secondRow = badges.slice(3, 6);

  return (
    <View style={styles.container}>
      <View style={styles.badgesRow}>
        {firstRow.map((badge, index) => renderBadge(badge, index))}
      </View>
      <View style={styles.badgesRow}>
        {secondRow.map((badge, index) => renderBadge(badge, index + 3))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  badgeContainer: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  badgePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeShield: {
    width: '80%',
    height: '80%',
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starsContainer: {
    position: 'absolute',
    top: -5,
    flexDirection: 'row',
  },
  star: {
    width: 10,
    height: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    marginHorizontal: 2,
  },
  badgeIcon: {
    width: '50%',
    height: '50%',
    backgroundColor: 'transparent',
  },
}); 