import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoStatus } from '../hooks/useVideoStatus';
import { useVideoAutoNext } from '../hooks/useVideoAutoNext';
import { VideoAutoNextIndicator } from './VideoAutoNextIndicator';
import { NextVideo } from './NextVideo';
import { VideoPlayerProps, Video } from '../types/video';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, userId }) => {
    const navigate = useNavigate();
    
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
        isLoading: nextVideoLoading,
        isLastVideo,
        quizId
    } = useVideoAutoNext({
        videoId,
        parcoursId: videoStatus?.parcoursId || '',
        isCompleted: videoStatus?.completionStatus === 'completed',
        autoNextDelay: 5
    });

    // Créer un objet Video complet pour NextVideo
    const nextVideoObject: Video | null = nextVideoId ? {
        id: nextVideoId,
        title: '',
        description: '',
        videoUrl: '',
        duration: 0,
        thumbnail: '',
        courseId: videoStatus?.parcoursId || '',
        order: 0,
        isUnlocked: true
    } : null;

    // ... Votre logique de lecteur vidéo existante ...

    return (
        <div className="relative">
            {/* Votre lecteur vidéo existant */}
            
            {/* Composant NextVideo avec les nouvelles props */}
            <NextVideo
                video={nextVideoObject}
                onNavigate={(id) => navigate(`/video/${id}`)}
                courseId={videoStatus?.parcoursId}
                isLastVideo={isLastVideo}
                quizId={quizId || undefined}
            />
            
            {/* Indicateur de redirection automatique */}
            {videoStatus?.completionStatus === 'completed' && (nextVideoId || (isLastVideo && quizId)) && (
                <VideoAutoNextIndicator
                    countdown={countdown}
                    isLoading={nextVideoLoading}
                />
            )}
        </div>
    );
}; 