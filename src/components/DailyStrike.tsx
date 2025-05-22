import React from 'react';
import { View } from 'react-native';
import DailyStrikeSvg from '../assets/DailyStrike.svg';

interface DailyStrikeProps {
  width?: number;
  height?: number;
}

export const DailyStrike: React.FC<DailyStrikeProps> = ({ 
  width = 118.22,  // Figma width
  height = 205.91  // Figma height
}) => {
  return (
    <View style={{
      width,
      height,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <DailyStrikeSvg width={width} height={height} />
    </View>
  );
};

export default DailyStrike; 