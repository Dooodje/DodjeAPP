import React from 'react';
import { View } from 'react-native';
import VectorSvg from '../assets/Vector.svg';

interface VectorProps {
  width?: number;
  height?: number;
  color?: string;
}

export const Vector: React.FC<VectorProps> = ({ 
  width = 24,  // Default size based on Figma
  height = 24, // Default size based on Figma
  color = '#F3FF90' // Default color from Figma
}) => {
  return (
    <View style={{ 
      width, 
      height, 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <VectorSvg 
        width={width} 
        height={height}
        fill={color}
      />
    </View>
  );
};

export default Vector; 