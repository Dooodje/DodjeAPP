import React from 'react';
import { View, StyleSheet } from 'react-native';
import MascotteSalutSvg from '../assets/MascotteSalut.svg';

interface MascotteSalutProps {
  style?: any;
}

const MascotteSalut: React.FC<MascotteSalutProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <MascotteSalutSvg width={682} height={819} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 682,
    height: 819,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MascotteSalut; 