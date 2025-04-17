import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDodjeOne } from '../../hooks/useDodjeOne';
import { usePerformanceMonitor } from '../../utils/performance';
import { withErrorHandling } from '../../utils/errorHandling';
import { AppRoute } from '../../types/routes';

export function DodjeOneScreen() {
  const router = useRouter();
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
      try {
        await subscribe(plan);
        router.back();
      } catch (err) {
        console.error('Erreur lors de la souscription:', err);
      }
    },
    'Erreur lors de la souscription'
  );

  const handleRestorePurchases = withErrorHandling(
    async () => {
      try {
        await restorePurchases();
        if (subscription) {
          router.back();
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
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.activeSubscriptionCard}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <MaterialCommunityIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
            
            <Text style={styles.activeTitle}>DODJE ONE</Text>
            <View style={styles.trophyIcon}>
              <MaterialCommunityIcons name="trophy" size={60} color="#FFFFFF" />
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

  // Display subscription options
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.hashtag}>#RonanL99</Text>
        </View>
        
        <View style={styles.subscriptionContainer}>
          <View style={styles.titleCard}>
            <Text style={styles.title}>DODJE ONE</Text>
          </View>
          
          <Text style={styles.freeTrialText}>Essai sans frais unique 7 jours</Text>
          
          <TouchableOpacity 
            style={styles.subscribeButton}
            onPress={() => {
              // Naviguer vers la page d'accueil principale au lieu de créer un abonnement immédiatement
              router.push('/(tabs)' as AppRoute);
            }}
          >
            <Text style={styles.subscribeButtonText}>C'est parti !</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.restorePurchasesButton}
          onPress={handleRestorePurchases}
        >
          <Text style={styles.restorePurchasesText}>Restaurer mes achats</Text>
        </TouchableOpacity>
        
        <Text style={styles.termsText}>
          L'abonnement sera renouvelé automatiquement. Vous pouvez annuler à tout moment.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  scrollView: {
    flex: 1,
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
  header: {
    alignItems: 'flex-end',
    marginTop: 40,
    marginRight: 30,
    marginBottom: 30,
  },
  hashtag: {
    fontSize: 24,
    fontFamily: 'Arboria-Medium',
    color: '#FFFFFF',
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  subscriptionContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleCard: {
    backgroundColor: '#333008',
    width: '100%',
    borderRadius: 16,
    paddingVertical: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  freeTrialText: {
    fontSize: 16,
    fontFamily: 'Arboria-Book',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  subscribeButton: {
    backgroundColor: '#9BEC00',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 20,
    width: '90%',
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#000000',
    fontSize: 22,
    fontFamily: 'Arboria-Bold',
  },
  restorePurchasesButton: {
    alignItems: 'center',
    marginVertical: 30,
  },
  restorePurchasesText: {
    color: '#9BEC00',
    fontSize: 14,
    fontFamily: 'Arboria-Medium',
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
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
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