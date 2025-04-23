import React from 'react';
import { View, StyleSheet } from 'react-native';
import PastilleAnnexeSvg from '../assets/PastilleAnnexe.svg';

interface PastilleAnnexeProps {
  width?: number;
  height?: number;
}

const PastilleAnnexe: React.FC<PastilleAnnexeProps> = ({ 
  width = 64, 
  height = 64 
}) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <PastilleAnnexeSvg width={width} height={height} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PastilleAnnexe; 