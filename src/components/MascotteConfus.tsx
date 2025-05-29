import React from 'react';
import { View, StyleSheet } from 'react-native';
import MascotteConfusSvg from '../assets/MascotteConfus.svg';

interface MascotteConfusProps {
  style?: any;
}

const MascotteConfus: React.FC<MascotteConfusProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <MascotteConfusSvg width={660} height={823} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 660,
    height: 823,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MascotteConfus; 