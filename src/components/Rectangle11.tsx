import React from 'react';
import { View } from 'react-native';
import Rectangle11Svg from '../assets/Rectangle11.svg';

interface Rectangle11Props {
  width?: number;
  height?: number;
}

export const Rectangle11: React.FC<Rectangle11Props> = ({ width = 390, height = 844 }) => {
  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Rectangle11Svg width={width} height={height} />
    </View>
  );
};

export default Rectangle11; 