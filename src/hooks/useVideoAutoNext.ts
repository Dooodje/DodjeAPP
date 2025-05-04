import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { videoService } from '@/services/video';
import { LastVideoResult } from '@/types/video';

interface UseVideoAutoNextProps {
    videoId: string;
    parcoursId: string;
    isCompleted: boolean;
    autoNextDelay?: number; // Délai en secondes avant redirection
}

interface NextVideoInfo {
    id: string | null;
    countdown: number;
    isLoading: boolean;
    isLastVideo: boolean;
    quizId: string | null;
}

export const useVideoAutoNext = ({
    videoId,
    parcoursId,
    isCompleted,
    autoNextDelay = 5 // 5 secondes par défaut
}: UseVideoAutoNextProps) => {
    const router = useRouter();
    const [nextVideo, setNextVideo] = useState<NextVideoInfo>({
        id: null,
        countdown: autoNextDelay,
        isLoading: false,
        isLastVideo: false,
        quizId: null
    });

    // Récupérer l'ID de la prochaine vidéo et les informations du quiz
    const fetchNextVideoId = useCallback(async () => {
        if (!parcoursId || !videoId) {
            console.log('❌ ParcoursId ou VideoId manquant:', { parcoursId, videoId });
            return;
        }

        try {
            console.log('🔍 Début de fetchNextVideoId pour:', { videoId, parcoursId });
            setNextVideo(prev => ({ ...prev, isLoading: true }));
            
            const result = await videoService.getNextVideo(parcoursId, videoId);
            
            if (result === null) {
                setNextVideo(prev => ({
                    ...prev,
                    id: null,
                    isLastVideo: false,
                    quizId: null,
                    isLoading: false,
                    countdown: autoNextDelay
                }));
                return;
            }
            
            // Si c'est la dernière vidéo avec un quiz
            if ('isLastVideo' in result) {
                const lastVideoResult = result as LastVideoResult;
                setNextVideo(prev => ({
                    ...prev,
                    id: null,
                    isLastVideo: true,
                    quizId: lastVideoResult.quizId || null,
                    isLoading: false,
                    countdown: autoNextDelay
                }));
                return;
            }
            
            // C'est une vidéo normale
            setNextVideo(prev => ({
                ...prev,
                id: result.id,
                isLastVideo: false,
                quizId: null,
                isLoading: false,
                countdown: autoNextDelay
            }));
        } catch (error) {
            console.error('❌ Erreur lors de la récupération de la prochaine vidéo:', error);
            setNextVideo(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Une erreur est survenue'
            }));
        }
    }, [parcoursId, videoId, autoNextDelay]);

    // Effet pour démarrer le compte à rebours quand la vidéo est complétée
    useEffect(() => {
        if (isCompleted && nextVideo.id) {
            const timer = setInterval(() => {
                setNextVideo(prev => {
                    if (prev.countdown <= 1) {
                        clearInterval(timer);
                        // Utiliser la navigation Expo Router
                        if (prev.isLastVideo && prev.quizId) {
                            router.push(`/quiz/${prev.quizId}`);
                        } else if (prev.id) {
                            router.push(`/video/${prev.id}`);
                        }
                        return prev;
                    }
                    return { ...prev, countdown: prev.countdown - 1 };
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isCompleted, nextVideo.id, router]);

    // Effet pour charger la prochaine vidéo au montage
    useEffect(() => {
        fetchNextVideoId();
    }, [fetchNextVideoId]);

    return {
        nextVideoId: nextVideo.id,
        isLastVideo: nextVideo.isLastVideo,
        quizId: nextVideo.quizId,
        countdown: nextVideo.countdown,
        isLoading: nextVideo.isLoading
    };
}; 