import React from 'react';
import { Stack } from 'expo-router';
import { Platform, StatusBar } from 'react-native';

export default function VideoLayout() {
  // Cacher la barre de statut sur Android
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
    return () => {
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(false);
        StatusBar.setBackgroundColor('#000000');
      }
    };
  }, []);

  return (
    <Stack 
      initialRouteName="[id]"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        presentation: 'fullScreenModal',
        contentStyle: {
          backgroundColor: '#0A0400'
        },
        statusBarHidden: true,
        headerBackVisible: false,
        header: () => null,
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          header: () => null,
          headerBackVisible: false,
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
} 