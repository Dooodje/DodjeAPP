import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProfileState, UserProfile, Badge, Quest } from '../../types/profile';

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
  selectedBadge: null,
  selectedQuest: null
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
        state.error = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    selectBadge: (state, action: PayloadAction<Badge | null>) => {
      state.selectedBadge = action.payload;
    },
    selectQuest: (state, action: PayloadAction<Quest | null>) => {
      state.selectedQuest = action.payload;
    },
    resetProfile: (state) => {
      state.profile = null;
      state.isLoading = false;
      state.error = null;
      state.selectedBadge = null;
      state.selectedQuest = null;
    }
  }
});

export const {
  setProfile,
  updateProfile,
  setLoading,
  setError,
  selectBadge,
  selectQuest,
  resetProfile
} = profileSlice.actions;

export default profileSlice.reducer; 