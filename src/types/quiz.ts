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
  description: string;
  courseId: string;
  videoId: string;
  questions: Question[];
  totalPoints: number;
  passingScore: number;
  timeLimit?: number; // en secondes
  dodjiReward: number;
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

export interface QuizProgress {
  quizId: string;
  score: number;
  answers: Record<string, string[]>;
  timeSpent: number;
  completedAt: Date;
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