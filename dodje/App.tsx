import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import app from '../src/config/firebase';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // Vérifier que Firebase est bien initialisé
    if (!app) {
      console.error('Firebase n\'est pas initialisé correctement');
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
