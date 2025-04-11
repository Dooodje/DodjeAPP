import { db } from './firebase';
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { UserSettings } from '../types/settings';

export class SettingsService {
  private static instance: SettingsService;
  private readonly COLLECTION = 'user_settings';

  private constructor() {}

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  // Récupérer les paramètres d'un utilisateur
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const settingsDoc = await getDoc(doc(db, this.COLLECTION, userId));
      if (!settingsDoc.exists()) {
        return null;
      }

      const data = settingsDoc.data();
      return {
        ...data,
        id: settingsDoc.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as UserSettings;
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      throw error;
    }
  }

  // Mettre à jour les paramètres
  async updateSettings(userId: string, updates: Partial<UserSettings>): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION, userId);
      await updateDoc(settingsRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      throw error;
    }
  }

  // Créer les paramètres par défaut
  async createDefaultSettings(userId: string, email: string): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION, userId);
      const now = Timestamp.now();

      const defaultSettings: Omit<UserSettings, 'id'> = {
        userId,
        email,
        language: {
          interface: 'fr',
          videos: 'fr',
          subtitles: 'fr'
        },
        notifications: {
          pushEnabled: true,
          newContent: true,
          news: true,
          reminders: true
        },
        privacy: {
          trackingEnabled: true,
          twoFactorEnabled: false,
          connectedDevices: []
        },
        downloads: {
          quality: 'medium',
          storageLimit: 1024 * 1024 * 1024, // 1GB
          downloadedVideos: []
        },
        playback: {
          subtitlesEnabled: true,
          autoPlay: false,
          quality: 'auto'
        },
        subscription: {
          status: 'free',
          plan: null,
          autoRenewal: false,
          nextBillingDate: null,
          cancelAtPeriodEnd: false
        },
        createdAt: now,
        updatedAt: now
      };

      await setDoc(settingsRef, defaultSettings);
    } catch (error) {
      console.error('Erreur lors de la création des paramètres par défaut:', error);
      throw error;
    }
  }

  // Mettre à jour les préférences de langue
  async updateLanguagePreferences(userId: string, preferences: UserSettings['language']): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION, userId);
      await updateDoc(settingsRef, {
        'language': preferences,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences de langue:', error);
      throw error;
    }
  }

  // Mettre à jour les préférences de notification
  async updateNotificationPreferences(userId: string, preferences: UserSettings['notifications']): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION, userId);
      await updateDoc(settingsRef, {
        'notifications': preferences,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences de notification:', error);
      throw error;
    }
  }

  // Mettre à jour les préférences de confidentialité
  async updatePrivacyPreferences(userId: string, preferences: UserSettings['privacy']): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION, userId);
      await updateDoc(settingsRef, {
        'privacy': preferences,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences de confidentialité:', error);
      throw error;
    }
  }

  // Mettre à jour les préférences de téléchargement
  async updateDownloadPreferences(userId: string, preferences: UserSettings['downloads']): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION, userId);
      await updateDoc(settingsRef, {
        'downloads': preferences,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences de téléchargement:', error);
      throw error;
    }
  }

  // Mettre à jour les préférences de lecture
  async updatePlaybackPreferences(userId: string, preferences: UserSettings['playback']): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION, userId);
      await updateDoc(settingsRef, {
        'playback': preferences,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences de lecture:', error);
      throw error;
    }
  }

  // Mettre à jour les préférences d'abonnement
  async updateSubscriptionPreferences(userId: string, preferences: UserSettings['subscription']): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION, userId);
      await updateDoc(settingsRef, {
        'subscription': preferences,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences d\'abonnement:', error);
      throw error;
    }
  }
}

export const settingsService = SettingsService.getInstance(); 