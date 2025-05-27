import React from 'react';
import { View, StyleSheet } from 'react-native';
import CataV2Svg from '../assets/CataV2.svg';

interface CataV2Props {
  style?: any;
}

const CataV2: React.FC<CataV2Props> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <CataV2Svg width={25} height={31} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 25,
    height: 31,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CataV2; 