import { User } from 'firebase/auth';

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  dodji: number;
  streak: number;
  isDodjeOne: boolean;
  createdAt: Date;
  lastLogin: Date;
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
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number;
  order: number;
  position: {
    x: number;
    y: number;
  };
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  reward: {
    dodji: number;
    badge?: string;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple';
  options: Option[];
  explanation: string;
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
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