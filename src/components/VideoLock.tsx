import React from 'react';
import { View } from 'react-native';
import VideoLockSvg from '../assets/VideoLock.svg';

interface VideoLockProps {
  width?: number;
  height?: number;
}

export const VideoLock: React.FC<VideoLockProps> = ({ width = 88, height = 91.5 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <VideoLockSvg width={width} height={height} />
    </View>
  );
};

export default VideoLock; 