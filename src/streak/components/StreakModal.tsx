import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { StreakModalData } from '../types';
import { DailyStrike } from '../../components/DailyStrike';
import { Dodji } from '../../components/SymboleBlanc';
import { LogoDodjeBlanc } from '../../components/LogoDodjeBlanc';
import { useAnimation } from '../../contexts/AnimationContext';
import { useUserStreak } from '../../hooks/useUserStreak';

// Import du contexte FirstConnection pour éviter les conflits de modals
let useFirstConnection: (() => { showQuestionnaire: boolean }) | null = null;
try {
  const firstConnectionModule = require('../../../app/contexts/FirstConnectionContext');
  useFirstConnection = firstConnectionModule.useFirstConnection;
} catch (error) {
  // Le contexte n'est pas disponible, on continue sans
}

interface StreakModalProps {
  modalData: StreakModalData;
  onClose: () => void;
  onClaimReward?: () => Promise<boolean>;
}

const { width, height } = Dimensions.get('window');

// Composant de progression simple
const ProgressIndicator: React.FC<{
  progress: number;
  color: string;
  children: React.ReactNode;
}> = ({ progress, color, children }) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  return (
    <View style={{ alignItems: 'center' }}>
      {/* Valeur de progression sans cercle */}
      <View style={{ marginBottom: 8 }}>
        {children}
      </View>
      
      {/* Barre de progression */}
      <View
        style={{
          width: 60,
          height: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${clampedProgress * 100}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 2,
          }}
        />
      </View>
    </View>
  );
};

// Fonction pour calculer les prochaines récompenses (PÉRIODIQUE)
const getNextRewards = (currentStreak: number) => {
  const rewards = [];
  
  // Prochaine récompense quotidienne
  rewards.push({
    type: 'daily',
    days: currentStreak + 1,
    reward: 5,
    label: 'Demain',
    description: '+5',
    isNext: true
  });
  
  // Prochaine récompense hebdomadaire (tous les 7 jours)
  const nextWeeklyStreak = Math.ceil((currentStreak + 1) / 7) * 7;
  const daysUntilWeekly = nextWeeklyStreak - currentStreak;
  
  // Ne pas afficher si c'est aussi un multiple de 30 (pour éviter la confusion)
  if (nextWeeklyStreak % 30 !== 0) {
    rewards.push({
      type: 'weekly',
      days: nextWeeklyStreak,
      reward: 50,
      label: `J${nextWeeklyStreak}`,
      description: '+50',
      isNext: false,
      daysLeft: daysUntilWeekly
    });
  }
  
  // Prochaine récompense mensuelle (tous les 30 jours)
  const nextMonthlyStreak = Math.ceil((currentStreak + 1) / 30) * 30;
  const daysUntilMonthly = nextMonthlyStreak - currentStreak;
  
  rewards.push({
    type: 'monthly',
    days: nextMonthlyStreak,
    reward: 250,
    label: `J${nextMonthlyStreak}`,
    description: '+250',
    isNext: false,
    daysLeft: daysUntilMonthly
  });
  
  return rewards;
};

// Composant pour texte avec gradient
const GradientText: React.FC<{ children: string; fontSize: number }> = ({ children, fontSize }) => {
  return (
    <Svg height={70} width={119} style={{ alignSelf: 'flex-end', marginLeft: -15 }}>
      <Defs>
        <SvgLinearGradient id="textGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#F3FF90" stopOpacity="1" />
          <Stop offset="33%" stopColor="#9BEC00" stopOpacity="1" />
          <Stop offset="66%" stopColor="#06D001" stopOpacity="1" />
          <Stop offset="100%" stopColor="#059212" stopOpacity="1" />
        </SvgLinearGradient>
      </Defs>
      <SvgText
        fill="url(#textGradient)"
        fontSize={fontSize}
        fontFamily="Arboria-Bold"
        fontWeight="bold"
        x="50%"
        y="100%"
        textAnchor="middle"
        letterSpacing="-5"
      >
        {children}
      </SvgText>
    </Svg>
  );
};

export const StreakModal: React.FC<StreakModalProps> = ({ modalData, onClose, onClaimReward }) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const [claiming, setClaiming] = React.useState(false);
  const { startFlyingDodjisAnimation } = useAnimation();
  const { refreshStreak } = useUserStreak();
  
  // Vérifier si le questionnaire de première connexion est visible
  let isQuestionnaireVisible = false;
  try {
    if (useFirstConnection) {
      const firstConnectionContext = useFirstConnection();
      isQuestionnaireVisible = firstConnectionContext.showQuestionnaire;
    }
  } catch (error) {
    // Ignorer l'erreur si le contexte n'est pas disponible
  }

  React.useEffect(() => {
    console.log('🎭 StreakModal: Données reçues:', modalData);
    
    if (modalData.visible) {
      console.log('🎭 StreakModal: Affichage de la modal');
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      console.log('🎭 StreakModal: Masquage de la modal');
      scaleValue.setValue(0);
    }
  }, [modalData.visible, scaleValue]);

  // Ne pas afficher le modal si le questionnaire de première connexion est visible
  if (isQuestionnaireVisible) {
    console.log('🎭 StreakModal: Questionnaire de première connexion visible, modal masqué');
    return null;
  }

  const handleClose = () => {
    console.log('🎭 StreakModal: Fermeture demandée');
    // Fermeture simple et directe
    onClose();
  };

  const handleClaimReward = async () => {
    console.log('🎭 StreakModal: handleClaimReward appelé');
    console.log('🎭 StreakModal: onClaimReward existe?', !!onClaimReward);
    
    setClaiming(true);
    
    // Déclencher l'animation globale immédiatement
    console.log('🎭 StreakModal: Déclenchement de l\'animation globale');
    console.log('🎭 StreakModal: Nombre de Dodjis gagnés:', modalData.dodjiEarned);
    // Position approximative du bouton (centre-bas du modal)
    const buttonX = width * 0.5;
    const buttonY = height * 0.7;
    startFlyingDodjisAnimation(buttonX, buttonY, modalData.dodjiEarned);
    
    // Fermer le modal après un court délai
    setTimeout(() => {
      console.log('🎭 StreakModal: Fermeture du modal');
      onClose();
    }, 500);
    
    // Gérer onClaimReward en arrière-plan
    if (onClaimReward) {
      try {
        const success = await onClaimReward();
        console.log('🎭 StreakModal: Résultat de onClaimReward:', success);
        if (success) {
          // Rafraîchir le streak dans le GlobalHeader
          console.log('🎭 StreakModal: Rafraîchissement du streak après réclamation');
          refreshStreak();
        }
      } catch (error) {
        console.error('🎭 StreakModal: Erreur lors de la réclamation:', error);
      }
    }
    
    setClaiming(false);
  };

  console.log('🎭 StreakModal: Rendu avec visible =', modalData.visible);

  if (!modalData.visible) return null;

  const nextRewards = getNextRewards(modalData.streakCount);

  return (
    <>
      <Modal
        transparent
        visible={modalData.visible}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleValue }],
              },
            ]}
          >
            {/* Haut du modal selon le design Figma */}
            <View style={styles.topSection}>
              {/* Frame principal avec icône et chiffre */}
              <View style={styles.iconAndNumberContainer}>
                {/* Frame avec icône et chiffre côte à côte */}
                <View style={styles.iconNumberRow}>
                  <View style={styles.iconContainer}>
                    <DailyStrike width={58} height={106} />
                  </View>
                  <GradientText fontSize={90}>{modalData.streakCount.toString()}</GradientText>
                </View>
                {/* Texte "Daily streak !" */}
                <Text style={styles.streakMainLabel}>Daily streak !</Text>
              </View>
              
              {/* Message de félicitations - SEULEMENT quand il y a une récompense */}
              {modalData.dodjiEarned > 0 && (
                <View style={styles.congratulationsContainer}>
                  <Text style={styles.congratulationsText}>
                    Bravo jeune gland !{'\n'}Tes racines s'ancrent de plus en plus.
                  </Text>
                </View>
              )}
            </View>

            {/* Indicateurs d'objectifs circulaires - TOUJOURS AFFICHÉS */}
            <View style={styles.goalsContainer}>
              {/* Prochaine récompense hebdomadaire (tous les 7 jours) */}
              <View style={styles.goalItem}>
                {(() => {
                  const nextWeeklyStreak = Math.ceil((modalData.streakCount + 1) / 7) * 7;
                  const daysUntilWeekly = nextWeeklyStreak - modalData.streakCount;
                  const progressToWeekly = (7 - daysUntilWeekly) / 7;
                  
                  // Ne pas afficher si c'est aussi un multiple de 30 (pour éviter la confusion)
                  if (nextWeeklyStreak % 30 === 0) {
                    return null;
                  }
                  
                  return (
                    <ProgressIndicator
                      progress={progressToWeekly}
                      color="#9BEC00"
                    >
                      <Text style={styles.daysLeftText}>
                        {daysUntilWeekly === 1 ? 'Demain' : `Dans ${daysUntilWeekly}j`}
                      </Text>
                    </ProgressIndicator>
                  );
                })()}
                <View style={styles.goalInfo}>
                  <View style={styles.rewardContainer}>
                    <Text style={styles.goalReward}>+50</Text>
                    <Dodji width={10} height={15} />
                  </View>
                </View>
              </View>

              {/* Prochaine récompense mensuelle (tous les 30 jours) */}
              <View style={styles.goalItem}>
                {(() => {
                  const nextMonthlyStreak = Math.ceil((modalData.streakCount + 1) / 30) * 30;
                  const daysUntilMonthly = nextMonthlyStreak - modalData.streakCount;
                  const progressToMonthly = (30 - daysUntilMonthly) / 30;
                  
                  return (
                    <ProgressIndicator
                      progress={progressToMonthly}
                      color="#FFD700"
                    >
                      <Text style={styles.daysLeftTextGold}>
                        {daysUntilMonthly === 1 ? 'Demain' : `Dans ${daysUntilMonthly}j`}
                      </Text>
                    </ProgressIndicator>
                  );
                })()}
                <View style={styles.goalInfo}>
                  <View style={styles.rewardContainer}>
                    <Text style={styles.goalRewardGold}>+250</Text>
                    <Dodji width={10} height={15} />
                  </View>
                </View>
              </View>
            </View>

            {/* Bouton principal */}
            {modalData.dodjiEarned > 0 ? (
              <TouchableOpacity 
                style={[styles.continueButton, claiming && styles.continueButtonDisabled]} 
                onPress={handleClaimReward}
                disabled={claiming}
              >
                <LinearGradient
                  colors={['#9BEC00', '#06D001']}
                  style={styles.buttonGradient}
                >
                  {claiming ? (
                    <Text style={styles.continueButtonText}>Réclamation...</Text>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={styles.continueButtonText}>Récupérer +{modalData.dodjiEarned}</Text>
                      <LogoDodjeBlanc width={12} height={18} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.continueButton} 
                onPress={handleClose}
              >
                <LinearGradient
                  colors={['#9BEC00', '#06D001']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.continueButtonText}>Continuer</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </Modal>
      
      {/* Dodjis volants globaux - maintenant gérés par le contexte global */}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 4, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 5000,
    elevation: 5000,
  },
  modalContainer: {
    backgroundColor: '#0A0400',
    borderRadius: 20,
    padding: 20,
    width: width * 0.85,
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(155, 236, 0, 0.3)',
    zIndex: 5001,
    elevation: 5001,
  },
  iconContainer: {
    alignItems: 'center',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 20,
    width: 306,
    gap: 10,
  },
  iconAndNumberContainer: {
    alignItems: 'center',
    gap: 16,
    width: 199,
  },
  iconNumberRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
  },
  streakMainLabel: {
    fontSize: 20,
    fontFamily: 'Arboria-Medium',
    color: '#F3FF90',
    textAlign: 'center',
    width: '100%',
  },
  currentRewardContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  rewardGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rewardAmount: {
    fontSize: 24,
    fontFamily: 'Arboria-Bold',
    color: '#0A0400',
  },
  rewardLabel: {
    fontSize: 12,
    fontFamily: 'Arboria-Medium',
    color: '#0A0400',
    marginTop: 2,
  },
  goalsContainer: {
    width: '100%',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  goalItem: {
    alignItems: 'center',
    marginBottom: 8,
  },
  goalInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  goalReward: {
    fontSize: 13,
    fontFamily: 'Arboria-Bold',
    color: '#F1E61C',
  },
  goalRewardGold: {
    fontSize: 13,
    fontFamily: 'Arboria-Bold',
    color: '#F1E61C',
  },
  continueButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  encouragementText: {
    fontSize: 11,
    fontFamily: 'Arboria-Book',
    color: '#F3FF90',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  progressValue: {
    fontSize: 14,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  progressValueGold: {
    fontSize: 14,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  congratulationsContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  congratulationsText: {
    fontSize: 15,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 15,
  },
  flyingDodjisContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'none',
  },
  flyingDodji: {
    position: 'absolute',
    width: 60,
    height: 80,
    borderRadius: 30,
    backgroundColor: 'rgba(241, 230, 28, 0.8)',
    borderWidth: 2,
    borderColor: '#F1E61C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F1E61C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  daysLeftText: {
    fontSize: 12,
    fontFamily: 'Arboria-Medium',
    color: '#FFFFFF',
    marginTop: 2,
  },
  daysLeftTextGold: {
    fontSize: 12,
    fontFamily: 'Arboria-Medium',
    color: '#FFFFFF',
    marginTop: 2,
  },
}); 