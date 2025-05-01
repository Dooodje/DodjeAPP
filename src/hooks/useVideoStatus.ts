import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { VideoStatusService } from '../services/businessLogic/VideoStatusService';
import { UserVideo, VideoProgress } from '../types/video';

export const useVideoStatus = (videoId: string, parcoursId: string) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [videoStatus, setVideoStatus] = useState<UserVideo | null>(null);

    // Load initial video status
    useEffect(() => {
        const loadVideoStatus = async () => {
            if (!user?.uid || !videoId) return;

            try {
                setLoading(true);
                setError(null);
                const status = await VideoStatusService.getVideoStatus(user.uid, videoId);
                setVideoStatus(status);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An error occurred';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadVideoStatus();
    }, [user?.uid, videoId]);

    // Update video status
    const updateStatus = useCallback(async (status: UserVideo['status']) => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            setError(null);
            
            // Get current progress if it exists
            const currentProgress: VideoProgress = videoStatus?.progress || {
                currentTime: 0,
                duration: 0,
                completionStatus: status,
                lastUpdated: new Date(),
                percentage: 0,
                metadata: {
                    videoId: videoId,
                    courseId: parcoursId,
                    videoSection: '',
                    videoTitle: '',
                    progress: 0
                }
            };

            await VideoStatusService.updateVideoStatus({
                userId: user.uid,
                videoId,
                parcoursId,
                status,
                progress: currentProgress
            });

            // Reload status
            const updatedStatus = await VideoStatusService.getVideoStatus(user.uid, videoId);
            setVideoStatus(updatedStatus);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user?.uid, videoId, parcoursId, videoStatus]);

    // Update video progress
    const updateProgress = useCallback(async (newProgress: VideoProgress) => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            setError(null);
            await VideoStatusService.updateVideoProgress(user.uid, videoId, newProgress);

            // Reload status
            const updatedStatus = await VideoStatusService.getVideoStatus(user.uid, videoId);
            setVideoStatus(updatedStatus);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user?.uid, videoId]);

    return {
        videoStatus,
        loading,
        error,
        updateStatus,
        updateProgress
    };
}; 