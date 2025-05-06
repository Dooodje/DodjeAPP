import React from 'react';
import { View } from 'react-native';
import LockMarronSvg from '../assets/LockMarron.svg';

interface LockMarronProps {
  width?: number;
  height?: number;
}

export const LockMarron: React.FC<LockMarronProps> = ({ width = 24, height = 24 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <LockMarronSvg width={width} height={height} />
    </View>
  );
};

export default LockMarron; 