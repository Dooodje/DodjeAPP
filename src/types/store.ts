import { UserData } from './firebase';

export interface AuthState {
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
}

export interface ParcoursState {
  parcours: any[]; // TODO: Créer le type Parcours
  isLoading: boolean;
  error: string | null;
}

export interface VideoState {
  videos: any[]; // TODO: Créer le type Video
  isLoading: boolean;
  error: string | null;
}

export interface QuizState {
  quizzes: any[]; // TODO: Créer le type Quiz
  isLoading: boolean;
  error: string | null;
}

export interface DodjeIAState {
  profile: any; // TODO: Créer le type DodjeIAProfile
  isLoading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  parcours: ParcoursState;
  video: VideoState;
  quiz: QuizState;
  dodjeIA: DodjeIAState;
} 