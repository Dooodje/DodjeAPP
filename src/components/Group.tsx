import React from 'react';
import { View } from 'react-native';
import GroupSvg from '../assets/Group.svg';

interface GroupProps {
  width?: number;
  height?: number;
}

export const Group: React.FC<GroupProps> = ({ width = 24, height = 24 }) => {
  return (
    <View style={{ 
      width, 
      height, 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <GroupSvg width={width} height={height} />
    </View>
  );
};

export default Group; 