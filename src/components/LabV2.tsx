import React from 'react';
import { View, StyleSheet } from 'react-native';
import LabV2Svg from '../assets/LabV2.svg';

interface LabV2Props {
  style?: any;
}

const LabV2: React.FC<LabV2Props> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <LabV2Svg width={25} height={28} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 25,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LabV2; 