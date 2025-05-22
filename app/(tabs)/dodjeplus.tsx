import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AnnexeHeader } from '../../src/components/ui/AnnexeHeader';
import { useAuth } from '../../src/hooks/useAuth';
import PastilleAnalyseprofil from '../../src/components/PastilleAnalyseprofil';
import PlanteDodjeLab from '../../src/components/PlanteDodjeLab';
import SymboleBlanc from '../../src/components/SymboleBlanc';

/**
 * Écran DodjeLabs - Point d'entrée vers les fonctionnalités avancées
 */
export default function DodjeLabsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const navigateToDodjeLabScreen = () => {
    router.push("/(dodjelab)");
  };

  return (
    <View style={styles.container}>
      <AnnexeHeader 
        title="Dodje Lab"
        points={user?.dodji || 0}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.cardsContainer}>
          {/* Première carte - Simulation */}
          <TouchableOpacity style={[styles.card, styles.activeCard]} onPress={navigateToDodjeLabScreen}>
            <View style={styles.cardContent}>
              <View style={styles.numberContainer}>
                <Text style={styles.cardNumber}>01.</Text>
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.cardTitle}>Qui suis-je ?</Text>
              </View>
              <View style={styles.descriptionContainer}>
                <Text style={styles.cardDescription}>
                  Un bon investisseur est un investisseur qui se connait !
                </Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.premiumText}>
                  <Text style={styles.premiumNumber}>500</Text>
                  <Text style={{marginHorizontal: 2}}><SymboleBlanc width={16} height={16} /></Text> ou gratuit pour les abonnées DodjeOne
                </Text>
              </View>
            </View>
            <View style={styles.pastilleContainer}>
              <PastilleAnalyseprofil />
            </View>
          </TouchableOpacity>

          {/* Deuxième carte - À venir */}
          <TouchableOpacity style={[styles.card, styles.inactiveCard]}>
            <View style={styles.cardContent}>
              <View style={styles.numberContainer}>
                <Text style={[styles.cardNumber, styles.inactiveNumber]}>02.</Text>
              </View>
              <View style={styles.planteContainer}>
                <PlanteDodjeLab />
                <Text style={styles.planteText}>Faites du boucan, ça pousse...</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Troisième carte - À venir */}
          <TouchableOpacity style={[styles.card, styles.inactiveCard]}>
            <View style={styles.cardContent}>
              <View style={styles.numberContainer}>
                <Text style={[styles.cardNumber, styles.inactiveNumber]}>03.</Text>
              </View>
              <View style={styles.planteContainer}>
                <PlanteDodjeLab />
                <Text style={styles.planteText}>Faites du boucan, ça pousse...</Text>
              </View>
            </View>
          </TouchableOpacity>
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
  contentContainer: {
    padding: 20,
    paddingTop: 160,
    paddingBottom: 100,
  },
  cardsContainer: {
    gap: 14,
  },
  card: {
    width: '100%',
    height: 210,
    borderRadius: 15,
    position: 'relative',
    overflow: 'hidden',
  },
  activeCard: {
    backgroundColor: '#9BEC00',
    shadowColor: '#9BEC00',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  inactiveCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  inactiveNumber: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  inactiveTitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 30,
  },
  cardContent: {
    flex: 1,
    height: '100%',
  },
  numberContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 10,
  },
  cardNumber: {
    fontFamily: 'Arboria-Medium',
    fontSize: 20,
    color: '#059212',
  },
  titleContainer: {
    paddingHorizontal: 10,
    marginTop: 53,
  },
  cardTitle: {
    fontFamily: 'Arboria-Bold',
    fontSize: 40,
    letterSpacing: -2.5,
    color: '#FFFFFF',
  },
  descriptionContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginTop: 5,
    maxWidth: '75%',
  },
  cardDescription: {
    fontFamily: 'Helvetica Neue',
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    position: 'absolute',
    bottom: 10,
    left: 10,
    padding: 10,
  },
  premiumText: {
    fontFamily: 'Arboria-Medium',
    fontSize: 10,
    color: '#F3FF90',
  },
  premiumNumber: {
    fontSize: 16,
  },
  pastilleContainer: {
    position: 'absolute',
    right: -115,
    top: -10,
    width: 229,
    height: 229,
  },
  planteContainer: {
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 0,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
  },
  planteText: {
    fontFamily: 'Arboria-Bold',
    fontSize: 15,
    lineHeight: 25,
    letterSpacing: 0,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
  },
  symbolStyle: {
    marginHorizontal: 2,
  },
}); 