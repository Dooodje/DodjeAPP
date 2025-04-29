import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';

interface PastilleParcoursProps {
  SvgComponent: React.FC<SvgProps>;
  style?: ViewStyle;
}

export const PastilleParcours: React.FC<PastilleParcoursProps> = ({ SvgComponent, style }) => {
  return (
    <View style={[{ width: 70, height: 70, justifyContent: 'center', alignItems: 'center' }, style]}>
      <SvgComponent width={70} height={70} />
    </View>
  );
}; 