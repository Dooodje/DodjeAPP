import React from 'react';
import { View } from 'react-native';
import Pack2Svg from '../assets/Pack2.svg';

interface Pack2Props {
  width?: number;
  height?: number;
}

const Pack2: React.FC<Pack2Props> = ({ width = 140, height = 140 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <Pack2Svg width={100} height={100} />
    </View>
  );
};

export default Pack2; 