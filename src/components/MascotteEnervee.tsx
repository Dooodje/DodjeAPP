import React from 'react';
import { View, StyleSheet } from 'react-native';
import MascotteEnerveeSvg from '../assets/MascotteEnervee.svg';

interface MascotteEnerveeProps {
  style?: any;
}

const MascotteEnervee: React.FC<MascotteEnerveeProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <MascotteEnerveeSvg width={667} height={812} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 667,
    height: 812,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MascotteEnervee; 