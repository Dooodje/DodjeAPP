import React from 'react';
import { View } from 'react-native';
import TropheeSvg from '../assets/Trophee.svg';

interface TropheeProps {
  width?: number;
  height?: number;
}

const Trophee: React.FC<TropheeProps> = ({ width = 84, height = 94 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <TropheeSvg width={width} height={height} />
    </View>
  );
};

export default Trophee; 