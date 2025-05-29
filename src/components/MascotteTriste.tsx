import React from 'react';
import { View, StyleSheet } from 'react-native';
import MascotteTristeSvg from '../assets/MascotteTriste.svg';

interface MascotteTristeProp {
  style?: any;
}

const MascotteTriste: React.FC<MascotteTristeProp> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <MascotteTristeSvg width={623} height={819} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 623,
    height: 819,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MascotteTriste; 