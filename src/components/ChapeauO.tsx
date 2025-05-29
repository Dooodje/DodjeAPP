import React from 'react';
import { View, StyleSheet } from 'react-native';
import ChapeauOSvg from '../assets/ChapeauO.svg';

interface ChapeauOProps {
  style?: any;
}

const ChapeauO: React.FC<ChapeauOProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <ChapeauOSvg width={57} height={41} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 57,
    height: 41,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChapeauO; 