import { Section, Level } from './home';
import { Timestamp } from 'firebase/firestore';

export type VideoStatus = {
    userId: string;
    videoId: string;
    parcoursId: string;
    status: 'blocked' | 'unblocked' | 'completed';
    progress: VideoProgress | null;
    createdAt: Date;
    updatedAt: Date;
    history: VideoHistory[];
};

export interface Video {
  id: string;
  title: string;
  titre?: string;
  description: string;
  videoUrl: string;
  duration: number;
  duree?: string;
  thumbnail: string;
  order: number;
  courseId: string;
  isUnlocked: boolean;
  lastWatchedPosition?: number;
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
  progress: number;
}

export interface VideoProgress {
  currentTime: number;
  duration: number;
  completionStatus: 'blocked' | 'unblocked' | 'completed';
  lastUpdated: Date | Timestamp;
  percentage: number;
  metadata: {
    videoId: string;
    courseId: string;
    videoSection: string;
    videoTitle: string;
    progress: number;
  };
}

// Ajout du type FirebaseTimestamp pour la compatibilité avec Firestore
type FirebaseTimestamp = {
  toDate(): Date;
  seconds: number;
  nanoseconds: number;
};

export type VideoHistory = {
    date: Date;
    duration: number;
    completed: boolean;
};

export interface UserVideo {
    userId: string;
    videoId: string;
    parcoursId: string;
    status: 'blocked' | 'unblocked' | 'completed';
    progress: VideoProgress;
    history: VideoHistory[];
    createdAt: string;
    updatedAt: string;
    ordre: number;
}

export type VideoStatusUpdate = {
    userId: string;
    videoId: string;
    parcoursId: string;
    status: UserVideo['status'];
    progress?: VideoProgress;
};

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