// Types pour les préférences de langue
export type LanguagePreferences = 'fr' | 'en';

// Types pour les notifications
export interface NotificationPreferences {
  push: boolean;
  email: boolean;
}

// Types pour la confidentialité
export interface PrivacyPreferences {
  publicProfile: boolean;
  showStats: boolean;
}

// Types pour les téléchargements
export interface DownloadPreferences {
  autoDownload: boolean;
  storageUsed: number;
  storageLimit: number;
}

// Types pour les préférences de lecture
export interface PlaybackPreferences {
  autoPlay: boolean;
  videoQuality: 'auto' | 'low' | 'medium' | 'high';
}

// Types pour l'abonnement
export interface SubscriptionPreferences {
  status: 'free' | 'premium';
  plan: 'monthly' | 'yearly' | null;
  nextBillingDate: Date | null;
}

// Type principal pour les paramètres
export interface UserSettings {
  language: LanguagePreferences;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  downloads: DownloadPreferences;
  playback: PlaybackPreferences;
  subscription: SubscriptionPreferences;
  theme: 'dark' | 'light' | 'system';
  dataCollection: boolean;
}

// Types pour les actions Redux
export interface SetSettingsAction {
  type: 'SET_SETTINGS';
  payload: UserSettings;
}

export interface UpdateSettingsAction {
  type: 'UPDATE_SETTINGS';
  payload: Partial<UserSettings>;
}

export interface SetLoadingAction {
  type: 'SET_LOADING';
  payload: boolean;
}

export interface SetErrorAction {
  type: 'SET_ERROR';
  payload: string | null;
}

export type SettingsAction =
  | SetSettingsAction
  | UpdateSettingsAction
  | SetLoadingAction
  | SetErrorAction;

export interface SubscriptionCardProps {
  settings: UserSettings;
  onSubscribe: () => Promise<void>;
  onManageSubscription: () => Promise<void>;
}

export interface SettingsItemProps {
  title: string;
  description: string;
  icon: string;
  value?: boolean | string;
  onValueChange?: (value: boolean | string) => Promise<void>;
  onPress?: () => Promise<void>;
  showSwitch?: boolean;
  showChevron?: boolean;
  options?: Array<{ value: string; label: string }>;
  onSelect?: (value: string) => Promise<void>;
}

export interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export interface SettingsSelectProps {
  title: string;
  description: string;
  icon: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onSelect: (value: string) => Promise<void>;
}

export interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
} 