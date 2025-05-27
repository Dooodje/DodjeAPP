export interface StreakReward {
  days: number;
  dodjiReward: number;
  title: string;
  description: string;
}

export interface StreakData {
  currentStreak: number;
  lastStreakUpdate: string;
  lastLogin: string;
  totalDodjiEarned: number;
  isNewStreakDay: boolean;
  todayReward?: StreakReward;
  newStreakData?: {
    currentStreak: number;
    lastStreakUpdate: string;
    lastLogin: string;
    totalDodjiEarned: number;
  };
}

export interface StreakModalData {
  visible: boolean;
  streakCount: number;
  dodjiEarned: number;
  title: string;
  description: string;
  isNewRecord?: boolean;
}

// Configuration des récompenses basée sur l'image fournie
export const STREAK_REWARDS: StreakReward[] = [
  {
    days: 1,
    dodjiReward: 5,
    title: "Connexion quotidienne",
    description: "Max 7 jours (bonus cumulatif)"
  },
  {
    days: 7,
    dodjiReward: 50,
    title: "Connexion 7 jours d'affilée",
    description: "Système de streaks hebdomadaire"
  },
  {
    days: 30,
    dodjiReward: 250,
    title: "Connexion 30 jours d'affilée",
    description: "Encourager la récurrence"
  }
];

// Fonction pour calculer la récompense en fonction du nombre de jours (PÉRIODIQUE)
export const calculateStreakReward = (streakDays: number): number => {
  // Récompense spéciale pour les multiples de 30 jours (30, 60, 90, 120, etc.)
  if (streakDays % 30 === 0) {
    return 250;
  }
  
  // Récompense spéciale pour les multiples de 7 jours (7, 14, 21, 28, 35, etc.)
  // MAIS pas si c'est aussi un multiple de 30 (pour éviter la double récompense)
  if (streakDays % 7 === 0 && streakDays % 30 !== 0) {
    return 50;
  }
  
  // Récompense quotidienne de base pour tous les autres jours
  return 5;
};

// Fonction pour obtenir la description de la récompense (PÉRIODIQUE)
export const getStreakRewardInfo = (streakDays: number): StreakReward => {
  // Récompense spéciale pour les multiples de 30 jours
  if (streakDays % 30 === 0) {
    return {
      days: streakDays,
      dodjiReward: 250,
      title: `Connexion ${streakDays} jours d'affilée`,
      description: "Récompense mensuelle périodique !"
    };
  }
  
  // Récompense spéciale pour les multiples de 7 jours (mais pas 30)
  if (streakDays % 7 === 0 && streakDays % 30 !== 0) {
    return {
      days: streakDays,
      dodjiReward: 50,
      title: `Connexion ${streakDays} jours d'affilée`,
      description: "Récompense hebdomadaire périodique !"
    };
  }
  
  // Récompense quotidienne de base pour tous les autres jours
  return {
    days: streakDays,
    dodjiReward: 5,
    title: "Connexion quotidienne",
    description: "Continuez votre série !"
  };
}; 