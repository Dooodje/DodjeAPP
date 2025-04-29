import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

interface ProgressRingProps {
  size: number;
  totalSegments: number;
  completedSegments: number;
  completedColor: string;
  incompleteColor: string;
  strokeWidth?: number;
  segmentSpacing?: number;
  isActive?: boolean;
}

/**
 * Composant d'anneau segmenté qui affiche la progression
 * des vidéos d'un parcours sous forme d'arcs de cercle.
 */
export const ProgressRing: React.FC<ProgressRingProps> = ({
  size,
  totalSegments,
  completedSegments,
  completedColor,
  incompleteColor,
  strokeWidth = size * 0.05, // 5% de la taille par défaut
  segmentSpacing = 2,        // 2 degrés d'espacement entre les segments
  isActive = false,
}) => {
  // S'assurer que les valeurs sont valides
  const validCompletedSegments = Math.min(
    Math.max(0, completedSegments),
    Math.max(1, totalSegments)
  );
  const validTotalSegments = Math.max(1, totalSegments);
  
  // Rayon du cercle
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Ajuster l'espacement en fonction du nombre de segments
  const adjustedSpacing = Math.min(
    segmentSpacing,
    Math.max(0.5, 5 - validTotalSegments) // Réduire l'espacement pour plus de segments
  );
  
  // Calcul de l'angle total disponible pour les segments (360 - espacement total)
  const totalSpacing = validTotalSegments * adjustedSpacing;
  const availableAngle = 360 - totalSpacing;
  
  // Angle par segment
  const segmentAngle = availableAngle / validTotalSegments;
  
  // Générer les segments
  const segments = [];
  for (let i = 0; i < validTotalSegments; i++) {
    // L'angle de début de ce segment
    const startAngle = (i * (segmentAngle + adjustedSpacing)) - 90; // -90 pour commencer en haut
    
    // Convertir en radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + segmentAngle) * Math.PI) / 180;
    
    // Coordonnées de début et de fin du segment
    const startX = center + radius * Math.cos(startRad);
    const startY = center + radius * Math.sin(startRad);
    const endX = center + radius * Math.cos(endRad);
    const endY = center + radius * Math.sin(endRad);
    
    // Déterminer si c'est un arc large (> 180 degrés)
    const largeArcFlag = segmentAngle > 180 ? 1 : 0;
    
    // Chemin SVG pour l'arc
    const path = `
      M ${startX} ${startY}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
    `;
    
    // Couleur du segment basée sur son état
    const color = i < validCompletedSegments ? completedColor : incompleteColor;
    
    // Ajouter le segment au tableau
    segments.push(
      <Path
        key={i}
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  
  // Ajouter un cercle de mise en évidence pour l'état actif
  const activeHighlight = isActive ? (
    <Circle
      cx={center}
      cy={center}
      r={radius + (strokeWidth / 2) + 2}
      stroke="#FFFFFF"
      strokeWidth={1}
      fill="none"
      opacity={0.7}
    />
  ) : null;
  
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {activeHighlight}
        <G>
          {segments}
        </G>
      </Svg>
    </View>
  );
};

export default ProgressRing; 