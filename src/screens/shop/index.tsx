import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useShop } from '../../hooks/useShop';
import { useAuth } from '../../hooks/useAuth';
import { TokenPack as TokenPackComponent } from '../../components/shop/TokenPack';
import { DodjeOneCard } from '../../components/shop/DodjeOneCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import MediaError from '../../components/ui/MediaError';
import { TokenPack } from '../../types/shop';
import DodjeOneBanner from '../../components/shop/DodjeOneBanner';

export default function ShopScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Si l'utilisateur n'est pas connecté, on utilise 'guest' pour permettre l'affichage des produits
  const userId = user?.uid || 'guest';
  
  const {
    tokenPacks,
    subscription,
    isLoading,
    error,
    selectedPack,
    selectedSubscription,
    isPurchasing,
    selectTokenPack,
    selectDodjeOneSubscription,
    purchaseTokenPack,
    purchaseSubscription,
    reset
  } = useShop(userId);

  // Filtrer et trier les packs actifs par prix croissant
  const activePacks = useMemo(() => {
    return tokenPacks
      .filter(pack => pack.status !== 'inactive')
      .sort((a, b) => a.price - b.price);
  }, [tokenPacks]);

  // Grouper les packs par rangées de 3
  const packRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < activePacks.length; i += 3) {
      rows.push(activePacks.slice(i, i + 3));
    }
    return rows;
  }, [activePacks]);

  // Afficher le chargement si l'authentification ou les données sont en cours de chargement
  if (authLoading || isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  const handlePackSelection = (pack: TokenPack) => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    purchaseTokenPack(pack);
  };

  if (error) {
    return (
      <View style={styles.container}>
        <MediaError
          message={error}
          onRetry={() => reset()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        bounces={true}
        overScrollMode="auto">
        <DodjeOneBanner onPress={() => router.push('/dodjeone')} />
        <Text style={styles.title}>Nos packs Dodji :</Text>
        
        {/* Section Packs de Dodji */}
        <View style={styles.section}>
          {packRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((pack) => (
                <View key={pack.id} style={styles.packContainer}>
                  <TokenPackComponent
                    pack={pack}
                    onSelect={handlePackSelection}
                    isSelected={false}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Section DodjeOne */}
        {subscription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DodjeOne Premium</Text>
            <DodjeOneCard
              subscription={subscription}
              onSelect={selectDodjeOneSubscription}
              isSelected={selectedSubscription?.id === subscription.id}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 160,
    paddingHorizontal: 16,
    paddingBottom: 70,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Arboria-Bold',
    color: '#fff',
    marginBottom: 0,
    marginTop: 30,
    paddingHorizontal: 16,
  },
  section: {
    paddingTop: 0,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  packContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  purchaseButton: {
    backgroundColor: '#06D001',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 