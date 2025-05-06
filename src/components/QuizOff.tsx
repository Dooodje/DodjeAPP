import React from 'react';
import { View } from 'react-native';
import QuizOffSvg from '../assets/QuizOff.svg';

interface QuizOffProps {
  width?: number;
  height?: number;
}

export const QuizOff: React.FC<QuizOffProps> = ({ width = 24, height = 24 }) => {
  return (
    <View style={{ 
      width, 
      height,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <QuizOffSvg width={width} height={height} />
    </View>
  );
};

export default QuizOff; 