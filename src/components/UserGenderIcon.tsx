import React from 'react';
import { View } from 'react-native';
import GlandHomme from './GlandHomme';
import GlandFemme from './GlandFemme';

interface UserGenderIconProps {
  sexe?: 'homme' | 'femme';
  width?: number;
  height?: number;
}

const UserGenderIcon: React.FC<UserGenderIconProps> = ({ 
  sexe, 
  width = 86, 
  height = 126 
}) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      {sexe === 'femme' ? (
        <GlandFemme width={width} height={height} />
      ) : (
        <GlandHomme width={width} height={height} />
      )}
    </View>
  );
};

export default UserGenderIcon; 