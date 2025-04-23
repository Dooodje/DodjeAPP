import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

const choicePoint1Svg = `
<svg width="64" height="13" viewBox="0 0 64 13" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="6.25" cy="6.25" r="6.25" fill="#F3FF90"/>
  <circle cx="31.75" cy="6.25" r="6.25" fill="#D9D9D9"/>
  <circle cx="57.25" cy="6.25" r="6.25" fill="#D9D9D9"/>
</svg>
`;

interface ChoicePoint1Props {
  style?: any;
}

export const ChoicePoint1: React.FC<ChoicePoint1Props> = ({ style }) => {
  return (
    <View style={[{ width: 63.5, height: 12.5, justifyContent: 'center', alignItems: 'center' }, style]}>
      <SvgXml xml={choicePoint1Svg} width="100%" height="100%" />
    </View>
  );
};

export default ChoicePoint1; 