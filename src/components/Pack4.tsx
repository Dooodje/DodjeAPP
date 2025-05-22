import React from 'react';
import { View } from 'react-native';
import Pack4Svg from '../assets/Pack4.svg';

interface Pack4Props {
  width?: number;
  height?: number;
}

const Pack4: React.FC<Pack4Props> = ({ width = 140, height = 140 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <Pack4Svg width={100} height={100} />
    </View>
  );
};

export default Pack4; 