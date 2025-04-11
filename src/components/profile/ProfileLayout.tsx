import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { UserProfile, Badge, Quest } from '../../types/profile';
import { ProfileHeader } from './ProfileHeader';
import { StreakCounter } from './StreakCounter';
import { ProgressBars } from './ProgressBars';
import { QuestsList } from './QuestsList';
import { BadgesGrid } from './BadgesGrid';
import { SettingsButton } from './SettingsButton';

interface ProfileLayoutProps {
  profile: UserProfile;
  onEditProfile?: () => void;
  onSettingsPress?: () => void;
  onBadgePress?: (badge: Badge) => void;
  onQuestPress?: (quest: Quest) => void;
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  profile,
  onEditProfile,
  onSettingsPress,
  onBadgePress,
  onQuestPress,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ProfileHeader
          username={profile.displayName}
          avatarUrl={profile.avatarUrl}
        />
        <StreakCounter profile={profile} />
        <ProgressBars profile={profile} />
        <QuestsList
          profile={profile}
          onQuestPress={onQuestPress}
        />
        <BadgesGrid
          profile={profile}
          onBadgePress={onBadgePress}
        />
      </ScrollView>
      {onSettingsPress && (
        <SettingsButton onPress={onSettingsPress} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  scrollView: {
    flex: 1,
  },
}); 