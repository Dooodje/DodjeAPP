import React from 'react';
import { View } from 'react-native';
import Pack1Svg from '../assets/Pack1.svg';

interface Pack1Props {
  width?: number;
  height?: number;
}

const Pack1: React.FC<Pack1Props> = ({ width = 140, height = 140 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <Pack1Svg width={100} height={100} />
    </View>
  );
};

export default Pack1; 