import React from 'react';
import { View } from 'react-native';
import PlanteDodjeLabSvg from '../assets/PlanteDodjeLab.svg';

interface PlanteDodjeLabProps {
  width?: number;
  height?: number;
}

const PlanteDodjeLab: React.FC<PlanteDodjeLabProps> = ({ width = 42, height = 67 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <PlanteDodjeLabSvg width={42} height={67} />
    </View>
  );
};

export default PlanteDodjeLab; 