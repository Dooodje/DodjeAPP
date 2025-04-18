import { User } from 'firebase/auth';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  dodji: number;
  streak: number;
  isDodjeOne: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface Parcours {
  id: string;
  title: string;
  titre?: string;
  description: string;
  theme: 'bourse' | 'crypto';
  level: 'debutant' | 'avance' | 'expert';
  order: number;
  imageUrl: string;
  thumbnail?: string;
  videoCount?: number;
  videoIds?: string[];
  status?: 'blocked' | 'available' | 'in_progress' | 'completed';
  position: {
    x: number;
    y: number;
  };
  videos: Video[];
  quiz: Quiz;
  isCompleted?: boolean;
  isUnlocked?: boolean;
  isAnnex?: boolean;
  isAnnexe?: boolean;
  isSpecial?: boolean;
  isBonus?: boolean;
  isIntroduction?: boolean;
  dodjiCost?: number;
}

export interface Video {
  id: string;
  title: string;
  titre?: string;
  description: string;
  duration: number;
  url: string;
  thumbnailUrl: string;
  subtitlesUrl?: string;
  order: number;
  isCompleted?: boolean;
  nextVideoId?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  passingScore: number;
  timeLimit?: number;
  isCompleted?: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation?: string;
  imageUrl?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface UserProgress {
  userId: string;
  parcoursId: string;
  status: 'blocked' | 'unlocked' | 'completed';
  completedVideos: string[];
  quizCompleted: boolean;
  quizScore?: number;
  lastAccessed: Date;
}

export interface DodjeOneSubscription {
  userId: string;
  status: 'active' | 'canceled' | 'expired';
  subscriptionType: 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod: string;
  price: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'system' | 'course' | 'achievement' | 'dodji' | 'subscription';
  read: boolean;
  timestamp: Date;
  relatedItemId?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  condition: string;
  dodjiReward: number;
  unlockedAt?: Date;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  claimed: boolean;
} 