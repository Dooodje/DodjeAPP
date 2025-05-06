import React from 'react';
import { View } from 'react-native';
import VideoOffSvg from '../assets/VideoOff.svg';

interface VideoOffProps {
  width?: number;
  height?: number;
  color?: string;
}

export const VideoOff: React.FC<VideoOffProps> = ({ width = 24, height = 24, color }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <VideoOffSvg width={width} height={height} color={color} />
    </View>
  );
};

export default VideoOff; 