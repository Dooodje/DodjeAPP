import React from 'react';
import { View } from 'react-native';
import LogoSvg from '../assets/logododjeblanc.svg';

interface LogoDodjeBlancProps {
  width?: number;
  height?: number;
}

export const LogoDodjeBlanc: React.FC<LogoDodjeBlancProps> = ({ width = 21, height = 32 }) => {
  return (
    <View style={{ 
      width, 
      height, 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <LogoSvg 
        width={width} 
        height={height}
        fill="#FFFFFF"
      />
    </View>
  );
};

export default LogoDodjeBlanc; 