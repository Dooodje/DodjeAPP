import React from 'react';
import { useVideoStatus } from '../hooks/useVideoStatus';
import { useVideoAutoNext } from '../hooks/useVideoAutoNext';
import { VideoAutoNextIndicator } from './VideoAutoNextIndicator';
import { VideoPlayerProps } from '../types/video';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, userId }) => {
    // Hook pour gérer le statut de la vidéo
    const { 
        videoStatus, 
        updateProgress,
        loading: statusLoading 
    } = useVideoStatus(videoId, userId);

    // Hook pour gérer la redirection automatique
    const {
        nextVideoId,
        countdown,
        isLoading: nextVideoLoading
    } = useVideoAutoNext({
        videoId,
        parcoursId: videoStatus?.parcoursId || '',
        isCompleted: videoStatus?.status === 'completed',
        autoNextDelay: 5
    });

    // ... Votre logique de lecteur vidéo existante ...

    return (
        <div className="relative">
            {/* Votre lecteur vidéo existant */}
            
            {/* Indicateur de redirection automatique */}
            {videoStatus?.status === 'completed' && nextVideoId && (
                <VideoAutoNextIndicator
                    countdown={countdown}
                    isLoading={nextVideoLoading}
                />
            )}
        </div>
    );
}; 