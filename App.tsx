import 'expo-router/entry';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from './src/providers/QueryProvider';

export default function App() {
  return (
    <Provider store={store}>
      <QueryProvider>
        <SafeAreaProvider>
          <View style={{ flex: 1 }} />
        </SafeAreaProvider>
      </QueryProvider>
    </Provider>
  );
} 