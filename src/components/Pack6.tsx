import React from 'react';
import { View } from 'react-native';
import Pack6Svg from '../assets/Pack6.svg';

interface Pack6Props {
  width?: number;
  height?: number;
}

const Pack6: React.FC<Pack6Props> = ({ width = 140, height = 140 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <Pack6Svg width={100} height={100} />
    </View>
  );
};

export default Pack6; 