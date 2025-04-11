import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserSettings } from '../../types/settings';

interface SettingsState {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: null,
  isLoading: false,
  error: null
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<UserSettings>) => {
      state.settings = action.payload;
      state.error = null;
    },
    updateSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      if (state.settings) {
        state.settings = { ...state.settings, ...action.payload };
        state.error = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetSettings: (state) => {
      state.settings = null;
      state.isLoading = false;
      state.error = null;
    }
  }
});

export const {
  setSettings,
  updateSettings,
  setLoading,
  setError,
  resetSettings
} = settingsSlice.actions;

export default settingsSlice.reducer; 