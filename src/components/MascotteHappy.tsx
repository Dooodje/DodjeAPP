import React from 'react';
import { View, StyleSheet } from 'react-native';
import MascotteHappySvg from '../assets/MascotteHappy.svg';

interface MascotteHappyProps {
  style?: any;
}

const MascotteHappy: React.FC<MascotteHappyProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <MascotteHappySvg width={804} height={819} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 804,
    height: 819,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MascotteHappy; 