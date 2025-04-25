import { useEffect, useRef, useCallback } from 'react';
import { videoTrackingService } from '../services/firebase/videoTrackingService';
import { auth } from '../config/firebase';

/**
 * Hook for tracking video watching progress and saving to Firebase
 * @param videoId ID of the video being watched
 * @param metadata Additional metadata about the video (courseId, title, etc.)
 * @param trackingInterval Interval in milliseconds for progress updates (default: 5000ms)
 * @returns Object with tracking functions and state
 */
export const useVideoTracking = (
  videoId: string,
  metadata?: {
    courseId?: string;
    videoTitle?: string;
    videoSection?: string;
  },
  trackingInterval = 5000 // Default to 5 seconds
) => {
  // Reference to the tracking interval
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Reference to the last position and duration to avoid unnecessary updates
  const lastPositionRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  // Flag to track if tracking is active
  const isTrackingRef = useRef<boolean>(false);

  // Clear tracking interval on unmount or when dependencies change
  const clearTrackingInterval = useCallback(() => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    isTrackingRef.current = false;
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTrackingInterval();
    };
  }, [clearTrackingInterval, videoId]);

  // Function to start tracking video progress
  const startTracking = useCallback((initialPosition: number, duration: number) => {
    // Get current user ID
    const userId = auth.currentUser?.uid;
    if (!userId || !videoId) {
      console.warn('Cannot start video tracking: missing userId or videoId');
      return;
    }

    // Update refs with initial values
    lastPositionRef.current = initialPosition;
    durationRef.current = duration;

    // Clear any existing interval
    clearTrackingInterval();

    // Function to update progress
    const updateProgress = async () => {
      try {
        if (!isTrackingRef.current) return;
        
        await videoTrackingService.updateProgress(
          userId,
          videoId,
          lastPositionRef.current,
          durationRef.current,
          metadata
        );
      } catch (error) {
        console.error('Error updating video progress in tracking interval:', error);
      }
    };

    // Set tracking as active and immediately update progress once
    isTrackingRef.current = true;
    updateProgress();

    // Start interval for regular updates
    trackingIntervalRef.current = setInterval(updateProgress, trackingInterval);
  }, [clearTrackingInterval, videoId, metadata, trackingInterval]);

  // Function to update current position during playback
  const updatePosition = useCallback((currentTime: number, duration: number) => {
    if (!isTrackingRef.current) return;
    
    lastPositionRef.current = currentTime;
    
    // Only update duration if it has changed (some players might report varying durations)
    if (duration && duration !== durationRef.current) {
      durationRef.current = duration;
    }
  }, []);

  // Function to pause tracking (e.g., when video is paused)
  const pauseTracking = useCallback(async () => {
    if (!isTrackingRef.current) return;
    
    // Save the current progress before pausing
    const userId = auth.currentUser?.uid;
    if (userId && videoId) {
      try {
        await videoTrackingService.updateProgress(
          userId,
          videoId,
          lastPositionRef.current,
          durationRef.current,
          metadata
        );
      } catch (error) {
        console.error('Error updating video progress when pausing tracking:', error);
      }
    }
    
    clearTrackingInterval();
  }, [clearTrackingInterval, videoId, metadata]);

  // Function to handle video completion
  const completeVideo = useCallback(async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !videoId) return;
    
    try {
      // Update progress to 100%
      await videoTrackingService.updateProgress(
        userId,
        videoId,
        durationRef.current, // Use full duration
        durationRef.current,
        metadata
      );
      
      clearTrackingInterval();
    } catch (error) {
      console.error('Error marking video as completed:', error);
    }
  }, [clearTrackingInterval, videoId, metadata]);

  // Load existing progress when the hook mounts
  useEffect(() => {
    const loadExistingProgress = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId || !videoId) return;
      
      try {
        const progress = await videoTrackingService.getProgress(userId, videoId);
        if (progress) {
          lastPositionRef.current = progress.currentTime;
          durationRef.current = progress.duration;
        }
      } catch (error) {
        console.error('Error loading existing video progress:', error);
      }
    };
    
    loadExistingProgress();
  }, [videoId]);

  return {
    startTracking,
    updatePosition,
    pauseTracking,
    completeVideo,
    isTracking: isTrackingRef.current,
    getLastPosition: () => lastPositionRef.current
  };
}; 