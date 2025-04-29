import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoStatusService } from '@/services/businessLogic/VideoStatusService';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { DocumentData } from 'firebase/firestore';

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
}

export const useVideoAutoNext = ({
    videoId,
    parcoursId,
    isCompleted,
    autoNextDelay = 5 // 5 secondes par défaut
}: UseVideoAutoNextProps) => {
    const navigate = useNavigate();
    const [nextVideo, setNextVideo] = useState<NextVideoInfo>({
        id: null,
        countdown: autoNextDelay,
        isLoading: false
    });

    // Récupérer l'ID de la prochaine vidéo
    const fetchNextVideoId = useCallback(async () => {
        try {
            setNextVideo(prev => ({ ...prev, isLoading: true }));
            
            // Récupérer toutes les vidéos du parcours, triées par ordre
            const videosQuery = query(
                collection(db, 'videos'), // Utilisation directe de la collection
                where('parcoursId', '==', parcoursId),
                orderBy('ordre')
            );

            const videosSnapshot = await getDocs(videosQuery);
            const videos = videosSnapshot.docs;

            // Trouver l'index de la vidéo actuelle
            const currentIndex = videos.findIndex((video: DocumentData) => video.id === videoId);
            
            // S'il y a une vidéo suivante, récupérer son ID
            if (currentIndex !== -1 && currentIndex < videos.length - 1) {
                const nextVideoId = videos[currentIndex + 1].id;
                setNextVideo(prev => ({ 
                    ...prev, 
                    id: nextVideoId,
                    isLoading: false 
                }));
            } else {
                setNextVideo(prev => ({ 
                    ...prev, 
                    id: null,
                    isLoading: false 
                }));
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de la prochaine vidéo:', error);
            setNextVideo(prev => ({ ...prev, isLoading: false }));
        }
    }, [videoId, parcoursId]);

    // Gérer le compte à rebours et la redirection
    useEffect(() => {
        let countdownInterval: NodeJS.Timeout;

        if (isCompleted && nextVideo.id) {
            countdownInterval = setInterval(() => {
                setNextVideo(prev => {
                    const newCountdown = prev.countdown - 1;
                    
                    // Si le compte à rebours est terminé, rediriger
                    if (newCountdown <= 0) {
                        navigate(`/video/${prev.id}`);
                        return prev;
                    }

                    return { ...prev, countdown: newCountdown };
                });
            }, 1000);
        }

        return () => {
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        };
    }, [isCompleted, nextVideo.id, navigate]);

    // Charger la prochaine vidéo quand la vidéo actuelle est complétée
    useEffect(() => {
        if (isCompleted) {
            fetchNextVideoId();
        }
    }, [isCompleted, fetchNextVideoId]);

    return {
        nextVideoId: nextVideo.id,
        countdown: nextVideo.countdown,
        isLoading: nextVideo.isLoading
    };
}; 