import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Video, VideoState, RelatedVideo } from '../../types/video';

const initialState: VideoState = {
  currentVideo: null,
  relatedVideos: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  error: null,
  isFullscreen: false,
  showControls: true,
  adLoaded: false,
  adError: null,
  thumbnailUrl: null
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setCurrentVideo: (state, action: PayloadAction<Video>) => {
      state.currentVideo = action.payload;
      state.error = null;
    },
    setRelatedVideos: (state, action: PayloadAction<RelatedVideo[]>) => {
      state.relatedVideos = action.payload;
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
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFullscreen: (state, action: PayloadAction<boolean>) => {
      state.isFullscreen = action.payload;
    },
    setShowControls: (state, action: PayloadAction<boolean>) => {
      state.showControls = action.payload;
    },
    setAdLoaded: (state, action: PayloadAction<boolean>) => {
      state.adLoaded = action.payload;
    },
    setAdError: (state, action: PayloadAction<string | null>) => {
      state.adError = action.payload;
    },
    setThumbnailUrl: (state, action: PayloadAction<string>) => {
      console.log('[VideoSlice] Setting thumbnailUrl in state to:', action.payload);
      state.thumbnailUrl = action.payload;
    },
    updateVideoProgress: (state, action: PayloadAction<number>) => {
      if (state.currentVideo) {
        state.currentVideo.progress = action.payload;
      }
    },
    resetVideo: () => initialState
  }
});

export const {
  setCurrentVideo,
  setRelatedVideos,
  setPlaying,
  setCurrentTime,
  setDuration,
  setLoading,
  setError,
  setFullscreen,
  setShowControls,
  setAdLoaded,
  setAdError,
  setThumbnailUrl,
  updateVideoProgress,
  resetVideo
} = videoSlice.actions;

export default videoSlice.reducer; 