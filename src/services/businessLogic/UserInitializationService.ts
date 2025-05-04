import { db } from '@/config/firebase';
import { VideoStatusService } from './VideoStatusService';
import { ParcoursStatusService } from './ParcoursStatusService';
import { QuizStatusService } from './QuizStatusService';
import { DodjiService } from './DodjiService';
import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { ParcoursStatusUpdate } from '@/types/parcours';
import { VideoStatusUpdate } from '@/types/video';
import { QuizStatusUpdate } from '@/types/quiz';

interface ParcoursData extends DocumentData {
    domaine: string;
    niveau: string;
    ordre: number;
    videoIds: string[];
    quizId: string;
}

interface ThemeLevel {
    domaine: string;
    niveau: string;
    parcours: Array<{
        id: string;
        ordre: number;
        videoIds: string[];
        quizId: string;
    }>;
}

interface Parcours {
    id: string;
    domaine: string;
    niveau: string;
    ordre: number;
}

export class UserInitializationService {
    private static readonly PARCOURS_COLLECTION = 'parcours';
    private static readonly VIDEOS_COLLECTION = 'videos';
    private static readonly QUIZZES_COLLECTION = 'quizzes';

    /**
     * Initialize a new user's data
     */
    static async initializeUser(userId: string): Promise<void> {
        try {
            console.log('Début de l\'initialisation de l\'utilisateur...');
            
            // Initialize Dodji account
            await DodjiService.initializeUserDodji(userId);
            console.log('Compte Dodji initialisé');

            // Initialize all statuses (parcours, videos, and quizzes)
            await this.initializeAllStatuses(userId);
            console.log('Tous les statuts ont été initialisés');

            console.log('Initialisation de l\'utilisateur terminée avec succès');
        } catch (error) {
            console.error('Error initializing user:', error);
            throw new Error('Failed to initialize user');
        }
    }

    /**
     * Initialize Dodji tokens and account for a new user
     */
    static async initializeUserDodji(userId: string): Promise<void> {
        await DodjiService.initializeUserDodji(userId);
    }

    /**
     * Initialize video statuses for a new user
     */
    static async initializeUserVideoStatus(userId: string): Promise<void> {
        // For now, we don't need to initialize any video statuses by default
        // They will be initialized when the user accesses a pathway
        return Promise.resolve();
    }

    /**
     * Initialize parcours data for a new user
     */
    static async initializeUserParcours(userId: string): Promise<void> {
        try {
            // Get all themes and levels structure
            const themes = await this.getThemesAndLevels();
            
            // Initialize parcours statuses
            await this.initializeParcoursStatuses(userId, themes);
            
            // Initialize videos statuses
            await this.initializeVideoStatuses(userId, themes);
            
            // Initialize quiz statuses
            await this.initializeQuizStatuses(userId, themes);
        } catch (error) {
            console.error('Error initializing user parcours:', error);
            throw error;
        }
    }

    /**
     * Initialize all statuses (parcours, videos, quizzes)
     */
    private static async initializeAllStatuses(userId: string) {
        try {
            // 1. Get all themes and levels structure
            const themes = await this.getThemesAndLevels();

            // 2. Initialize parcours statuses
            // Block all parcours except first one of each theme/level
            await this.initializeParcoursStatuses(userId, themes);

            // 3. Initialize videos statuses
            // Block all videos except first ones in unblocked parcours
            await this.initializeVideoStatuses(userId, themes);

            // 4. Initialize quiz statuses
            // Block all quizzes initially
            await this.initializeQuizStatuses(userId, themes);
        } catch (error) {
            console.error('Error initializing statuses:', error);
            throw error;
        }
    }

    /**
     * Get themes and levels structure
     */
    private static async getThemesAndLevels(): Promise<ThemeLevel[]> {
        try {
            const parcoursRef = collection(db, this.PARCOURS_COLLECTION);
            const parcoursSnap = await getDocs(parcoursRef);
            
            const themeLevels: { [key: string]: ThemeLevel } = {};
            
            parcoursSnap.forEach(doc => {
                const parcours = { id: doc.id, ...doc.data() } as ParcoursData & { id: string };
                const key = `${parcours.domaine}_${parcours.niveau}`;
                
                if (!themeLevels[key]) {
                    themeLevels[key] = {
                        domaine: parcours.domaine,
                        niveau: parcours.niveau,
                        parcours: []
                    };
                }
                
                themeLevels[key].parcours.push({
                    id: parcours.id,
                    ordre: parcours.ordre,
                    videoIds: parcours.videoIds || [],
                    quizId: parcours.quizId
                });
            });

            // Sort parcours by ordre within each theme/level
            Object.values(themeLevels).forEach(themeLevel => {
                themeLevel.parcours.sort((a, b) => a.ordre - b.ordre);
            });

            return Object.values(themeLevels);
        } catch (error) {
            console.error('Error getting themes and levels:', error);
            throw error;
        }
    }

    /**
     * Initialize parcours statuses
     */
    private static async initializeParcoursStatuses(userId: string, themes: ThemeLevel[]) {
        try {
            for (const theme of themes) {
                // Sort parcours by ordre to ensure correct initialization
                const sortedParcours = [...theme.parcours].sort((a, b) => a.ordre - b.ordre);
                
                for (let i = 0; i < sortedParcours.length; i++) {
                    const parcours = sortedParcours[i];
                    await ParcoursStatusService.updateParcoursStatus(
                        userId,
                        parcours.id,
                        theme.domaine,
                        i === 0 ? 'unblocked' : 'blocked' // Only the first parcours in each theme is unblocked
                    );
                }
            }
        } catch (error) {
            console.error('Error initializing parcours statuses:', error);
            throw error;
        }
    }

    /**
     * Initialize video statuses
     */
    private static async initializeVideoStatuses(userId: string, themes: ThemeLevel[]) {
        try {
            // Get all unique video IDs
            const allVideoIds = new Set<string>();
            themes.forEach(theme => 
                theme.parcours.forEach(parcours => 
                    parcours.videoIds.forEach(videoId => 
                        allVideoIds.add(videoId)
                    )
                )
            );

            // First, block all videos
            for (const videoId of allVideoIds) {
                const update: VideoStatusUpdate = {
                    userId,
                    videoId,
                    parcoursId: this.findParcoursIdForVideo(themes, videoId),
                    completionStatus: 'blocked'
                };
                await VideoStatusService.updateVideoStatus(update);
            }

            // Then, unblock first videos of unblocked parcours
            for (const theme of themes) {
                const firstParcours = theme.parcours.find(p => p.ordre === 1);
                if (firstParcours && firstParcours.videoIds.length > 0) {
                    const firstVideoId = firstParcours.videoIds[0];
                    const update: VideoStatusUpdate = {
                        userId,
                        videoId: firstVideoId,
                        parcoursId: firstParcours.id,
                        completionStatus: 'unblocked'
                    };
                    await VideoStatusService.updateVideoStatus(update);
                }
            }
        } catch (error) {
            console.error('Error initializing video statuses:', error);
            throw error;
        }
    }

    /**
     * Initialize quiz statuses
     */
    private static async initializeQuizStatuses(userId: string, themes: ThemeLevel[]) {
        try {
            console.log('Initialisation des statuts des quiz...');
            
            // Récupérer tous les quiz de tous les parcours
            const allQuizIds = new Set<string>();
            const quizParcoursMap = new Map<string, string>();

            // Collecter tous les IDs de quiz
            themes.forEach(theme => {
                theme.parcours.forEach(parcours => {
                    if (parcours.quizId) {
                        allQuizIds.add(parcours.quizId);
                        quizParcoursMap.set(parcours.quizId, parcours.id);
                    }
                });
            });

            // Initialiser chaque quiz en statut 'blocked'
            for (const quizId of allQuizIds) {
                const parcoursId = quizParcoursMap.get(quizId);
                if (!parcoursId) continue;

                const update: QuizStatusUpdate = {
                    userId,
                    quizId,
                    parcoursId,
                    status: 'blocked',
                    progress: {
                        score: 0,
                        attempts: 0,
                        bestScore: 0,
                        lastAttemptAt: new Date().toISOString(),
                        averageScore: 0,
                        totalTimeSpent: 0,
                        successRate: 0
                    }
                };

                await QuizStatusService.updateQuizStatus(update);
                console.log(`Quiz ${quizId} initialisé comme 'blocked' pour l'utilisateur ${userId}`);
            }

            console.log('Initialisation des quiz terminée avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des statuts des quiz:', error);
            throw error;
        }
    }

    /**
     * Helper method to find the parcours ID for a video
     */
    private static findParcoursIdForVideo(themes: ThemeLevel[], videoId: string): string {
        for (const theme of themes) {
            for (const parcours of theme.parcours) {
                if (parcours.videoIds.includes(videoId)) {
                    return parcours.id;
                }
            }
        }
        throw new Error(`No parcours found for video ${videoId}`);
    }
} 