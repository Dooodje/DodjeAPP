import React from 'react';
import { View } from 'react-native';
import BadgeAvanceSvg from '../assets/BadgeAvance.svg';

interface BadgeAvanceProps {
  width?: number;
  height?: number;
}

const BadgeAvance: React.FC<BadgeAvanceProps> = ({ width = 95, height = 91 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <BadgeAvanceSvg width={width} height={height} />
    </View>
  );
};

export default BadgeAvance; 