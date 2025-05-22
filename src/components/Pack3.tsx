import React from 'react';
import { View } from 'react-native';
import Pack3Svg from '../assets/Pack3.svg';

interface Pack3Props {
  width?: number;
  height?: number;
}

const Pack3: React.FC<Pack3Props> = ({ width = 140, height = 140 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <Pack3Svg width={100} height={100} />
    </View>
  );
};

export default Pack3; 