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
            // Initialize Dodji account
            await DodjiService.initializeUserDodji(userId);

            // Get all parcours
            const parcoursQuery = query(collection(db, this.PARCOURS_COLLECTION));
            const parcoursSnapshot = await getDocs(parcoursQuery);
            const allParcours = parcoursSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Parcours[];

            // Group parcours by theme and level
            const parcoursByThemeAndLevel = new Map<string, Map<string, Parcours[]>>();
            
            allParcours.forEach(parcours => {
                if (!parcoursByThemeAndLevel.has(parcours.domaine)) {
                    parcoursByThemeAndLevel.set(parcours.domaine, new Map());
                }
                
                const themeMap = parcoursByThemeAndLevel.get(parcours.domaine)!;
                if (!themeMap.has(parcours.niveau)) {
                    themeMap.set(parcours.niveau, []);
                }
                
                themeMap.get(parcours.niveau)!.push(parcours);
            });

            // Initialize parcours for each theme and level
            for (const [theme, levelMap] of parcoursByThemeAndLevel) {
                for (const [level, parcours] of levelMap) {
                    // Sort parcours by order
                    parcours.sort((a, b) => a.ordre - b.ordre);
                    
                    // Initialize each parcours
                    for (let i = 0; i < parcours.length; i++) {
                        const parcours_i = parcours[i];
                        await ParcoursStatusService.updateParcoursStatus(
                            userId,
                            parcours_i.id,
                            theme,
                            i === 0 ? 'unblocked' : 'blocked' // Only the first parcours in each theme/level is unblocked
                        );
                        
                        console.log(`Initialized parcours ${parcours_i.id} (${theme}/${level}) with status ${i === 0 ? 'unblocked' : 'blocked'}`);
                    }
                }
            }

            console.log('User initialization completed successfully');
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
                    status: 'blocked'
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
                        status: 'unblocked'
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
            // Block all quizzes initially
            for (const theme of themes) {
                for (const parcours of theme.parcours) {
                    if (parcours.quizId) {
                        const update: QuizStatusUpdate = {
                            userId,
                            quizId: parcours.quizId,
                            parcoursId: parcours.id,
                            status: 'blocked'
                        };
                        await QuizStatusService.updateQuizStatus(update);
                    }
                }
            }
        } catch (error) {
            console.error('Error initializing quiz statuses:', error);
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