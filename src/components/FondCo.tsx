import React from 'react';
import { View } from 'react-native';
import FondCoSvg from '../assets/FondCo.svg';

interface FondCoProps {
  width?: number;
  height?: number;
}

const FondCo: React.FC<FondCoProps> = ({ width = 24, height = 24 }) => {
  return (
    <View style={{ 
      width, 
      height,
      position: 'absolute',
      top: 0,
      left: 0,
      opacity: 0.15,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      <FondCoSvg 
        width={width * 1.8}
        height={height * 1.8} 
        style={{
          transform: [
            { scale: 1.8 },
            { rotate: '-90deg' },
            { translateY: 10 }
          ],
          position: 'absolute',
        }}
      />
    </View>
  );
};

export default FondCo; 