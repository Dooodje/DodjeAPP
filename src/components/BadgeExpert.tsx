import React from 'react';
import { View } from 'react-native';
import BadgeExpertSvg from '../assets/BadgeExpert.svg';

interface BadgeExpertProps {
  width?: number;
  height?: number;
}

const BadgeExpert: React.FC<BadgeExpertProps> = ({ width = 89, height = 92 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <BadgeExpertSvg width={width} height={height} />
    </View>
  );
};

export default BadgeExpert; 