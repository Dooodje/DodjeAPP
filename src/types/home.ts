export type Section = 'Bourse' | 'Crypto';
export type Level = 'Débutant' | 'Avancé' | 'Expert';

export interface CoursePosition {
  x: number;
  y: number;
}

export interface Course {
  id: string;
  originalId?: string;
  title: string;
  description: string;
  level: Level;
  section: Section;
  position: CoursePosition;
  status: 'blocked' | 'completed' | 'deblocked';
  progress: number;
  dodjiCost: number;
  imageUrl: string;
  lockIcon: string;
  checkIcon: string;
  ringIcon: string;
  ordre: number;
  videoIds: string[];
  quizId: string | null;
  isAnnex: boolean;
}

export interface TreeData {
  section: Section;
  level: Level;
  treeImageUrl?: string;
  courses: Course[];
}

export interface UserStats {
  streak: number;
  dodji: number;
  totalCompletedCourses: number;
  totalProgress: number;
  lastLoginDate?: Date;
  streakLastUpdateDate?: Date;
}

export type UserStatsType = UserStats;

export interface UserCourseStatus {
  status: 'blocked' | 'completed' | 'deblocked';
  progress: number;
}

// Interface pour les positions des éléments dans l'arbre
export interface PositionData {
  x: number;
  y: number;
  order?: number;
  isAnnex: boolean;
}

// Interface pour le design de la page d'accueil
export interface HomeDesign {
  domaine: Section;
  niveau: Level;
  imageUrl: string;
  positions: Record<string, PositionData>;
  parcours?: Record<string, any>; // Parcours indexés par ordre
}

export interface HomeState {
  currentSection: Section;
  currentLevel: Level;
  treeData: TreeData | null;
  homeDesign: HomeDesign | null;
  isLoading: boolean;
  error: string | null;
  streak: number;
  dodji: number;
  lastViewedCourse: string | null;
} 