import { db } from '@/config/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, where, orderBy } from 'firebase/firestore';
import { VideoStatus, VideoProgress, VideoStatusUpdate, UserVideo } from '@/types/video';
import { QuizStatusService } from './QuizStatusService';

export class VideoStatusService {
    private static readonly USERS_COLLECTION = 'users';
    private static readonly VIDEOS_COLLECTION = 'videos';
    private static readonly USER_VIDEOS_SUBCOLLECTION = 'video';

    /**
     * Updates the status of a video for a specific user
     */
    static async updateVideoStatus(update: VideoStatusUpdate): Promise<void> {
        try {
            const { userId, videoId, parcoursId, status, progress } = update;
            const videoRef = doc(db, this.USERS_COLLECTION, userId, 'video', videoId);
            const videoDoc = await getDoc(videoRef);

            // Get video order from videos collection
            const videoOrderDoc = await getDoc(doc(db, this.VIDEOS_COLLECTION, videoId));
            const ordre = videoOrderDoc.exists() ? videoOrderDoc.data().ordre || 0 : 0;

            const now = new Date();
            const videoData: UserVideo = {
                userId,
                videoId,
                parcoursId,
                status,
                progress: progress || {
                    currentTime: 0,
                    duration: 0,
                    percentage: 0
                },
                createdAt: videoDoc.exists() ? (videoDoc.data() as UserVideo).createdAt : now.toISOString(),
                updatedAt: now.toISOString(),
                history: videoDoc.exists() ? (videoDoc.data() as UserVideo).history || [] : [],
                ordre
            };

            if (progress && videoDoc.exists()) {
                const existingData = videoDoc.data() as UserVideo;
                if (existingData.progress) {
                    videoData.history = [
                        ...existingData.history,
                        {
                            date: now,
                            duration: progress.currentTime,
                            completed: progress.percentage >= 90
                        }
                    ];
                }
            }

            await setDoc(videoRef, videoData);

            // If video is completed, try to unlock next video
            if (status === 'completed') {
                await this.unlockNextVideo(userId, parcoursId, videoId);
            }
        } catch (error) {
            console.error('Error updating video status:', error);
            throw error;
        }
    }

    /**
     * Gets the status of a video for a specific user
     */
    static async getVideoStatus(
        userId: string,
        videoId: string
    ): Promise<UserVideo | null> {
        try {
            const videoRef = doc(db, this.USERS_COLLECTION, userId, 'video', videoId);
            const videoDoc = await getDoc(videoRef);

            if (!videoDoc.exists()) {
                return null;
            }

            return videoDoc.data() as UserVideo;
        } catch (error) {
            console.error('Error getting video status:', error);
            throw error;
        }
    }

    /**
     * Updates the progress of a video for a specific user
     */
    static async updateVideoProgress(
        userId: string,
        videoId: string,
        progress: VideoProgress
    ): Promise<void> {
        try {
            const videoStatus = await this.getVideoStatus(userId, videoId);
            if (!videoStatus) {
                throw new Error('Video status not found');
            }

            await this.updateVideoStatus({
                userId,
                videoId,
                parcoursId: videoStatus.parcoursId,
                status: videoStatus.status,
                progress
            });
        } catch (error) {
            console.error('Error updating video progress:', error);
            throw error;
        }
    }

    /**
     * Gets all video statuses for a user in a specific parcours
     */
    static async getUserVideosInParcours(
        userId: string,
        parcoursId: string
    ): Promise<UserVideo[]> {
        try {
            const videosQuery = query(
                collection(db, this.USERS_COLLECTION, userId, 'video'),
                where('parcoursId', '==', parcoursId),
                orderBy('ordre', 'asc')
            );

            const videosSnapshot = await getDocs(videosQuery);
            return videosSnapshot.docs.map(doc => doc.data() as UserVideo);
        } catch (error) {
            console.error('Error getting user videos in parcours:', error);
            throw error;
        }
    }

    /**
     * Récupère l'ordre d'une vidéo dans son parcours
     */
    private static async getVideoOrder(videoId: string): Promise<number> {
        try {
            const videoRef = doc(db, this.VIDEOS_COLLECTION, videoId);
            const videoDoc = await getDoc(videoRef);

            if (!videoDoc.exists()) {
                throw new Error('Vidéo non trouvée');
            }

            return videoDoc.data().ordre || 0;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'ordre de la vidéo:', error);
            return 0;
        }
    }

    /**
     * Initialise les statuts des vidéos d'un parcours
     */
    static async initializeParcoursVideos(userId: string, parcoursId: string): Promise<void> {
        try {
            // Get all videos from the parcours
            const videosQuery = query(
                collection(db, this.VIDEOS_COLLECTION),
                where('parcoursId', '==', parcoursId),
                orderBy('ordre', 'asc')
            );

            const videosSnapshot = await getDocs(videosQuery);
            const videos = videosSnapshot.docs;

            if (videos.length === 0) return;

            // First video is unblocked, others are blocked
            for (let i = 0; i < videos.length; i++) {
                const video = videos[i];
                const videoData = video.data();
                await this.updateVideoStatus({
                    userId,
                    videoId: video.id,
                    parcoursId,
                    status: i === 0 ? 'unblocked' : 'blocked',
                    progress: {
                        currentTime: 0,
                        duration: videoData.duration || 0,
                        percentage: 0
                    }
                });
            }
        } catch (error) {
            console.error('Error initializing parcours videos:', error);
            throw error;
        }
    }

    /**
     * Calcule le pourcentage de progression d'une vidéo
     */
    private static calculateProgressPercentage(
        newProgress: Partial<VideoProgress>,
        currentProgress: VideoProgress
    ): number {
        const currentTime = newProgress.currentTime ?? currentProgress.currentTime;
        const duration = newProgress.duration ?? currentProgress.duration;
        
        if (!duration) return 0;
        return Math.min(100, Math.round((currentTime / duration) * 100));
    }

    /**
     * Vérifie si la vidéo doit être marquée comme complétée
     */
    private static shouldMarkAsCompleted(percentage: number): boolean {
        const COMPLETION_THRESHOLD = 90;
        return percentage >= COMPLETION_THRESHOLD;
    }

    /**
     * Débloque la prochaine vidéo dans le parcours
     */
    private static async unlockNextVideo(userId: string, parcoursId: string, currentVideoId: string): Promise<void> {
        try {
            const videosQuery = query(
                collection(db, this.VIDEOS_COLLECTION),
                where('parcoursId', '==', parcoursId),
                orderBy('ordre', 'asc')
            );

            const videosSnapshot = await getDocs(videosQuery);
            const videos = videosSnapshot.docs;

            // Find current video index
            const currentIndex = videos.findIndex(video => video.id === currentVideoId);
            
            // If there's a next video, unlock it
            if (currentIndex !== -1 && currentIndex < videos.length - 1) {
                const nextVideo = videos[currentIndex + 1];
                const nextVideoData = nextVideo.data();
                await this.updateVideoStatus({
                    userId,
                    videoId: nextVideo.id,
                    parcoursId,
                    status: 'unblocked',
                    progress: {
                        currentTime: 0,
                        duration: nextVideoData.duration || 0,
                        percentage: 0
                    }
                });
            }
        } catch (error) {
            console.error('Error unlocking next video:', error);
            throw error;
        }
    }
} 