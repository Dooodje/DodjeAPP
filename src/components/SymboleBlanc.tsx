import React from 'react';
import { View } from 'react-native';
import DodjiSvg from '../assets/Dodji.svg';

interface DodjiProps {
  width?: number;
  height?: number;
}

export const Dodji: React.FC<DodjiProps> = ({ width = 21, height = 32 }) => {
  return (
    <View style={{ 
      width, 
      height,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <DodjiSvg width={width} height={height} />
    </View>
  );
};

export default Dodji; 