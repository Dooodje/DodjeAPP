import React from 'react';
import { View } from 'react-native';
import LogoDodjeSvg from '../assets/LogoDodje.svg';

interface LogoDodjeProps {
  width?: number;
  height?: number;
}

export const LogoDodje: React.FC<LogoDodjeProps> = ({ width = 200, height = 200 }) => {
  return (
    <View style={{ 
      width, 
      height, 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <LogoDodjeSvg width={width} height={height} />
    </View>
  );
};

export default LogoDodje; 