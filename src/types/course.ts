import { Section, Level } from './home';

export type ContentType = 'video' | 'quiz' | 'exercise';

export interface CourseContent {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  order: number;
  duration: number; // en minutes
  videoUrl?: string;
  thumbnailUrl?: string;
  questions?: QuizQuestion[];
  exercises?: Exercise[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  instructions: string;
  solution: string;
  hints: string[];
}

export interface CourseDesign {
  id: string;
  courseId: string;
  backgroundImagePath: string;
  positions: Record<string, { 
    x: number; 
    y: number; 
    order?: number; 
    isAnnex: boolean 
  }>;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  section: Section;
  level: Level;
  thumbnailUrl: string;
  duration: number; // en minutes
  contents: CourseContent[];
  prerequisites?: string[]; // IDs des parcours requis
  nextCourses?: string[]; // IDs des parcours suivants
  designId?: string; // ID du design associé
}

export interface CourseProgress {
  courseId: string;
  userId: string;
  completedContents: string[]; // IDs des contenus complétés
  unlockedVideos?: string[]; // IDs des vidéos débloquées manuellement avec des Dodji
  currentContentIndex: number;
  lastAccessedAt: Date;
  totalProgress: number; // en pourcentage
  lastViewedContentId?: string; // ID du dernier contenu visionné
}

export interface CourseState {
  currentCourse: Course | null;
  currentContent: CourseContent | null;
  progress: CourseProgress | null;
  isLoading: boolean;
  error: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
} 