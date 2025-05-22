import React from 'react';
import { View } from 'react-native';
import PastilleAnalyseprofilSvg from '../assets/PastilleAnalyseprofil.svg';

interface PastilleAnalyseprofilProps {
  width?: number;
  height?: number;
}

const PastilleAnalyseprofil: React.FC<PastilleAnalyseprofilProps> = ({ width = 229, height = 229 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center', opacity: 0.3 }}>
      <PastilleAnalyseprofilSvg width={229} height={229} />
    </View>
  );
};

export default PastilleAnalyseprofil; 