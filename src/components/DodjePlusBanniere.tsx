import React from 'react';
import { View } from 'react-native';
import DodjePlusBanniereSvg from '../assets/DodjePlusBanniere.svg';

interface DodjePlusBanniereProps {
  width?: number;
  height?: number;
}

const DodjePlusBanniere: React.FC<DodjePlusBanniereProps> = ({ width = 152, height = 55 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      <DodjePlusBanniereSvg width={width} height={height} />
    </View>
  );
};

export default DodjePlusBanniere; 