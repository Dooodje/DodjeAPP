import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface LeftArrowProps {
  width?: number;
  height?: number;
}

const LeftArrow: React.FC<LeftArrowProps> = ({ width = 50, height = 50 }) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 50 50">
        <Path
          d="M33.3337 8.33331L16.667 25L33.3337 41.6666"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default LeftArrow; 