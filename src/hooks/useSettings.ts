import { useState, useEffect } from 'react';
import { UserSettings, SettingsContextType } from '../types/settings';
import { settingsService } from '../services/settingsService';
import { useAuth } from './useAuth';

const defaultSettings: UserSettings = {
  notifications: {
    push: true,
    email: true,
  },
  language: 'fr',
  theme: 'system',
  privacy: {
    publicProfile: true,
    showProgress: true,
  },
  downloads: {
    autoDownload: false,
    hdQuality: false,
  },
  playback: {
    autoPlay: true,
    hdQuality: false,
  },
  dataCollection: true,
};

export function useSettings(): SettingsContextType {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userSettings = await settingsService.getSettings(user.uid);
      setSettings(userSettings || defaultSettings);
    } catch (err) {
      setError('Erreur lors du chargement des paramètres');
      console.error('Erreur lors du chargement des paramètres:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      setError(null);
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const updatedSettings = {
        ...settings,
        ...newSettings,
      };

      await settingsService.updateSettings(user.uid, updatedSettings);
      setSettings(updatedSettings);
    } catch (err) {
      setError('Erreur lors de la mise à jour des paramètres');
      console.error('Erreur lors de la mise à jour des paramètres:', err);
      throw err;
    }
  };

  return {
    settings,
    updateSettings,
    isLoading,
    error,
  };
} 