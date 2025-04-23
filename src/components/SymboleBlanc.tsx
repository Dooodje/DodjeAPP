import React from 'react';
import { View } from 'react-native';
import SymboleBlanc from '../assets/SymboleBlanc.svg';

interface SymbleBlancProps {
  width?: number;
  height?: number;
}

const SymbolBlancComponent: React.FC<SymbleBlancProps> = ({ width = 100, height = 100 }) => {
  return (
    <View style={{ 
      width, 
      height, 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <SymboleBlanc width={width} height={height} />
    </View>
  );
};

export default SymbolBlancComponent; 