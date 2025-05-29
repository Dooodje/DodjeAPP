import React from 'react';
import { Stack } from 'expo-router';

export default function VideoLayout() {
  return (
    <Stack 
      initialRouteName="[id]"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 350,
        presentation: 'fullScreenModal',
        contentStyle: {
          backgroundColor: '#0A0400'
        },
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