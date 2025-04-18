import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface PastilleVectorProps {
  type: 'parcours' | 'annexe';
  size: number;
  isActive: boolean;
  backgroundColor: string;
  borderColor: string;
  iconColor: string;
}

export const PastilleVector: React.FC<PastilleVectorProps> = ({
  type,
  size,
  isActive,
  backgroundColor,
  borderColor,
  iconColor
}) => {
  // Tailles relatives
  const outerCircleRadius = size / 2;
  const innerCircleRadius = size * 0.4;
  const iconScale = size * 0.01;
  const strokeWidth = size * 0.05;

  // Centre du cercle
  const centerX = size / 2;
  const centerY = size / 2;

  const renderPastilleContent = () => {
    if (type === 'annexe') {
      // Contenu pour les annexes (par exemple une étoile ou un symbole spécial)
      return (
        <Path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill={iconColor}
          scale={iconScale}
          x={centerX - 12 * iconScale}
          y={centerY - 12 * iconScale}
        />
      );
    } else {
      // Contenu pour les parcours standards (par défaut un point ou icône simple)
      return (
        <Circle
          cx={centerX}
          cy={centerY}
          r={innerCircleRadius}
          fill={iconColor}
        />
      );
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Cercle extérieur */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={outerCircleRadius - strokeWidth / 2}
          stroke={borderColor}
          strokeWidth={strokeWidth}
          fill={backgroundColor}
        />
        
        {/* Contenu de la pastille */}
        {renderPastilleContent()}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 