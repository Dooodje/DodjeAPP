import React from 'react';
import { View, StyleSheet } from 'react-native';
import ProfilV2Svg from '../assets/ProfilV2.svg';

interface ProfilV2Props {
  style?: any;
}

const ProfilV2: React.FC<ProfilV2Props> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <ProfilV2Svg width={22} height={30} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 22,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfilV2; 