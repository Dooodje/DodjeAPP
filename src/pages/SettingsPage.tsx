import React from 'react';
import { View, StyleSheet, ScrollView, Linking, TouchableOpacity, Text } from 'react-native';
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
import { MaterialIcons } from '@expo/vector-icons';
import { persistor } from '../store';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Purger le store Redux persisté
              await persistor.purge();
              console.log('✅ Store Redux persisté purgé');
              
              // 2. Déconnexion complète (vide AsyncStorage et caches)
              await logout();
              
              // 3. Redirection vers opening
              // @ts-ignore - expo-router path
              router.replace('/opening');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de se déconnecter. Veuillez réessayer.');
            }
          },
        },
      ]
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

        {/* Bouton de déconnexion */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="#FF4444" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
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
  logoutContainer: {
    marginTop: 32,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#FF4444',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  logoutText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
  },
}); 