import React from 'react';
import { ViewStyle } from 'react-native';
import Variant3Svg from '../assets/PastilleParcoursVariant3.svg';
import { PastilleParcours } from './PastilleParcours';

interface PastilleParcoursVariant3Props {
  style?: ViewStyle;
}

export const PastilleParcoursVariant3: React.FC<PastilleParcoursVariant3Props> = ({ style }) => {
  return <PastilleParcours SvgComponent={Variant3Svg} style={style} />;
}; 