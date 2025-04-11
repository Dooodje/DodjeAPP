import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { QuizState, Quiz, QuizProgress } from '../../types/quiz';

const initialState: QuizState = {
  currentQuiz: null,
  currentQuestionIndex: 0,
  answers: {},
  score: 0,
  timeRemaining: 0,
  isSubmitting: false,
  isLoading: false,
  error: null,
  showResults: false
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setCurrentQuiz: (state, action: PayloadAction<Quiz>) => {
      state.currentQuiz = action.payload;
      state.currentQuestionIndex = 0;
      state.answers = {};
      state.score = 0;
      state.timeRemaining = action.payload.timeLimit || 0;
      state.showResults = false;
    },
    setCurrentQuestionIndex: (state, action: PayloadAction<number>) => {
      state.currentQuestionIndex = action.payload;
    },
    setAnswer: (state, action: PayloadAction<{ questionId: string; answerIds: string[] }>) => {
      state.answers[action.payload.questionId] = action.payload.answerIds;
    },
    updateScore: (state, action: PayloadAction<number>) => {
      state.score = action.payload;
    },
    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload;
    },
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    showResults: (state) => {
      state.showResults = true;
    },
    resetQuiz: (state) => {
      state.currentQuiz = null;
      state.currentQuestionIndex = 0;
      state.answers = {};
      state.score = 0;
      state.timeRemaining = 0;
      state.isSubmitting = false;
      state.isLoading = false;
      state.error = null;
      state.showResults = false;
    }
  }
});

export const {
  setCurrentQuiz,
  setCurrentQuestionIndex,
  setAnswer,
  updateScore,
  updateTimeRemaining,
  setSubmitting,
  setLoading,
  setError,
  showResults,
  resetQuiz
} = quizSlice.actions;

export default quizSlice.reducer; 