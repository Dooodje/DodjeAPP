// Types pour les badges
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  unlockedAt?: Date;
  category: 'course' | 'quiz' | 'streak' | 'special';
}

// Types pour les quêtes
export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  status: 'active' | 'completed' | 'expired';
  progress: number;
  total: number;
  reward: {
    type: 'dodji' | 'badge';
    amount?: number;
    badgeId?: string;
  };
  expiresAt?: Date;
}

// Types pour la progression
export interface Progress {
  bourse: {
    percentage: number;
    completedCourses: number;
    totalCourses: number;
  };
  crypto: {
    percentage: number;
    completedCourses: number;
    totalCourses: number;
  };
}

// Type principal pour le profil utilisateur
export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  streak: number;
  lastLoginDate: Date;
  progress: Progress;
  badges: Badge[];
  quests: Quest[];
  dodji: number;
  isDodjeOne: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour le state Redux
export interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  selectedBadge: Badge | null;
  selectedQuest: Quest | null;
}

// Types pour les actions Redux
export interface SetProfileAction {
  type: 'SET_PROFILE';
  payload: UserProfile;
}

export interface UpdateProfileAction {
  type: 'UPDATE_PROFILE';
  payload: Partial<UserProfile>;
}

export interface SetLoadingAction {
  type: 'SET_LOADING';
  payload: boolean;
}

export interface SetErrorAction {
  type: 'SET_ERROR';
  payload: string | null;
}

export interface SelectBadgeAction {
  type: 'SELECT_BADGE';
  payload: Badge | null;
}

export interface SelectQuestAction {
  type: 'SELECT_QUEST';
  payload: Quest | null;
}

export type ProfileAction =
  | SetProfileAction
  | UpdateProfileAction
  | SetLoadingAction
  | SetErrorAction
  | SelectBadgeAction
  | SelectQuestAction; 