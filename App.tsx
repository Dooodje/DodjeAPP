import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator 
          initialRouteName="Home" 
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0A0400' }
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          {/* D'autres écrans seront ajoutés ici */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
} 