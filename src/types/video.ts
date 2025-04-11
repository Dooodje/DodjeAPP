import { Section, Level } from './home';

export type VideoStatus = 'blocked' | 'unlocked' | 'completed';

export interface Video {
  id: string;
  title: string;
  description: string;
  courseId: string;
  videoUrl: string;
  duration: number;
  order: number;
  progress?: number;
  lastWatchedPosition?: number;
  lastWatchedDate?: Date;
  isUnlocked?: boolean;
  status?: 'new' | 'started' | 'completed';
}

export interface RelatedVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  progress?: number;
}

export interface VideoState {
  currentVideo: Video | null;
  relatedVideos: RelatedVideo[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
  isFullscreen: boolean;
  showControls: boolean;
  adLoaded: boolean;
  adError: string | null;
  thumbnailUrl: string | null;
}

export interface VideoProgress {
  videoId: string;
  progress: number;
  lastWatchedPosition: number;
  lastWatchedDate: Date;
}

export interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onFullscreen: () => void;
  onBack: () => void;
  onSettings: () => void;
}

export interface VideoInfoProps {
  video: Video;
  onUnlock?: () => void;
}

export interface RelatedVideosProps {
  videos: RelatedVideo[];
  onVideoSelect: (videoId: string) => void;
}

export interface VideoPlayerProps {
  videoId: string;
  userId: string;
} 