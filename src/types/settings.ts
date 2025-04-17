// Types pour les préférences de langue
export type LanguagePreferences = 'fr' | 'en';

// Types pour les préférences de langue étendues
export interface LanguageSettings {
  interface: LanguagePreferences;
  videos: LanguagePreferences;
  subtitles: LanguagePreferences;
}

// Types pour les préférences de contenu
export interface ContentPreferences {
  subtitlesEnabled: boolean;
  defaultTheme: 'bourse' | 'crypto';
}

// Types pour les notifications
export interface NotificationPreferences {
  newContent: boolean;
  news: boolean;
  reminders: boolean;
}

// Types pour la confidentialité
export interface PrivacyPreferences {
  tracking: boolean;
}

// Types pour les jetons Dodji
export interface TokenData {
  id: string;
  date: Date;
  amount: number;
  type: 'purchase' | 'gain' | 'expense';
  description: string;
}

export interface TokenPreferences {
  balance: number;
  history: TokenData[];
}

// Types pour l'abonnement étendu
export interface SubscriptionPreferences {
  status: 'free' | 'premium';
  plan: 'monthly' | 'yearly' | null;
  nextBillingDate: Date | null;
  autoRenew: boolean;
}

// Types pour les informations utilisateur
export interface UserInfoPreferences {
  email: string;
  username: string;
  // Le mot de passe n'est pas stocké mais on a une action pour le modifier
}

// Type principal pour les paramètres
export interface UserSettings {
  userInfo: UserInfoPreferences;
  language: LanguageSettings;
  content: ContentPreferences;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  subscription: SubscriptionPreferences;
  tokens: TokenPreferences;
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
  onUpgradePress: () => void;
  onManagePress: () => void;
}

export interface SettingsItemProps {
  title: string;
  description: string;
  icon: string;
  value?: boolean | string | number;
  onValueChange?: (value: boolean | string | number) => void;
  onPress?: () => void;
  showSwitch?: boolean;
  showChevron?: boolean;
  options?: Array<{ value: string; label: string }>;
  onSelect?: (value: string) => void;
}

export interface SettingsSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

export interface SettingsSelectProps {
  title: string;
  description: string;
  icon: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onSelect: (value: string) => void;
}

export interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  updateLanguage: (language: Partial<LanguageSettings>) => Promise<void>;
  updateContent: (content: Partial<ContentPreferences>) => Promise<void>;
  updateNotifications: (notifications: Partial<NotificationPreferences>) => Promise<void>;
  updatePrivacy: (privacy: Partial<PrivacyPreferences>) => Promise<void>;
  updateSubscription: (subscription: Partial<SubscriptionPreferences>) => Promise<void>;
  updateUserInfo: (userInfo: Partial<UserInfoPreferences>) => Promise<void>;
  resetPassword: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
} 