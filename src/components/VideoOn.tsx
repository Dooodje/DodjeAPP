import React from 'react';
import { View } from 'react-native';
import VideoOnSvg from '../assets/VideoOn.svg';

interface VideoOnProps {
  width?: number;
  height?: number;
}

export const VideoOn: React.FC<VideoOnProps> = ({ width = 24, height = 24 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <VideoOnSvg width={width} height={height} />
    </View>
  );
};

export default VideoOn; 