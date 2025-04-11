import React from 'react';
import { Stack } from 'expo-router';

export default function CourseLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        presentation: 'transparentModal',
        contentStyle: {
          backgroundColor: '#0A0400'
        }
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