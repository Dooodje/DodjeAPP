import React from 'react';
import { View } from 'react-native';
import Color1Svg from '../assets/Color1.svg';

interface Color1Props {
  width?: number;
  height?: number;
}

export const Color1: React.FC<Color1Props> = ({ width = 24, height = 24 }) => {
  return (
    <View style={{ 
      width, 
      height,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Color1Svg width={width} height={height} />
    </View>
  );
};

export default Color1; 