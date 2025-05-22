import React from 'react';
import { View } from 'react-native';
import Pack5Svg from '../assets/Pack5.svg';

interface Pack5Props {
  width?: number;
  height?: number;
}

const Pack5: React.FC<Pack5Props> = ({ width = 140, height = 140 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <Pack5Svg width={100} height={100} />
    </View>
  );
};

export default Pack5; 