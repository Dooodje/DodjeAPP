import { db } from '@/config/firebase';
import { ParcoursStatusService } from './ParcoursStatusService';
import { VideoStatusService } from './VideoStatusService';
import { QuizStatusService } from './QuizStatusService';
import { DodjiService } from './DodjiService';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ParcoursStatus } from '@/types/parcours';
import { VideoStatus, VideoProgress } from '@/types/video';
import { QuizResult } from '@/types/quiz';

export class ProgressionService {
    private static readonly PARCOURS_COLLECTION = 'parcours';
    private static readonly VIDEO_COMPLETION_THRESHOLD = 0.9; // 90% watched
    private static readonly QUIZ_COMPLETION_THRESHOLD = 0.7; // 70% correct
    private static readonly DODJI_REWARD_AMOUNT = 100; // Amount of Dodji tokens awarded for completing a parcours

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
            // Update video progress
            await VideoStatusService.updateVideoProgress(userId, videoId, progress);

            // Check if video is completed based on progress
            if (this.isVideoCompleted(progress)) {
                // Mark video as completed
                await VideoStatusService.updateVideoStatus({
                    userId,
                    videoId,
                    parcoursId,
                    status: 'completed'
                });

                // Unlock next video in parcours
                await this.unlockNextVideo(userId, parcoursId, videoId);

                // Check if all videos in parcours are completed
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
     * Unlock the next video in a parcours
     */
    private static async unlockNextVideo(
        userId: string,
        parcoursId: string,
        currentVideoId: string
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
                const currentIndex = videoIds.indexOf(currentVideoId);

                if (currentIndex >= 0 && currentIndex < videoIds.length - 1) {
                    const nextVideoId = videoIds[currentIndex + 1];
                    await VideoStatusService.updateVideoStatus({
                        userId,
                        videoId: nextVideoId,
                        parcoursId,
                        status: 'unblocked'
                    });
                }
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
                        status: 'unblocked'
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
} 