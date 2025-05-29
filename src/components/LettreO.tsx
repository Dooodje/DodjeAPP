import React from 'react';
import { View, StyleSheet } from 'react-native';
import LettreOSvg from '../assets/LettreO.svg';

interface LettreOProps {
  style?: any;
}

const LettreO: React.FC<LettreOProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <LettreOSvg width={72} height={77} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 72,
    height: 77,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LettreO; 