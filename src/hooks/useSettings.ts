import { useState, useEffect } from 'react';
import { 
  UserSettings, 
  SettingsContextType, 
  LanguageSettings, 
  ContentPreferences,
  NotificationPreferences,
  PrivacyPreferences,
  SubscriptionPreferences,
  UserInfoPreferences
} from '../types/settings';
import { settingsService } from '../services/settingsService';
import { useAuth } from './useAuth';
import { Alert } from 'react-native';
import { authService } from '../services';

const defaultSettings: UserSettings = {
  userInfo: {
    email: '',
    username: '',
  },
  language: {
    interface: 'fr',
    videos: 'fr',
    subtitles: 'fr',
  },
  content: {
    subtitlesEnabled: true,
    defaultTheme: 'bourse',
  },
  notifications: {
    newContent: true,
    news: true,
    reminders: true,
  },
  privacy: {
    tracking: true,
  },
  subscription: {
    status: 'free',
    plan: null,
    nextBillingDate: null,
    autoRenew: true,
  },
  tokens: {
    balance: 0,
    history: [],
  },
};

export function useSettings(): SettingsContextType {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSettings();
      // Initialiser les informations utilisateur de base depuis user
      if (user.email) {
        // Mettre à jour en toute sécurité avec une vérification supplémentaire
        if (user.uid) {
          updateUserInfo({ email: user.email });
        }
      }
      if (user.displayName) {
        // Mettre à jour en toute sécurité avec une vérification supplémentaire
        if (user.uid) {
          updateUserInfo({ username: user.displayName });
        }
      }
    } else {
      // Utilisateur non connecté : initialiser avec des paramètres par défaut
      setSettings(defaultSettings);
      setIsLoading(false);
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Vérification plus stricte de l'utilisateur et de son uid
      if (!user || !user.uid || typeof user.uid !== 'string' || user.uid.trim() === '') {
        console.warn('loadSettings: user ou user.uid invalide');
        setSettings(defaultSettings);
        setIsLoading(false);
        return;
      }

      const userSettings = await settingsService.getSettings(user.uid);
      
      if (userSettings) {
        // Vérifier et compléter les propriétés manquantes dans les paramètres
        const completeSettings: UserSettings = {
          userInfo: {
            email: userSettings.userInfo?.email || user.email || '',
            username: userSettings.userInfo?.username || user.displayName || '',
          },
          language: {
            interface: userSettings.language?.interface || 'fr',
            videos: userSettings.language?.videos || 'fr',
            subtitles: userSettings.language?.subtitles || 'fr',
          },
          content: {
            subtitlesEnabled: userSettings.content?.subtitlesEnabled !== undefined ? userSettings.content.subtitlesEnabled : true,
            defaultTheme: userSettings.content?.defaultTheme || 'bourse',
          },
          notifications: {
            newContent: userSettings.notifications?.newContent !== undefined ? userSettings.notifications.newContent : true,
            news: userSettings.notifications?.news !== undefined ? userSettings.notifications.news : true,
            reminders: userSettings.notifications?.reminders !== undefined ? userSettings.notifications.reminders : true,
          },
          privacy: {
            tracking: userSettings.privacy?.tracking !== undefined ? userSettings.privacy.tracking : true,
          },
          subscription: {
            status: userSettings.subscription?.status || 'free',
            plan: userSettings.subscription?.plan || null,
            nextBillingDate: userSettings.subscription?.nextBillingDate || null,
            autoRenew: userSettings.subscription?.autoRenew !== undefined ? userSettings.subscription.autoRenew : true,
          },
          tokens: {
            balance: userSettings.tokens?.balance || 0,
            history: Array.isArray(userSettings.tokens?.history) ? userSettings.tokens.history : [],
          },
        };
        
        setSettings(completeSettings);
      } else {
        // Initialiser avec des paramètres par défaut pour un nouvel utilisateur
        const newSettings = {
          ...defaultSettings,
          userInfo: {
            ...defaultSettings.userInfo,
            email: user.email || '',
            username: user.displayName || '',
          }
        };
        await settingsService.updateSettings(user.uid, newSettings);
        setSettings(newSettings);
      }
    } catch (err) {
      setError('Erreur lors du chargement des paramètres');
      console.error('Erreur lors du chargement des paramètres:', err);
      // En cas d'erreur, utiliser les paramètres par défaut
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      setError(null);
      
      // Vérification robuste que user existe et a un uid valide
      if (!user || !user.uid) {
        console.warn('Tentative de mise à jour des paramètres sans utilisateur connecté');
        setError('Vous devez être connecté pour modifier vos paramètres');
        return; // Sortie anticipée sans lancer d'erreur
      }

      // S'assurer que nous avons des objets valides avant de faire la mise à jour
      const safeNewSettings = { ...newSettings };
      
      // Créer une copie sécurisée des paramètres actuels
      const updatedSettings = {
        ...settings,
      };
      
      // Appliquer les nouvelles valeurs de manière sécurisée
      if (safeNewSettings.userInfo) {
        updatedSettings.userInfo = { ...settings.userInfo, ...safeNewSettings.userInfo };
      }
      
      if (safeNewSettings.language) {
        updatedSettings.language = { ...settings.language, ...safeNewSettings.language };
      }
      
      if (safeNewSettings.content) {
        updatedSettings.content = { ...settings.content, ...safeNewSettings.content };
      }
      
      if (safeNewSettings.notifications) {
        updatedSettings.notifications = { ...settings.notifications, ...safeNewSettings.notifications };
      }
      
      if (safeNewSettings.privacy) {
        updatedSettings.privacy = { ...settings.privacy, ...safeNewSettings.privacy };
      }
      
      if (safeNewSettings.subscription) {
        updatedSettings.subscription = { ...settings.subscription, ...safeNewSettings.subscription };
      }
      
      if (safeNewSettings.tokens) {
        updatedSettings.tokens = {
          balance: safeNewSettings.tokens.balance !== undefined ? safeNewSettings.tokens.balance : settings.tokens.balance,
          history: Array.isArray(safeNewSettings.tokens.history) ? safeNewSettings.tokens.history : settings.tokens.history
        };
      }

      // Vérifier à nouveau que l'utilisateur est toujours connecté et a un uid valide
      if (user && user.uid) {
        await settingsService.updatePartialSettings(user.uid, safeNewSettings);
        setSettings(updatedSettings);
      } else {
        throw new Error('Utilisateur déconnecté pendant la mise à jour');
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour des paramètres');
      console.error('Erreur lors de la mise à jour des paramètres:', err);
      throw err;
    }
  };

  const updateLanguage = async (language: Partial<LanguageSettings>) => {
    try {
      const updatedLanguage = {
        ...settings.language,
        ...language,
      };
      
      await updateSettings({ language: updatedLanguage });
    } catch (err) {
      setError('Erreur lors de la mise à jour des paramètres de langue');
      throw err;
    }
  };

  const updateContent = async (content: Partial<ContentPreferences>) => {
    try {
      const updatedContent = {
        ...settings.content,
        ...content,
      };
      
      await updateSettings({ content: updatedContent });
    } catch (err) {
      setError('Erreur lors de la mise à jour des préférences de contenu');
      throw err;
    }
  };

  const updateNotifications = async (notifications: Partial<NotificationPreferences>) => {
    try {
      const updatedNotifications = {
        ...settings.notifications,
        ...notifications,
      };
      
      await updateSettings({ notifications: updatedNotifications });
    } catch (err) {
      setError('Erreur lors de la mise à jour des paramètres de notifications');
      throw err;
    }
  };

  const updatePrivacy = async (privacy: Partial<PrivacyPreferences>) => {
    try {
      const updatedPrivacy = {
        ...settings.privacy,
        ...privacy,
      };
      
      await updateSettings({ privacy: updatedPrivacy });
    } catch (err) {
      setError('Erreur lors de la mise à jour des paramètres de confidentialité');
      throw err;
    }
  };

  const updateSubscription = async (subscription: Partial<SubscriptionPreferences>) => {
    try {
      const updatedSubscription = {
        ...settings.subscription,
        ...subscription,
      };
      
      await updateSettings({ subscription: updatedSubscription });
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'abonnement');
      throw err;
    }
  };

  const updateUserInfo = async (userInfo: Partial<UserInfoPreferences>) => {
    try {
      // Vérifier que l'utilisateur est connecté et a un uid valide
      if (!user || !user.uid) {
        console.warn('Tentative de mise à jour des informations utilisateur sans utilisateur connecté');
        setError('Vous devez être connecté pour modifier vos informations');
        return; // Sortie anticipée sans lancer d'erreur
      }

      // Si l'email est modifié, utiliser la méthode spécifique d'authentification
      if (userInfo.email && userInfo.email !== settings.userInfo.email) {
        try {
          await authService.updateEmail(userInfo.email);
          // Note: L'email sera mis à jour dans Firestore après vérification
          return; // Sortir sans mettre à jour les paramètres dans Firestore
        } catch (error) {
          // Propager l'erreur au composant pour qu'il puisse gérer la réauthentification
          console.error('Erreur lors de la mise à jour de l\'email:', error);
          throw error; // Relancer l'erreur pour que le composant puisse la gérer
        }
      }

      const updatedUserInfo = {
        ...settings.userInfo,
        ...userInfo,
      };
      
      await updateSettings({ userInfo: updatedUserInfo });
    } catch (err) {
      setError('Erreur lors de la mise à jour des informations utilisateur');
      throw err;
    }
  };

  const resetPassword = async () => {
    try {
      if (!user || !user.email) {
        throw new Error('Adresse e-mail non disponible');
      }
      
      await settingsService.sendPasswordResetEmail(user.email);
      Alert.alert(
        'Réinitialisation du mot de passe', 
        'Un e-mail de réinitialisation a été envoyé à votre adresse e-mail.'
      );
    } catch (err) {
      setError('Erreur lors de la réinitialisation du mot de passe');
      Alert.alert(
        'Erreur', 
        'Impossible d\'envoyer l\'e-mail de réinitialisation. Veuillez réessayer.'
      );
      throw err;
    }
  };

  return {
    settings,
    updateSettings,
    updateLanguage,
    updateContent,
    updateNotifications,
    updatePrivacy,
    updateSubscription,
    updateUserInfo,
    resetPassword,
    isLoading,
    error,
  };
} 