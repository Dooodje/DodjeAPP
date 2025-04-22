import React from 'react';
import { View } from 'react-native';
import RightArrowSvg from '../assets/RightArrow.svg';

interface RightArrowProps {
  width?: number;
  height?: number;
}

export const RightArrow: React.FC<RightArrowProps> = ({ width = 24, height = 24 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <RightArrowSvg width={width} height={height} />
    </View>
  );
};

export default RightArrow; 