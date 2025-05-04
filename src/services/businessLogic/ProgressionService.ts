import { db } from '@/config/firebase';
import { ParcoursStatusService } from './ParcoursStatusService';
import { VideoStatusService } from './VideoStatusService';
import { QuizStatusService } from './QuizStatusService';
import { DodjiService } from './DodjiService';
import { collection, query, where, getDocs, orderBy, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ParcoursStatus } from '@/types/parcours';
import { VideoStatus, VideoProgress, VideoCompletionStatus } from '@/types/video';
import { QuizResult } from '@/types/quiz';

export class ProgressionService {
    private static readonly PARCOURS_COLLECTION = 'parcours';
    private static readonly VIDEO_COMPLETION_THRESHOLD = 0.9; // 90% watched
    private static readonly QUIZ_COMPLETION_THRESHOLD = 0.7; // 70% correct
    private static readonly DODJI_REWARD_AMOUNT = 100; // Amount of Dodji tokens awarded for completing a parcours
    private static readonly USERS_COLLECTION = 'users';
    private static readonly VIDEOS_COLLECTION = 'videos';

    /**
     * Handle video progress update and trigger necessary status changes
     */
    static async handleVideoProgress(
        userId: string,
        videoId: string,
        parcoursId: string,
        progress: VideoProgress
    ): Promise<void> {
        try {
            // Get the user's video document
            const videoRef = doc(db, 'users', userId, 'video', videoId);
            const videoDoc = await getDoc(videoRef);

            // Calculate completion percentage
            const completionPercentage = progress.duration > 0 
                ? (progress.currentTime / progress.duration) * 100 
                : 0;

            // Determine completion status
            let completionStatus: VideoProgress['completionStatus'] = 'unblocked';
            if (completionPercentage >= 90) {
                completionStatus = 'completed';
            } else if (videoDoc.exists() && videoDoc.data().completionStatus === 'completed') {
                // Keep completed status if already completed
                completionStatus = 'completed';
            }

            // Update video document
            const videoData = {
                completionStatus,
                currentTime: progress.currentTime,
                duration: progress.duration,
                lastUpdated: new Date().toISOString(),
                metadata: {
                    courseId: parcoursId,
                    videoSection: progress.metadata?.videoSection || '',
                    videoTitle: progress.metadata?.videoTitle || ''
                },
                progress: Math.floor(completionPercentage),
                videoId
            };

            if (videoDoc.exists()) {
                await updateDoc(videoRef, videoData);
            } else {
                await setDoc(videoRef, videoData);
            }

            // If video is completed, unlock next video
            if (completionStatus === 'completed') {
                await this.unlockNextVideo(userId, parcoursId, videoId);
                await this.checkParcoursVideoCompletion(userId, parcoursId);
            }
        } catch (error) {
            console.error('Error handling video progress:', error);
            throw error;
        }
    }

    /**
     * Handle quiz completion and trigger necessary status changes
     */
    static async handleQuizCompletion(
        userId: string,
        quizId: string,
        parcoursId: string,
        result: QuizResult
    ): Promise<void> {
        try {
            // Add quiz attempt
            await QuizStatusService.addQuizAttempt(userId, quizId, result);

            if (result.score >= this.QUIZ_COMPLETION_THRESHOLD) {
                // Mark parcours as completed if quiz is passed
                await ParcoursStatusService.updateParcoursStatus(
                    userId,
                    parcoursId,
                    await this.getThemeId(parcoursId),
                    'completed'
                );

                // Unlock next parcours in theme
                await this.unlockNextParcours(userId, parcoursId);

                // Award Dodji tokens for completion
                await this.awardParcoursCompletion(userId, parcoursId);
            }
        } catch (error) {
            console.error('Error handling quiz completion:', error);
            throw error;
        }
    }

    /**
     * Check if all videos in a parcours are completed
     */
    private static async checkParcoursVideoCompletion(
        userId: string,
        parcoursId: string
    ): Promise<void> {
        try {
            const parcoursRef = await getDocs(
                query(
                    collection(db, this.PARCOURS_COLLECTION),
                    where('id', '==', parcoursId)
                )
            );

            if (!parcoursRef.empty) {
                const parcours = parcoursRef.docs[0].data();
                const videoIds = parcours.videoIds || [];

                // Get status of all videos
                const videoStatuses = await Promise.all(
                    videoIds.map((videoId: string) => 
                        VideoStatusService.getVideoStatus(userId, videoId)
                    )
                );

                // Check if all videos are completed
                const allCompleted = videoStatuses.every(
                    status => status?.status === 'completed'
                );

                if (allCompleted) {
                    // Unlock quiz if all videos are completed
                    await QuizStatusService.updateQuizStatus({
                        userId,
                        quizId: parcours.quizId,
                        parcoursId,
                        status: 'unblocked'
                    });
                }
            }
        } catch (error) {
            console.error('Error checking parcours video completion:', error);
            throw error;
        }
    }

    /**
     * Unlock the next video in a parcours after completing the current one
     */
    private static async unlockNextVideo(
        userId: string,
        parcoursId: string,
        currentVideoId: string
    ): Promise<void> {
        try {
            // Get all videos from the parcours ordered by ordre
            const videosQuery = query(
                collection(db, this.PARCOURS_COLLECTION),
                where('id', '==', parcoursId)
            );

            const parcoursDoc = await getDocs(videosQuery);
            if (parcoursDoc.empty) return;

            const parcours = parcoursDoc.docs[0].data();
            const videoIds = parcours.videoIds || [];

            // Find the index of the current video
            const currentIndex = videoIds.indexOf(currentVideoId);
            if (currentIndex === -1 || currentIndex === videoIds.length - 1) return;

            // Get the next video ID
            const nextVideoId = videoIds[currentIndex + 1];

            // Check the user's video subcollection for the next video's status
            const userVideoRef = doc(db, 'users', userId, 'video', nextVideoId);
            const userVideoDoc = await getDoc(userVideoRef);

            // If the document exists and is not already completed or unblocked
            if (userVideoDoc.exists()) {
                const videoData = userVideoDoc.data();
                if (videoData.completionStatus === 'blocked') {
                    // Update to unblocked
                    await updateDoc(userVideoRef, {
                        completionStatus: 'unblocked'
                    });
                }
            } else {
                // Create new document with unblocked status
                await setDoc(userVideoRef, {
                    completionStatus: 'unblocked',
                    currentTime: 0,
                    duration: 0,
                    lastUpdated: new Date().toISOString(),
                    metadata: {
                        courseId: parcoursId,
                        videoSection: '',
                        videoTitle: ''
                    },
                    progress: 0,
                    videoId: nextVideoId
                });
            }
        } catch (error) {
            console.error('Error unlocking next video:', error);
            throw error;
        }
    }

    /**
     * Unlock the next parcours in a theme
     */
    private static async unlockNextParcours(
        userId: string,
        currentParcoursId: string
    ): Promise<void> {
        try {
            const currentParcours = (await getDocs(
                query(
                    collection(db, this.PARCOURS_COLLECTION),
                    where('id', '==', currentParcoursId)
                )
            )).docs[0].data();

            const nextParcours = (await getDocs(
                query(
                    collection(db, this.PARCOURS_COLLECTION),
                    where('domaine', '==', currentParcours.domaine),
                    where('niveau', '==', currentParcours.niveau),
                    where('ordre', '>', currentParcours.ordre),
                    orderBy('ordre'),
                    where('active', '==', true)
                )
            )).docs[0];

            if (nextParcours) {
                await ParcoursStatusService.updateParcoursStatus(
                    userId,
                    nextParcours.id,
                    currentParcours.domaine,
                    'unblocked'
                );

                // Unlock first video of next parcours
                const nextParcoursData = nextParcours.data();
                if (nextParcoursData.videoIds?.length > 0) {
                    await VideoStatusService.updateVideoStatus({
                        userId,
                        videoId: nextParcoursData.videoIds[0],
                        parcoursId: nextParcours.id,
                        completionStatus: 'unblocked',
                        progress: {
                            currentTime: 0,
                            duration: 0,
                            completionStatus: 'unblocked',
                            lastUpdated: new Date(),
                            percentage: 0,
                            metadata: {
                                videoId: nextParcoursData.videoIds[0],
                                courseId: nextParcours.id,
                                videoSection: '',
                                videoTitle: '',
                                progress: 0
                            }
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error unlocking next parcours:', error);
            throw error;
        }
    }

    /**
     * Get theme ID for a parcours
     */
    private static async getThemeId(parcoursId: string): Promise<string> {
        try {
            const parcoursRef = await getDocs(
                query(
                    collection(db, this.PARCOURS_COLLECTION),
                    where('id', '==', parcoursId)
                )
            );

            if (!parcoursRef.empty) {
                return parcoursRef.docs[0].data().domaine;
            }
            throw new Error('Parcours not found');
        } catch (error) {
            console.error('Error getting theme ID:', error);
            throw error;
        }
    }

    /**
     * Award Dodji tokens for parcours completion
     */
    private static async awardParcoursCompletion(
        userId: string,
        parcoursId: string
    ): Promise<void> {
        try {
            if (!(await DodjiService.hasReceivedReward(userId, 'parcours_completion', parcoursId))) {
                await DodjiService.addTransaction(userId, {
                    amount: this.DODJI_REWARD_AMOUNT,
                    source: 'parcours_completion',
                    sourceId: parcoursId,
                    description: 'Parcours completion reward',
                    createdAt: new Date()
                });
            }
        } catch (error) {
            console.error('Error awarding parcours completion:', error);
            throw error;
        }
    }

    private static isVideoCompleted(progress: VideoProgress): boolean {
        return progress.percentage >= this.VIDEO_COMPLETION_THRESHOLD;
    }

    /**
     * Récupère la progression d'un utilisateur pour un parcours spécifique
     */
    static async getCourseProgress(userId: string, parcoursId: string): Promise<Map<string, VideoProgress>> {
        try {
            const userVideosRef = collection(db, this.USERS_COLLECTION, userId, 'video');
            const userVideosSnapshot = await getDocs(userVideosRef);
            
            const progressMap = new Map<string, VideoProgress>();
            
            // Récupérer tous les documents de vidéo pour ce parcours
            const videosQuery = query(
                collection(db, this.VIDEOS_COLLECTION),
                where('parcoursId', '==', parcoursId)
            );
            const videosSnapshot = await getDocs(videosQuery);
            
            // Initialiser toutes les vidéos comme bloquées par défaut
            videosSnapshot.docs.forEach(videoDoc => {
                const videoData = videoDoc.data();
                progressMap.set(videoDoc.id, {
                    currentTime: 0,
                    duration: videoData.duration || 0,
                    completionStatus: 'blocked',
                    lastUpdated: new Date(),
                    percentage: 0,
                    metadata: {
                        videoId: videoDoc.id,
                        courseId: parcoursId,
                        videoSection: videoData.section || '',
                        videoTitle: videoData.title || videoData.titre || '',
                        progress: 0
                    }
                });
            });
            
            // Mettre à jour avec les données réelles de l'utilisateur
            userVideosSnapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.metadata?.courseId === parcoursId) {
                    progressMap.set(doc.id, {
                        currentTime: data.currentTime || 0,
                        duration: data.duration || 0,
                        completionStatus: data.completionStatus as VideoCompletionStatus,
                        lastUpdated: new Date(data.lastUpdated),
                        percentage: data.progress || 0,
                        metadata: {
                            videoId: doc.id,
                            courseId: data.metadata.courseId,
                            videoSection: data.metadata.videoSection || '',
                            videoTitle: data.metadata.videoTitle || '',
                            progress: data.progress || 0
                        }
                    });
                }
            });
            
            // S'assurer que la première vidéo est débloquée si aucune n'est complétée
            const hasCompletedVideos = Array.from(progressMap.values()).some(
                progress => progress.completionStatus === 'completed'
            );
            
            if (!hasCompletedVideos) {
                const firstVideoId = videosSnapshot.docs[0]?.id;
                if (firstVideoId && progressMap.has(firstVideoId)) {
                    const firstVideoProgress = progressMap.get(firstVideoId)!;
                    firstVideoProgress.completionStatus = 'unblocked';
                    progressMap.set(firstVideoId, firstVideoProgress);
                }
            }
            
            return progressMap;
        } catch (error) {
            console.error('Error getting course progress:', error);
            throw error;
        }
    }

    static async updateVideoStatus(userId: string, videoId: string, parcoursId: string, completionStatus: VideoCompletionStatus): Promise<void> {
        try {
            await VideoStatusService.updateVideoStatus({
                userId,
                videoId,
                parcoursId,
                completionStatus,
                progress: {
                    currentTime: 0,
                    duration: 0,
                    completionStatus,
                    lastUpdated: new Date(),
                    percentage: 0,
                    metadata: {
                        videoId,
                        courseId: parcoursId,
                        videoSection: '',
                        videoTitle: '',
                        progress: 0
                    }
                }
            });
        } catch (error) {
            console.error('Error updating video status:', error);
            throw error;
        }
    }
} 