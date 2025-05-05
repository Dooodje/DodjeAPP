import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface SegmentedRingProps {
  width?: number;
  height?: number;
  totalSegments: number;
  completedSegments?: number;
  ringColor?: string;
  completedColor?: string;
  ringWidth?: number;
}

export const SegmentedRing: React.FC<SegmentedRingProps> = ({
  width = 101,
  height = 82,
  totalSegments = 1,
  completedSegments = 0,
  ringColor = "#F3FF90",
  completedColor = "#06D001",
  ringWidth = 6
}) => {
  // Assurer qu'on a au moins 1 segment
  const segments = Math.max(1, totalSegments);
  const validCompletedSegments = Math.min(Math.max(0, completedSegments), segments);
  
  // Calculer les arcs pour chaque segment
  const generateSegmentPaths = () => {
    if (segments === 1) {
      // Si un seul segment, retourner un cercle oval complet
      return [
        <Path 
          key="full-oval"
          d="M50.5 78C76.1812 78 97 61.4345 97 41C97 20.5655 76.1812 4 50.5 4C24.8188 4 4 20.5655 4 41C4 61.4345 24.8188 78 50.5 78Z" 
          stroke={validCompletedSegments === 1 ? completedColor : ringColor} 
          strokeWidth={ringWidth} 
          strokeMiterlimit="10"
          fill="none"
        />
      ];
    }
    
    const paths = [];
    const center = { x: 50.5, y: 41 }; // Centre de l'ovale
    const radiusX = 46.5; // Rayon horizontal
    const radiusY = 37; // Rayon vertical
    const gapAngle = 15; // Angle du "trou" en degrés
    const segmentAngle = (360 - (segments * gapAngle)) / segments;
    
    for (let i = 0; i < segments; i++) {
      const startAngle = i * (segmentAngle + gapAngle);
      const endAngle = startAngle + segmentAngle;
      
      // Convertir les angles en radians
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);
      
      // Calculer les points de départ et de fin en tenant compte de l'ellipse
      const startX = center.x + radiusX * Math.cos(startRad);
      const startY = center.y + radiusY * Math.sin(startRad);
      const endX = center.x + radiusX * Math.cos(endRad);
      const endY = center.y + radiusY * Math.sin(endRad);
      
      // Créer le path d'arc elliptique
      const largeArcFlag = segmentAngle > 180 ? 1 : 0;
      const pathData = `M ${startX} ${startY} A ${radiusX} ${radiusY} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
      
      // Déterminer la couleur du segment en fonction de son état de complétion
      const segmentColor = i < validCompletedSegments ? completedColor : ringColor;
      
      paths.push(
        <Path 
          key={`segment-${i}`}
          d={pathData}
          stroke={segmentColor}
          strokeWidth={ringWidth}
          strokeLinecap="round"
          fill="none"
        />
      );
    }
    
    return paths;
  };
  
  return (
    <View style={{ 
      width, 
      height,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Svg width={width} height={height} viewBox="0 0 101 82" fill="none">
        {generateSegmentPaths()}
      </Svg>
    </View>
  );
};

export default SegmentedRing; 