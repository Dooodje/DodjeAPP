import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useShop } from '../../hooks/useShop';
import { useAuth } from '../../hooks/useAuth';
import { ShopHeader } from '../../components/shop/ShopHeader';
import { DodjiBalance } from '../../components/shop/DodjiBalance';
import { TokenPack } from '../../components/shop/TokenPack';
import { DodjeOneCard } from '../../components/shop/DodjeOneCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import MediaError from '../../components/ui/MediaError';

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

  // Afficher le chargement si l'authentification ou les données sont en cours de chargement
  if (authLoading || isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  // Vérifier si l'utilisateur est authentifié avant d'autoriser les achats
  const handlePurchase = () => {
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion
      router.push('/(auth)/login');
      return;
    }

    if (selectedPack) {
      purchaseTokenPack(selectedPack);
    } else if (selectedSubscription) {
      purchaseSubscription(selectedSubscription);
    }
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
      <ShopHeader onBack={() => router.back()} />

      <ScrollView style={styles.content}>
        {isAuthenticated ? (
          <DodjiBalance
            balance={user?.dodji || 0}
            onRefresh={() => reset()}
          />
        ) : (
          <TouchableOpacity 
            style={styles.loginPrompt}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginPromptText}>
              Connectez-vous pour accéder à votre solde de Dodji
            </Text>
          </TouchableOpacity>
        )}

        {/* Section Packs de Dodji */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Packs de Dodji</Text>
          {activePacks.length > 0 ? (
            activePacks.map((pack) => (
              <TokenPack
                key={pack.id}
                pack={pack}
                onSelect={selectTokenPack}
                isSelected={selectedPack?.id === pack.id}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              Aucun pack de jetons disponible pour le moment.
            </Text>
          )}
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

        {/* Boutons d'action */}
        <View style={styles.actions}>
          {(selectedPack || selectedSubscription) && (
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={handlePurchase}
              disabled={isPurchasing}
            >
              <Text style={styles.purchaseButtonText}>
                {isPurchasing ? 'Traitement...' : isAuthenticated ? 'Acheter' : 'Se connecter pour acheter'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
  section: {
    padding: 16,
    gap: 12,
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
  loginPrompt: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  loginPromptText: {
    color: '#fff',
    textAlign: 'center',
  },
  emptyText: {
    color: '#ccc',
    textAlign: 'center',
    padding: 16,
    fontStyle: 'italic',
  },
}); 