import React from 'react';

interface VideoAutoNextIndicatorProps {
    countdown: number;
    isLoading: boolean;
}

export const VideoAutoNextIndicator: React.FC<VideoAutoNextIndicatorProps> = ({
    countdown,
    isLoading
}) => {
    if (isLoading) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white rounded-lg p-4 flex items-center space-x-3">
            <div className="relative w-6 h-6">
                {/* Cercle de progression */}
                <svg className="w-6 h-6 transform -rotate-90">
                    <circle
                        className="text-gray-600"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="transparent"
                        r="10"
                        cx="12"
                        cy="12"
                    />
                    <circle
                        className="text-white"
                        strokeWidth="2"
                        strokeDasharray={2 * Math.PI * 10}
                        strokeDashoffset={2 * Math.PI * 10 * (1 - countdown / 5)}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="10"
                        cx="12"
                        cy="12"
                    />
                </svg>
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm">
                    {countdown}
                </span>
            </div>
            <span className="text-sm font-medium">
                Prochaine vidéo
            </span>
        </div>
    );
}; 