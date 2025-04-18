import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface AnneauProps {
  type: 'anneau1' | 'anneau2' | 'anneau3' | 'anneau5';
  size: number;
  color?: string;
  secondaryColor?: string;
}

export const AnneauVector: React.FC<AnneauProps> = ({ 
  type,
  size = 100,
  color = '#F3FF90',
  secondaryColor = '#06D001'
}) => {
  // Dimension de base pour les calculs proportionnels
  const baseSize = 100;
  const strokeWidth = (8 / baseSize) * size;
  
  // Anneaux basés sur les vecteurs de Figma
  switch (type) {
    case 'anneau1':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Circle
              cx="50"
              cy="50"
              r="46"
              stroke={secondaryColor}
              strokeWidth={strokeWidth}
              fill="none"
            />
          </Svg>
        </View>
      );
    
    case 'anneau2':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Circle
              cx="50"
              cy="50"
              r="38"
              stroke={secondaryColor}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx="50"
              cy="50"
              r="46"
              stroke={secondaryColor}
              strokeWidth={strokeWidth}
              fill="none"
            />
          </Svg>
        </View>
      );
      
    case 'anneau3':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Circle
              cx="50"
              cy="50"
              r="30"
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx="50"
              cy="50"
              r="38"
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx="50"
              cy="50"
              r="46"
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
          </Svg>
        </View>
      );
      
    case 'anneau5':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Circle
              cx="50"
              cy="50"
              r="22"
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx="50"
              cy="50"
              r="30"
              stroke={secondaryColor}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx="50"
              cy="50"
              r="38"
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx="50"
              cy="50"
              r="46"
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx="50"
              cy="50"
              r="14"
              stroke={secondaryColor}
              strokeWidth={strokeWidth}
              fill="none"
            />
          </Svg>
        </View>
      );
      
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  }
}); 