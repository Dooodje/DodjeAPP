export type QuestionType = 'single' | 'multiple';

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  answers: Answer[];
  explanation?: string;
  points: number;
  timeLimit?: number; // en secondes
}

export interface Quiz {
  id: string;
  title: string;
  titre?: string; // Champ alternatif pour le titre en français
  description: string;
  courseId: string;
  videoId: string;
  questions: Question[];
  totalPoints: number;
  passingScore: number;
  timeLimit?: number; // en secondes
  dodjiReward: number;
  tokenReward?: number; // Champ alternatif pour la récompense en jetons
  status: 'locked' | 'unlocked' | 'completed';
  progress: number;
  lastAttemptDate?: Date;
  bestScore?: number;
}

export interface QuizState {
  currentQuiz: Quiz | null;
  currentQuestionIndex: number;
  answers: Record<string, string[]>;
  score: number;
  timeRemaining: number;
  isSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
  showResults: boolean;
}

export type QuizStatus = 'blocked' | 'unblocked' | 'completed';

export interface QuizProgress {
  score: number;           // Score de la dernière tentative
  attempts: number;        // Nombre de tentatives
  bestScore: number;       // Meilleur score obtenu
  lastAttemptAt: string;  // Date de la dernière tentative
  averageScore: number;   // Moyenne des scores de toutes les tentatives
  totalTimeSpent: number; // Temps total passé sur le quiz
  successRate: number;    // Taux de réussite (pourcentage de tentatives réussies)
}

export interface QuizAnswerDetail {
  questionId: string;
  selectedAnswers: string[];
  isCorrect: boolean;
  timeSpent: number;
}

export interface QuizAttemptDetails {
  totalQuestions: number;
  correctAnswers: number;
  answers: QuizAnswerDetail[];
  timeSpent: number;
}

export interface QuizAttempt {
  attemptedAt: string;    // Date de la tentative
  score: number;          // Score obtenu
  completed: boolean;     // Si le quiz a été terminé
  duration: number;       // Durée de la tentative en secondes
  details: QuizAttemptDetails; // Détails de la tentative
}

export interface QuizLastResults {
  score: number;
  completedAt: string;
  details: QuizAnswerDetail[];
  timeSpent: number;
}

export interface QuizResult {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    answers: QuizAnswerDetail[];
}

export interface UserQuiz {
  quizId: string;
  parcoursId: string;
  status: QuizStatus;
  progress: QuizProgress;
  attempts: QuizAttempt[];
  createdAt: string;
  updatedAt: string;
  ordre: number;         // Position dans le parcours
  lastResults?: QuizLastResults; // Résultats de la dernière tentative (optionnel)
}

export interface QuizStatusUpdate {
  userId: string;
  quizId: string;
  parcoursId: string;
  status: QuizStatus;
  progress?: Partial<QuizProgress>;
}

export interface QuizControlsProps {
  quiz: UserQuiz;
  onStart: () => void;
  onSubmit: () => void;
  onRetry: () => void;
}

export interface QuizInfoProps {
  quiz: UserQuiz;
  onUnlock?: () => void;
}

export interface QuizPlayerProps {
  quizId: string;
  userId: string;
}

export interface QuizHeaderProps {
  quiz: Quiz;
  onBack: () => void;
}

export interface QuizProgressProps {
  currentIndex: number;
  totalQuestions: number;
  timeRemaining?: number;
}

export interface QuizQuestionProps {
  question: Question;
  onAnswer: (answerIds: string[]) => void;
  selectedAnswers: string[];
  isSubmitting: boolean;
}

export interface QuizAnswerProps {
  answer: Answer;
  isSelected: boolean;
  isCorrect?: boolean;
  onSelect: () => void;
  disabled: boolean;
}

export interface QuizResultProps {
  quiz: Quiz;
  score: number;
  answers: Record<string, string[]>;
  onRetry: () => void;
  onNext: () => void;
} 