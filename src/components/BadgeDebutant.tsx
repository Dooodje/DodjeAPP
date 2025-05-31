import React from 'react';
import { View } from 'react-native';
import BadgeDebutantSvg from '../assets/BadgeDebutant.svg';

interface BadgeDebutantProps {
  width?: number;
  height?: number;
}

const BadgeDebutant: React.FC<BadgeDebutantProps> = ({ width = 60, height = 86 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <BadgeDebutantSvg width={width} height={height} />
    </View>
  );
};

export default BadgeDebutant; 