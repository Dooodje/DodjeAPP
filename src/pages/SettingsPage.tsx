import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SettingsHeader } from '../components/settings/SettingsHeader';
import { SettingsSection } from '../components/settings/SettingsSection';
import { SettingsItem } from '../components/settings/SettingsItem';
import { SettingsSelect } from '../components/settings/SettingsSelect';
import { SubscriptionCard } from '../components/settings/SubscriptionCard';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    settings,
    isLoading,
    error,
    updateLanguage,
    updateNotifications,
    updatePrivacy,
    updateDownloads,
    updatePlayback,
    updateSubscription
  } = useSettings(user?.uid || '');

  if (isLoading || !settings) {
    return null; // TODO: Ajouter un composant de chargement
  }

  const handleUpgradePress = () => {
    router.push('/subscription');
  };

  const handleManagePress = () => {
    router.push('/subscription/manage');
  };

  return (
    <View style={styles.container}>
      <SettingsHeader />
      <ScrollView style={styles.content}>
        <SubscriptionCard
          settings={settings}
          onUpgradePress={handleUpgradePress}
          onManagePress={handleManagePress}
        />

        <SettingsSection
          title="Préférences"
          icon="cog"
        >
          <SettingsSelect
            title="Langue"
            description="Choisissez la langue de l'application"
            icon="translate"
            value={settings.language}
            options={[
              { value: 'fr', label: 'Français' },
              { value: 'en', label: 'English' }
            ]}
            onSelect={updateLanguage}
          />
        </SettingsSection>

        <SettingsSection
          title="Notifications"
          icon="bell"
        >
          <SettingsItem
            title="Notifications push"
            description="Recevez des notifications sur les nouveaux cours"
            icon="bell-outline"
            value={settings.notifications.pushEnabled}
            onValueChange={(value) => updateNotifications({ pushEnabled: value })}
            showSwitch
          />
          <SettingsItem
            title="Notifications email"
            description="Recevez des mises à jour par email"
            icon="email-outline"
            value={settings.notifications.emailEnabled}
            onValueChange={(value) => updateNotifications({ emailEnabled: value })}
            showSwitch
          />
        </SettingsSection>

        <SettingsSection
          title="Confidentialité"
          icon="shield"
        >
          <SettingsItem
            title="Profil public"
            description="Rendez votre profil visible par les autres utilisateurs"
            icon="account-outline"
            value={settings.privacy.publicProfile}
            onValueChange={(value) => updatePrivacy({ publicProfile: value })}
            showSwitch
          />
          <SettingsItem
            title="Statistiques visibles"
            description="Affichez vos statistiques d'apprentissage"
            icon="chart-bar-outline"
            value={settings.privacy.showStats}
            onValueChange={(value) => updatePrivacy({ showStats: value })}
            showSwitch
          />
        </SettingsSection>

        <SettingsSection
          title="Lecture"
          icon="play"
        >
          <SettingsItem
            title="Lecture automatique"
            description="Passez automatiquement à la vidéo suivante"
            icon="play-circle-outline"
            value={settings.playback.autoPlay}
            onValueChange={(value) => updatePlayback({ autoPlay: value })}
            showSwitch
          />
          <SettingsItem
            title="Qualité vidéo"
            description="Choisissez la qualité de lecture par défaut"
            icon="video-outline"
            value={settings.playback.videoQuality}
            onValueChange={(value) => updatePlayback({ videoQuality: value })}
            showChevron
          />
        </SettingsSection>

        <SettingsSection
          title="Téléchargements"
          icon="download"
        >
          <SettingsItem
            title="Téléchargement automatique"
            description="Téléchargez automatiquement les nouveaux cours"
            icon="download-outline"
            value={settings.downloads.autoDownload}
            onValueChange={(value) => updateDownloads({ autoDownload: value })}
            showSwitch
          />
          <SettingsItem
            title="Stockage"
            description="Gérez l'espace de stockage"
            icon="harddisk-outline"
            value={`${settings.downloads.storageUsed} / ${settings.downloads.storageLimit} GB`}
            showChevron
          />
        </SettingsSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  content: {
    flex: 1,
    padding: 16,
  },
}); 