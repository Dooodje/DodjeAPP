import React from 'react';
import { ViewStyle } from 'react-native';
import DefaultSvg from '../assets/PastilleParcoursDefault.svg';
import { PastilleParcours } from './PastilleParcours';

interface PastilleParcoursDefaultProps {
  style?: ViewStyle;
}

export const PastilleParcoursDefault: React.FC<PastilleParcoursDefaultProps> = ({ style }) => {
  return <PastilleParcours SvgComponent={DefaultSvg} style={style} />;
}; 