import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AnnexeHeader } from '../../src/components/ui/AnnexeHeader';
import ShopScreen from '../../src/screens/shop';
import { PageTransition } from '../../src/components/ui/PageTransition';
import { useAuth } from '../../src/hooks/useAuth';

export default function BoutiqueScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <PageTransition>
      <View style={styles.container}>
        <AnnexeHeader
          title="Boutique"
          showBackButton={false}
          points={user?.dodji || 0}
          level={user?.level || 1}
        />
        <ShopScreen />
      </View>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
}); 