import React from 'react';
import { View, StyleSheet } from 'react-native';
import HomeV2Svg from '../assets/HomeV2.svg';

interface HomeV2Props {
  style?: any;
}

const HomeV2: React.FC<HomeV2Props> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <HomeV2Svg width={30} height={28} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 30,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeV2; 