import React from 'react';
import { Stack } from 'expo-router';

export default function CourseLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 350,
        presentation: 'modal',
        contentStyle: {
          backgroundColor: '#0A0400'
        },
        gestureEnabled: true,
        gestureDirection: 'vertical',
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 