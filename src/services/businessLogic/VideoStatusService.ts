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
            const { userId, videoId, parcoursId, completionStatus, progress } = update;
            const videoRef = doc(db, this.USERS_COLLECTION, userId, 'video', videoId);

            // Get video metadata from videos collection
            const videoOrderDoc = await getDoc(doc(db, this.VIDEOS_COLLECTION, videoId));
            const videoMetadata = videoOrderDoc.exists() ? videoOrderDoc.data() : null;

            const now = new Date();
            const currentProgress = progress?.currentTime || 0;
            const videoDuration = videoMetadata?.duration || 0;
            const progressPercentage = videoDuration > 0 ? Math.floor((currentProgress / videoDuration) * 100) : 0;

            // Create the document data
            const videoDoc = {
                completionStatus,
                currentTime: currentProgress,
                duration: videoDuration,
                lastUpdated: now.toISOString(),
                metadata: {
                    courseId: parcoursId,
                    videoSection: videoMetadata?.section || '',
                    videoTitle: videoMetadata?.title || videoMetadata?.titre || ''
                },
                progress: progressPercentage,
                videoId: videoId
            };

            await setDoc(videoRef, videoDoc);

            // Si la vidéo est complétée
            if (completionStatus === 'completed') {
                console.log(`Video ${videoId} marked as completed for user ${userId}`);
                
                // Vérifier et débloquer le quiz si toutes les vidéos sont complétées
                await QuizStatusService.checkAndUnlockQuizzes(userId, parcoursId, videoId);
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
                completionStatus: videoStatus.completionStatus,
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
            // Temporairement : retirer le orderBy pour éviter l'erreur d'index
            const videosQuery = query(
                collection(db, this.USERS_COLLECTION, userId, 'video'),
                where('parcoursId', '==', parcoursId)
                // Le orderBy a été retiré pour éviter l'erreur d'index
            );

            const videosSnapshot = await getDocs(videosQuery);
            const videos = videosSnapshot.docs.map(doc => doc.data() as UserVideo);
            
            // Trier côté client avec gestion des valeurs undefined
            videos.sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
            
            return videos;
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
                where('parcoursId', '==', parcoursId)
            );

            const videosSnapshot = await getDocs(videosQuery);
            const videos = videosSnapshot.docs;
            
            // Trier côté client
            videos.sort((a, b) => {
                const dataA = a.data();
                const dataB = b.data();
                return (dataA.ordre || 0) - (dataB.ordre || 0);
            });

            if (videos.length === 0) return;

            const now = new Date();

            // First video is unblocked, others are blocked
            for (let i = 0; i < videos.length; i++) {
                const video = videos[i];
                const videoData = video.data();
                const completionStatus = i === 0 ? 'unblocked' : 'blocked';

                const videoDoc = {
                    completionStatus,
                    currentTime: 0,
                    duration: videoData.duration || 0,
                    lastUpdated: now.toISOString(),
                    metadata: {
                        courseId: parcoursId,
                        videoSection: videoData.section || '',
                        videoTitle: videoData.title || videoData.titre || ''
                    },
                    progress: 0,
                    videoId: video.id
                };

                await setDoc(doc(db, this.USERS_COLLECTION, userId, 'video', video.id), videoDoc);
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
                    completionStatus: 'unblocked',
                    progress: {
                        currentTime: 0,
                        duration: nextVideoData.duration || 0,
                        completionStatus: 'unblocked',
                        lastUpdated: new Date(),
                        percentage: 0,
                        metadata: {
                            videoId: nextVideo.id,
                            courseId: parcoursId,
                            videoSection: nextVideoData.section || '',
                            videoTitle: nextVideoData.title || nextVideoData.titre || '',
                            progress: 0
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error unlocking next video:', error);
            throw error;
        }
    }
} 