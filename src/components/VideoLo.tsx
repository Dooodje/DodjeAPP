import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

const xml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="12" fill="#7C6354"/>
  <path d="M17.5 12L9.5 16.3301L9.5 7.66987L17.5 12Z" fill="white"/>
  <circle cx="12" cy="12" r="11" stroke="white" stroke-width="2"/>
</svg>
`;

const VideoLo: React.FC = () => {
  return (
    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
      <SvgXml xml={xml} width="24" height="24" />
    </View>
  );
};

export default VideoLo; 