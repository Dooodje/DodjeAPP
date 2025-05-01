import React from 'react';
import { View } from 'react-native';
import Color0Svg from '../assets/Color0.svg';

interface Color0Props {
  width?: number;
  height?: number;
}

export const Color0: React.FC<Color0Props> = ({ width = 24, height = 24 }) => {
  return (
    <View style={{ 
      width, 
      height,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Color0Svg width={width} height={height} />
    </View>
  );
};

export default Color0; 