import React from 'react';
import { View } from 'react-native';
import QuizOnSvg from '../assets/QuizOn.svg';

interface QuizOnProps {
  width?: number;
  height?: number;
}

const QuizOn: React.FC<QuizOnProps> = ({ width = 24, height = 24 }) => {
  return (
    <View style={{ 
      width, 
      height,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <QuizOnSvg width={width} height={height} />
    </View>
  );
};

export default QuizOn; 