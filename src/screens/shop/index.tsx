import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, Animated, Modal, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useShop } from '../../hooks/useShop';
import { useAuth } from '../../hooks/useAuth';
import { TokenPack as TokenPackComponent } from '../../components/shop/TokenPack';
import { WelcomePack } from '../../components/shop/WelcomePack';
import { DodjeOneCard } from '../../components/shop/DodjeOneCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import MediaError from '../../components/ui/MediaError';
import { TokenPack } from '../../types/shop';
import DodjeOneBanner from '../../components/shop/DodjeOneBanner';
import { DodjiService } from '../../services/businessLogic/DodjiService';
import { useAnimation } from '../../contexts/AnimationContext';
import { useWelcomePackBadge } from '../../contexts/WelcomePackContext';
import PaymentNotReadyModal from '../../components/ui/PaymentNotReadyModal';

export default function ShopScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { hideBadge, showBadge } = useWelcomePackBadge();
  const [isClaimingWelcome, setIsClaimingWelcome] = useState(false);
  const [welcomePackClaimed, setWelcomePackClaimed] = useState(false);
  const [isPackDisappearing, setIsPackDisappearing] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [selectedWelcomePack, setSelectedWelcomePack] = useState<TokenPack | null>(null);
  const [showPaymentNotReadyModal, setShowPaymentNotReadyModal] = useState(false);
  const packScaleAnim = useRef(new Animated.Value(1)).current;
  const { startFlyingDodjisAnimation } = useAnimation();
  
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

  // Synchroniser l'état local avec l'état global du badge
  useEffect(() => {
    // Si le badge n'est pas affiché, cela signifie que le pack a été récupéré
    setWelcomePackClaimed(!showBadge);
  }, [showBadge]);

  // Séparer le pack "Bienvenue" des autres packs
  const { welcomePack, regularPacks } = useMemo(() => {
    const activePacks = tokenPacks.filter(pack => pack.status !== 'inactive');
    
    const welcomePack = activePacks.find(pack => 
      pack.name.toLowerCase().includes('bienvenue')
    );
    
    const regularPacks = activePacks
      .filter(pack => !pack.name.toLowerCase().includes('bienvenue'))
      .sort((a, b) => a.price - b.price);
    
    return { welcomePack, regularPacks };
  }, [tokenPacks]);

  // Grouper les packs réguliers par rangées de 3
  const packRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < regularPacks.length; i += 3) {
      rows.push(regularPacks.slice(i, i + 3));
    }
    return rows;
  }, [regularPacks]);

  // Afficher le chargement si l'authentification ou les données sont en cours de chargement
  if (authLoading || isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  const animatePackDisappearance = () => {
    setIsPackDisappearing(true);
    
    // Animation : petit zoom in puis total zoom out
    Animated.sequence([
      // Petit zoom in (1.0 -> 1.1)
      Animated.timing(packScaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      // Total zoom out (1.1 -> 0)
      Animated.timing(packScaleAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // À la fin de l'animation, marquer le pack comme récupéré
      setWelcomePackClaimed(true);
      setIsPackDisappearing(false);
      // Remettre l'échelle à 1 pour la prochaine fois (si nécessaire)
      packScaleAnim.setValue(1);
    });
  };

  const handleWelcomePackClaim = async (pack: TokenPack) => {
    if (!isAuthenticated || !user?.uid) {
      router.push('/(auth)/login');
      return;
    }

    try {
      setIsClaimingWelcome(true);
      
      // Vérifier si l'utilisateur a déjà récupéré ce pack
      const hasReceived = await DodjiService.hasReceivedReward(user.uid, 'welcome_pack');
      
      if (hasReceived) {
        Alert.alert(
          'Déjà récupéré',
          'Vous avez déjà récupéré votre pack de bienvenue !',
          [{ text: 'OK' }]
        );
        setWelcomePackClaimed(true);
        return;
      }

      // Afficher le modal personnalisé au lieu de Alert.alert
      setSelectedWelcomePack(pack);
      setShowWelcomeModal(true);
    } catch (error) {
      console.error('Erreur lors de la vérification du pack de bienvenue:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsClaimingWelcome(false);
    }
  };

  const handleConfirmWelcomePack = async () => {
    if (!selectedWelcomePack || !user?.uid) return;

    try {
      setIsClaimingWelcome(true);
      setShowWelcomeModal(false);
      
      // Ajouter les Dodji au compte de l'utilisateur
      await DodjiService.addReward(user.uid, selectedWelcomePack.totalTokens || selectedWelcomePack.amount, 'welcome_pack');
      
      // Cacher le badge "!" de la boutique
      hideBadge();
      
      // Lancer l'animation des Dodji volants depuis le centre de l'écran
      const screenWidth = Dimensions.get('window').width;
      const screenHeight = Dimensions.get('window').height;
      startFlyingDodjisAnimation(
        screenWidth / 2, 
        screenHeight / 2, 
        selectedWelcomePack.totalTokens || selectedWelcomePack.amount,
        () => {
          // Faire disparaître le pack de bienvenue à la fin de l'animation
          animatePackDisappearance();
        }
      );
    } catch (error) {
      console.error('Erreur lors de l\'ajout des Dodji:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la récupération de votre récompense. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsClaimingWelcome(false);
      setSelectedWelcomePack(null);
    }
  };

  const handlePackSelection = (pack: TokenPack) => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    
    // Gestion spéciale pour le pack Bienvenue
    if (pack.name.toLowerCase().includes('bienvenue')) {
      handleWelcomePackClaim(pack);
      return;
    }
    
    // Pour tous les autres packs, afficher le modal de paiement non disponible
    setShowPaymentNotReadyModal(true);
  };

  const handleDodjeOneSelection = (subscription: any) => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    
    // Afficher le modal de paiement non disponible au lieu de lancer l'abonnement
    setShowPaymentNotReadyModal(true);
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
        
        {/* Section Pack Bienvenue - Masqué si récupéré */}
        {welcomePack && !welcomePackClaimed && (
          <View style={styles.welcomeSection}>
            <Animated.View
              style={{
                transform: [{ scale: packScaleAnim }],
              }}
            >
              <WelcomePack
                pack={welcomePack}
                onSelect={handlePackSelection}
                isSelected={selectedPack?.id === welcomePack.id || isClaimingWelcome || isPackDisappearing}
              />
            </Animated.View>
          </View>
        )}
        
        {/* Section Packs de Dodji réguliers */}
        <View style={styles.section}>
          {packRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((pack) => (
                <View key={pack.id} style={styles.packContainer}>
                  <TokenPackComponent
                    pack={pack}
                    onSelect={handlePackSelection}
                    isSelected={selectedPack?.id === pack.id}
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
              onSelect={handleDodjeOneSelection}
              isSelected={selectedSubscription?.id === subscription.id}
            />
          </View>
        )}
      </ScrollView>

      {/* Modal de confirmation du pack de bienvenue */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showWelcomeModal}
        onRequestClose={() => setShowWelcomeModal(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            {/* Titre */}
            <Text style={styles.modalTitle}>Récupérer ma récompense 🎁</Text>
            
            {/* Message */}
            <Text style={styles.modalText}>
              Félicitations ! Vous allez recevoir {selectedWelcomePack?.totalTokens || selectedWelcomePack?.amount} Dodji gratuits pour commencer votre aventure.
            </Text>
            
            {/* Boutons */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmWelcomePack}
                disabled={isClaimingWelcome}
              >
                {isClaimingWelcome ? (
                  <ActivityIndicator color="#0A0400" />
                ) : (
                  <Text style={styles.modalButtonText}>Récupérer mon cadeau</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de paiement non disponible */}
      <PaymentNotReadyModal
        visible={showPaymentNotReadyModal}
        onClose={() => setShowPaymentNotReadyModal(false)}
      />
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
  welcomeSection: {
    marginTop: 20,
    marginBottom: 10,
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
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 4, 0, 0.8)',
  },
  modalView: {
    width: Dimensions.get('window').width * 0.85,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center'
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Arboria-Book',
    color: '#FFFFFF',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 24
  },
  modalButtonContainer: {
    width: '100%',
    gap: 10
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    elevation: 2,
    width: '100%'
  },
  confirmButton: {
    backgroundColor: '#F3FF90',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Arboria-Medium',
    color: '#0A0400',
    textAlign: 'center'
  },
}); 