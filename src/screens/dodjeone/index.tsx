import React, { useEffect, ReactNode, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ImageBackground, ViewStyle, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDodjeOne } from '../../hooks/useDodjeOne';
import { usePerformanceMonitor } from '../../utils/performance';
import { withErrorHandling } from '../../utils/errorHandling';
import { AppRoute } from '../../types/routes';
import DodjePlusBanniere from '../../components/DodjePlusBanniere';
import PaymentNotReadyModal from '../../components/ui/PaymentNotReadyModal';
import Trophee from '../../components/Trophee';

// Ce composant sera utilisé comme motif de fond pour la carte jaune
function YellowPatternBackground({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.patternContainer, style]}>
      {/* Les formes abstraites en jaune plus clair seraient idéalement des images SVG */}
      <View style={[styles.patternShape, { top: '10%', left: '5%' }]} />
      <View style={[styles.patternShape, { top: '20%', right: '10%' }]} />
      <View style={[styles.patternShape, { bottom: '15%', left: '20%' }]} />
      <View style={[styles.patternShape, { bottom: '40%', right: '15%' }]} />
      <View style={[styles.patternShape, { top: '40%', left: '50%' }]} />
      {children}
    </View>
  );
}

export function DodjeOneScreen() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const [showPaymentNotReadyModal, setShowPaymentNotReadyModal] = useState(false);
  const {
    subscription,
    isLoading,
    error,
    subscribe,
    cancelSubscription,
    restorePurchases,
  } = useDodjeOne();
  usePerformanceMonitor('DodjeOneScreen');

  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error);
    }
  }, [error]);

  const handleSubscribe = withErrorHandling(
    async (plan: 'monthly' | 'yearly') => {
      // Afficher le modal de paiement non disponible au lieu du processus d'abonnement
      setShowPaymentNotReadyModal(true);
    },
    'Erreur lors de la souscription'
  );

  const handleRestorePurchases = withErrorHandling(
    async () => {
      try {
        await restorePurchases();
        if (subscription) {
          router.push('/(tabs)' as AppRoute);
        }
      } catch (err) {
        console.error('Erreur lors de la restauration des achats:', err);
      }
    },
    'Erreur lors de la restauration des achats'
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (subscription) {
    // Display active subscription
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.activeSubscriptionCard}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <MaterialCommunityIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
            
            <Text style={styles.activeTitle}>DODJE ONE</Text>
            <View style={styles.trophyIcon}>
              <Trophee width={60} height={60} />
            </View>
            
            <Text style={styles.activeInfo}>
              Abonnement {subscription.plan === 'monthly' ? 'mensuel' : 'annuel'} actif
            </Text>
            <Text style={styles.renewalInfo}>
              Renouvellement le {subscription.endDate.toLocaleDateString()}
            </Text>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                Alert.alert(
                  'Annuler l\'abonnement',
                  'Êtes-vous sûr de vouloir annuler votre abonnement ?',
                  [
                    { text: 'Non', style: 'cancel' },
                    { text: 'Oui', onPress: () => cancelSubscription() },
                  ]
                );
              }}
            >
              <Text style={styles.cancelButtonText}>Gérer mon abonnement</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Display subscription options - new design based on the provided image
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.subscriptionCard}>
          <View style={styles.backgroundWrapper}>
            <DodjePlusBanniere width={screenWidth * 2} height={screenWidth * 2} />
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
          
          <Text style={styles.title}>DODJE ONE</Text>
          
          <View style={styles.freetrial}>
            <Text style={styles.freeTrialText}>Essai sans frais unique 7 jours</Text>
          </View>
          
          <Text style={styles.subtitle}>
            Optimise ton expérience et prépare la suite.
          </Text>
        </View>
        
        {/* Price Button */}
        <TouchableOpacity 
          style={styles.priceButton}
          onPress={() => handleSubscribe('monthly')}
        >
          <Text style={styles.priceButtonText}>7,99€ / mois</Text>
        </TouchableOpacity>
        
        {/* Benefits List */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitRow}>
            <MaterialCommunityIcons name="check" size={24} color="#9BEC00" />
            <Text style={styles.benefitText}>Diminue le prix des parcours</Text>
          </View>
          
          <View style={styles.benefitRow}>
            <MaterialCommunityIcons name="check" size={24} color="#9BEC00" />
            <Text style={styles.benefitText}>Gagne plus de Dodjis</Text>
          </View>
          
          <View style={styles.benefitRow}>
            <MaterialCommunityIcons name="check" size={24} color="#9BEC00" />
            <Text style={styles.benefitText}>Accède à du contenu exclusif</Text>
          </View>
          
          <View style={styles.benefitRow}>
            <MaterialCommunityIcons name="check" size={24} color="#9BEC00" />
            <Text style={styles.benefitText}>Prends un temps d'avance sur les évolutions à venir</Text>
          </View>
        </View>
        
        {/* Trophy Icon */}
        <View style={styles.trophyContainer}>
          <Trophee width={80} height={80} />
        </View>
        
        <Text style={styles.termsText}>
          L'abonnement sera renouvelé automatiquement. Vous pouvez annuler à tout moment.
        </Text>
      </ScrollView>

      {/* Modal de paiement non disponible */}
      <PaymentNotReadyModal
        visible={showPaymentNotReadyModal}
        onClose={() => setShowPaymentNotReadyModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  backgroundWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
    transform: [{ scale: 1.2 }],
    zIndex: 0,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0400',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Arboria-Book',
  },
  // Pattern background styles
  patternContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  patternShape: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 150, 0.5)',
    transform: [{ scale: 1.5 }],
    zIndex: 0,
  },
  // Design styles based on the image
  subscriptionCard: {
    backgroundColor: '#F3FF90',
    borderRadius: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 20,
    margin: 0,
    marginHorizontal: 0,
    alignItems: 'flex-start',
    position: 'relative',
    paddingBottom: 30,
    marginTop: 0,
    paddingTop: 60,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Arboria-Bold',
    color: '#000000',
    marginTop: 30,
    marginBottom: 8,
    marginLeft: 16,
    alignSelf: 'flex-start',
    zIndex: 1,
  },
  freetrial: {
    backgroundColor: '#000000',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 8,
    marginLeft: 16,
    zIndex: 1,
  },
  freeTrialText: {
    fontSize: 14,
    fontFamily: 'Arboria-Medium',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Arboria-Medium',
    color: '#000000',
    marginTop: 16,
    marginBottom: 10,
    marginLeft: 16,
    zIndex: 1,
  },
  priceButton: {
    backgroundColor: '#9BEC00',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  priceButtonText: {
    fontSize: 22,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
  },
  benefitsContainer: {
    marginTop: 30,
    paddingHorizontal: 26,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  benefitText: {
    fontSize: 16,
    fontFamily: 'Arboria-Medium',
    color: '#FFFFFF',
    marginLeft: 12,
    flexShrink: 1,
  },
  trophyContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  termsText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontFamily: 'Arboria-Book',
    textAlign: 'center',
    marginHorizontal: 30,
    marginBottom: 30,
  },
  // Active subscription styles
  activeSubscriptionCard: {
    margin: 20,
    backgroundColor: '#F3FF90',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  activeTitle: {
    fontSize: 28,
    fontFamily: 'Arboria-Bold',
    color: '#000000',
    marginTop: 10,
    marginBottom: 20,
  },
  trophyIcon: {
    marginBottom: 20,
  },
  activeInfo: {
    fontSize: 18,
    fontFamily: 'Arboria-Medium',
    color: '#000000',
    marginBottom: 10,
  },
  renewalInfo: {
    fontSize: 14,
    fontFamily: 'Arboria-Book',
    color: '#000000',
    marginBottom: 30,
  },
  cancelButton: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 10,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Arboria-Medium',
  },
}); 