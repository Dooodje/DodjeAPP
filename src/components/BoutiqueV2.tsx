import React from 'react';
import { View, StyleSheet } from 'react-native';
import BoutiqueV2Svg from '../assets/BoutiqueV2.svg';

interface BoutiqueV2Props {
  style?: any;
}

const BoutiqueV2: React.FC<BoutiqueV2Props> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <BoutiqueV2Svg width={26} height={30} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BoutiqueV2; 