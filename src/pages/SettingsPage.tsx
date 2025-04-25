import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SettingsHeader } from '../components/settings/SettingsHeader';
import { SettingsSection } from '../components/settings/SettingsSection';
import { SettingsItem } from '../components/settings/SettingsItem';
import { SettingsSelect } from '../components/settings/SettingsSelect';
import { SubscriptionCard } from '../components/settings/SubscriptionCard';
import { UserInfoCard } from '../components/settings/UserInfoCard';
import { TokensCard } from '../components/settings/TokensCard';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import { Alert } from 'react-native';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    settings,
    isLoading,
    error,
    updateLanguage,
    updateContent,
    updateNotifications,
    updatePrivacy,
    updateSubscription,
    updateUserInfo,
    resetPassword,
  } = useSettings();

  if (isLoading || !settings) {
    return null; // TODO: Ajouter un composant de chargement
  }

  const handleUpgradePress = () => {
    // @ts-ignore - expo-router path
    router.push('/subscription');
  };

  const handleManagePress = () => {
    // @ts-ignore - expo-router path
    router.push('/subscription/manage');
  };

  const handleBuyTokens = () => {
    // @ts-ignore - expo-router path
    router.push('/tokens/buy');
  };

  const openWebLink = (url: string) => {
    Linking.openURL(url).catch((err) => 
      Alert.alert('Erreur', 'Impossible d\'ouvrir le lien')
    );
  };

  return (
    <View style={styles.container}>
      <SettingsHeader />
      <ScrollView style={styles.content}>
        {/* Section: Paramètres du compte */}
        
        {/* Informations utilisateur */}
        <UserInfoCard
          userInfo={settings.userInfo}
          onUpdateUsername={(username) => updateUserInfo({ username })}
          onResetPassword={resetPassword}
        />

        {/* Abonnement */}
        <SubscriptionCard
          settings={settings}
          onUpgradePress={handleUpgradePress}
          onManagePress={handleManagePress}
        />

        {/* Jetons Dodji */}
        <TokensCard
          settings={settings}
          onBuyTokens={handleBuyTokens}
        />

        {/* Section: Langue et préférences du contenu */}
        <SettingsSection
          title="Langue et préférences"
          icon="language"
        >
          <SettingsSelect
            title="Langue de l'interface"
            description="Choisissez la langue de l'application"
            icon="translate"
            value={settings.language.interface}
            options={[
              { value: 'fr', label: 'Français' },
              { value: 'en', label: 'English' }
            ]}
            onSelect={(value) => updateLanguage({ interface: value as 'fr' | 'en' })}
          />

          <SettingsSelect
            title="Langue des vidéos"
            description="Langue préférée pour les vidéos"
            icon="ondemand-video"
            value={settings.language.videos}
            options={[
              { value: 'fr', label: 'Français' },
              { value: 'en', label: 'English' }
            ]}
            onSelect={(value) => updateLanguage({ videos: value as 'fr' | 'en' })}
          />

          <SettingsSelect
            title="Langue des sous-titres"
            description="Langue préférée pour les sous-titres"
            icon="subtitles"
            value={settings.language.subtitles}
            options={[
              { value: 'fr', label: 'Français' },
              { value: 'en', label: 'English' }
            ]}
            onSelect={(value) => updateLanguage({ subtitles: value as 'fr' | 'en' })}
          />

          <SettingsItem
            title="Sous-titres"
            description="Activer/désactiver les sous-titres"
            icon="closed-caption"
            value={settings.content.subtitlesEnabled}
            onValueChange={(value) => updateContent({ subtitlesEnabled: value as boolean })}
            showSwitch
          />

          <SettingsSelect
            title="Thématique préférée"
            description="Choix de la thématique principale"
            icon="category"
            value={settings.content.defaultTheme}
            options={[
              { value: 'bourse', label: 'Bourse' },
              { value: 'crypto', label: 'Crypto' }
            ]}
            onSelect={(value) => updateContent({ defaultTheme: value as 'bourse' | 'crypto' })}
          />
        </SettingsSection>

        {/* Section: Notifications */}
        <SettingsSection
          title="Notifications"
          icon="notifications"
        >
          <SettingsItem
            title="Nouveau contenu"
            description="Notifications pour les nouveaux cours et vidéos"
            icon="new-releases"
            value={settings.notifications.newContent}
            onValueChange={(value) => updateNotifications({ newContent: value as boolean })}
            showSwitch
          />

          <SettingsItem
            title="Actualités"
            description="Alertes et actualités financières"
            icon="article"
            value={settings.notifications.news}
            onValueChange={(value) => updateNotifications({ news: value as boolean })}
            showSwitch
          />

          <SettingsItem
            title="Rappels"
            description="Rappels pour continuer votre apprentissage"
            icon="alarm"
            value={settings.notifications.reminders}
            onValueChange={(value) => updateNotifications({ reminders: value as boolean })}
            showSwitch
          />
        </SettingsSection>

        {/* Section: Confidentialité et assistance */}
        <SettingsSection
          title="Confidentialité et assistance"
          icon="security"
        >
          <SettingsItem
            title="Politique de confidentialité"
            description="Consultez notre politique de confidentialité"
            icon="privacy-tip"
            onPress={() => openWebLink('https://dodje.com/privacy')}
            showChevron
          />

          <SettingsItem
            title="Préférences de suivi"
            description="Gérer les préférences de suivi publicitaire"
            icon="track-changes"
            value={settings.privacy.tracking}
            onValueChange={(value) => updatePrivacy({ tracking: value as boolean })}
            showSwitch
          />

          <SettingsItem
            title="Aide et assistance"
            description="Besoin d'aide ? Contactez-nous"
            icon="help"
            onPress={() => openWebLink('https://dodje.com/support')}
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