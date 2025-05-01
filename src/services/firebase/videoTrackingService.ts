import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  Timestamp, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  DocumentReference
} from 'firebase/firestore';
import { db } from './config';

/**
 * Interface for the video watching progress data to be stored in Firestore
 */
export interface VideoWatchingProgress {
  videoId: string;
  currentTime: number; // Position in seconds
  duration: number; // Total video duration in seconds
  progress: number; // Progress percentage (0-100)
  lastUpdated: Timestamp;
  completionStatus: 'notStarted' | 'inProgress' | 'completed';
  metadata?: {
    courseId?: string;
    videoTitle?: string;
    videoSection?: string;
  };
}

/**
 * Service to handle all video tracking related operations with Firestore
 */
export class VideoTrackingService {
  private static instance: VideoTrackingService;
  
  private constructor() {
    // Private constructor to prevent direct construction calls with the `new` operator
  }
  
  /**
   * Gets the singleton instance of VideoTrackingService
   */
  public static getInstance(): VideoTrackingService {
    if (!VideoTrackingService.instance) {
      VideoTrackingService.instance = new VideoTrackingService();
    }
    return VideoTrackingService.instance;
  }
  
  /**
   * Updates the video progress for a user
   * @param userId User ID
   * @param videoId Video ID
   * @param currentTime Current position in the video in seconds
   * @param duration Total duration of the video in seconds
   * @param metadata Optional metadata about the video
   * @returns Promise<void>
   */
  public async updateProgress(
    userId: string, 
    videoId: string, 
    currentTime: number, 
    duration: number,
    metadata?: { courseId?: string; videoTitle?: string; videoSection?: string }
  ): Promise<void> {
    try {
      if (!userId || !videoId) {
        console.warn('Cannot update video progress: missing userId or videoId');
        return;
      }
      
      console.log(`Updating progress for user ${userId}, video ${videoId}: ${currentTime}/${duration}s`);
      
      // Calculate progress percentage
      const progress = duration > 0 ? Math.min(Math.round((currentTime / duration) * 100), 100) : 0;
      
      // Determine completion status - marking as completed at 90% instead of 95%
      let completionStatus: 'notStarted' | 'inProgress' | 'completed' = 'notStarted';
      if (progress >= 90) { // Changed from 95 to 90 as per requirement
        completionStatus = 'completed';
      } else if (progress > 0) {
        completionStatus = 'inProgress';
      }
      
      // Create/update the document in the user's video subcollection
      const videoProgressRef = doc(db, `users/${userId}/video/${videoId}`);
      
      // Get existing document to check if it already exists
      const existingDoc = await getDoc(videoProgressRef);
      
      const progressData: VideoWatchingProgress = {
        videoId,
        currentTime,
        duration,
        progress,
        lastUpdated: Timestamp.now(),
        completionStatus,
        metadata
      };
      
      if (existingDoc.exists()) {
        // Only update if:
        // 1. Progress is greater than before, or
        // 2. Last update was more than 5 seconds ago
        const existingData = existingDoc.data() as VideoWatchingProgress;
        if (progress > existingData.progress || 
            (existingData.lastUpdated && 
             (Timestamp.now().seconds - existingData.lastUpdated.seconds) > 5)) {
          console.log(`Updating existing progress document: ${progress}% (status: ${completionStatus})`);
          await updateDoc(videoProgressRef, progressData);
        }
      } else {
        // Create new document
        console.log(`Creating new progress document: ${progress}% (status: ${completionStatus})`);
        await setDoc(videoProgressRef, progressData);
      }
      
      // If video is completed, update the user's statistics
      if (completionStatus === 'completed') {
        console.log(`Video ${videoId} marked as completed for user ${userId}`);
        await this.updateVideoCompletionStats(userId, videoId, metadata?.courseId);
      }
    } catch (error) {
      console.error('Error updating video progress:', error);
      // Don't throw the error to avoid crashing the app - just log it
    }
  }
  
  /**
   * Gets the video progress for a user
   * @param userId User ID
   * @param videoId Video ID
   * @returns Promise<VideoWatchingProgress | null>
   */
  public async getProgress(userId: string, videoId: string): Promise<VideoWatchingProgress | null> {
    try {
      if (!userId || !videoId) return null;
      
      console.log(`Getting progress for user ${userId}, video ${videoId}`);
      const progressRef = doc(db, `users/${userId}/video/${videoId}`);
      const progressDoc = await getDoc(progressRef);
      
      if (!progressDoc.exists()) {
        console.log(`No progress found for video ${videoId}`);
        return null;
      }
      
      const data = progressDoc.data() as VideoWatchingProgress;
      console.log(`Found progress: ${data.progress}% (${data.currentTime}/${data.duration}s)`);
      return data;
    } catch (error) {
      console.error('Error getting video progress:', error);
      return null;
    }
  }
  
  /**
   * Gets all video progress for a user in a specific course
   * @param userId User ID
   * @param courseId Course ID
   * @returns Promise<VideoWatchingProgress[]>
   */
  public async getProgressForCourse(userId: string, courseId: string): Promise<VideoWatchingProgress[]> {
    try {
      if (!userId || !courseId) return [];
      
      console.log(`Getting all progress for user ${userId} in course ${courseId}`);
      const videosQuery = query(
        collection(db, `users/${userId}/video`),
        where('metadata.courseId', '==', courseId)
      );
      
      const querySnapshot = await getDocs(videosQuery);
      const progressList = querySnapshot.docs.map(doc => doc.data() as VideoWatchingProgress);
      console.log(`Found ${progressList.length} videos with progress for course ${courseId}`);
      return progressList;
    } catch (error) {
      console.error('Error getting course video progress:', error);
      return [];
    }
  }
  
  /**
   * Updates video completion statistics when a user completes a video
   * @param userId User ID
   * @param videoId Video ID
   * @param courseId Optional course ID to update course progress
   */
  private async updateVideoCompletionStats(
    userId: string, 
    videoId: string,
    courseId?: string
  ): Promise<void> {
    try {
      // Create a record in the user's video completion history
      const completionRef = doc(db, `users/${userId}/video_completions/${videoId}`);
      
      console.log(`Updating completion stats for video ${videoId} in course ${courseId || 'unknown'}`);
      
      await setDoc(completionRef, {
        videoId,
        completedAt: Timestamp.now(),
        courseId
      }, { merge: true });
      
      // If courseId is provided, we could update course progress here
      if (courseId) {
        console.log(`Video ${videoId} completed in course ${courseId} by user ${userId}`);
        // This is where you would add additional course progress updates if needed
      }
    } catch (error) {
      console.error('Error updating video completion stats:', error);
    }
  }
}

// Export a singleton instance
export const videoTrackingService = VideoTrackingService.getInstance(); 