import React from 'react';
import { View } from 'react-native';
import BadgeCryptoSvg from '../assets/BadgeCrypto.svg';

interface BadgeCryptoProps {
  width?: number;
  height?: number;
}

const BadgeCrypto: React.FC<BadgeCryptoProps> = ({ width = 66, height = 81 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <BadgeCryptoSvg width={width} height={height} />
    </View>
  );
};

export default BadgeCrypto; 