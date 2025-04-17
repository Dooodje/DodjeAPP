import React from 'react';
import { Stack } from 'expo-router';

export default function DodjeOneLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Dodje One',
          headerShown: false,
        }} 
      />
    </Stack>
  );
} 