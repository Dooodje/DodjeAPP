import React from 'react';
import { Stack } from 'expo-router';

export default function DodjeLabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Dodje Lab',
        }} 
      />
    </Stack>
  );
} 