import React from 'react';
import { View, StyleSheet } from 'react-native';
import MascotteSurprisSvg from '../assets/MascotteSurpris.svg';

interface MascotteSurprisProps {
  style?: any;
}

const MascotteSurpris: React.FC<MascotteSurprisProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <MascotteSurprisSvg width={623} height={819} />
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

export default MascotteSurpris; 