import React from 'react';
import { View } from 'react-native';
import GlandHommeSvg from '../assets/GlandHomme.svg';

interface GlandHommeProps {
  width?: number;
  height?: number;
}

const GlandHomme: React.FC<GlandHommeProps> = ({ width = 86, height = 126 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <GlandHommeSvg width={width} height={height} />
    </View>
  );
};

export default GlandHomme; 