import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CourseState, Course, CourseContent, CourseProgress } from '../../types/course';

const initialState: CourseState = {
  currentCourse: null,
  currentContent: null,
  progress: null,
  isLoading: false,
  error: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setCurrentCourse: (state, action: PayloadAction<Course>) => {
      state.currentCourse = action.payload;
    },
    setCurrentContent: (state, action: PayloadAction<CourseContent>) => {
      state.currentContent = action.payload;
    },
    setProgress: (state, action: PayloadAction<CourseProgress>) => {
      state.progress = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    updateContentProgress: (state, action: PayloadAction<{ contentId: string; isCompleted: boolean }>) => {
      if (state.progress) {
        const { contentId, isCompleted } = action.payload;
        if (isCompleted) {
          state.progress.completedContents.push(contentId);
        } else {
          state.progress.completedContents = state.progress.completedContents.filter(
            id => id !== contentId
          );
        }
        state.progress.totalProgress =
          (state.progress.completedContents.length / (state.currentCourse?.contents.length || 1)) * 100;
      }
    },
    resetCourse: (state) => {
      return initialState;
    },
  },
});

export const {
  setCurrentCourse,
  setCurrentContent,
  setProgress,
  setLoading,
  setError,
  setPlaying,
  setCurrentTime,
  setDuration,
  updateContentProgress,
  resetCourse,
} = courseSlice.actions;

export default courseSlice.reducer; 