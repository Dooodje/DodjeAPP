import React from 'react';
import { ViewStyle } from 'react-native';
import Variant2Svg from '../assets/PastilleParcoursVariant2.svg';
import { PastilleParcours } from './PastilleParcours';

interface PastilleParcoursVariant2Props {
  style?: ViewStyle;
}

export const PastilleParcoursVariant2: React.FC<PastilleParcoursVariant2Props> = ({ style }) => {
  return <PastilleParcours SvgComponent={Variant2Svg} style={style} />;
}; 