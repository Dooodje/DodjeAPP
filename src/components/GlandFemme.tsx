import React from 'react';
import { View } from 'react-native';
import GlandFemmeSvg from '../assets/GlandFemme.svg';

interface GlandFemmeProps {
  width?: number;
  height?: number;
}

const GlandFemme: React.FC<GlandFemmeProps> = ({ width = 88, height = 126 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <GlandFemmeSvg width={width} height={height} />
    </View>
  );
};

export default GlandFemme; 