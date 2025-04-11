import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalHeader } from '../../src/components/ui/GlobalHeader';
import { DodjeOneScreen } from '../../src/screens/dodjeone';

export default function DodjeOnePage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <GlobalHeader
        title="DODJE ONE"
        showBackButton
        onBackPress={handleBack}
      />
      <DodjeOneScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
}); 