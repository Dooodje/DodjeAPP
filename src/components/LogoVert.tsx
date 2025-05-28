import React from 'react';
import { View, StyleSheet } from 'react-native';
import LogoVertSvg from '../assets/LogoVert.svg';

interface LogoVertProps {
  style?: any;
}

const LogoVert: React.FC<LogoVertProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <LogoVertSvg width={72} height={113} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 72,
    height: 113,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LogoVert; 