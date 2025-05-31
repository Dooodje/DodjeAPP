import React from 'react';
import { View } from 'react-native';
import BadgeBourseSvg from '../assets/BadgeBourse.svg';

interface BadgeBourseProps {
  width?: number;
  height?: number;
}

const BadgeBourse: React.FC<BadgeBourseProps> = ({ width = 66, height = 81 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <BadgeBourseSvg width={width} height={height} />
    </View>
  );
};

export default BadgeBourse; 