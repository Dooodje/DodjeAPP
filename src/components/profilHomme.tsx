import React from 'react';
import { View } from 'react-native';
import ProfilHommeSvg from '../assets/profilHomme.svg';

interface ProfilHommeProps {
  width?: number;
  height?: number;
}

const ProfilHomme: React.FC<ProfilHommeProps> = ({ width = 86, height = 126 }) => {
  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <ProfilHommeSvg width={86} height={126} />
    </View>
  );
};

export default ProfilHomme; 