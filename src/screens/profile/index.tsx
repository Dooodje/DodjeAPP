import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfile } from '../../hooks/useProfile';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import MediaError from '../../components/ui/MediaError';
import { auth } from '../../config/firebase';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { AchievementBadges } from '../../components/profile/AchievementBadges';
import { ProgressCircles } from '../../components/profile/ProgressCircles';
import { WeeklyQuests } from '../../components/profile/WeeklyQuests';
import { SettingsButton } from '../../components/profile/SettingsButton';
import { AppRoute } from '../../types/routes';
import DodjeOneBanner from '../../components/shop/DodjeOneBanner';
import Dodji from '../../components/SymboleBlanc';
import DailyStrike from '../../components/DailyStrike';
import ProfilHomme from '../../components/profilHomme';

function Profile() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  
  // Appel du hook useProfile avec un userId valide
  const {
    profile,
    isLoading: profileIsLoading,
    error: profileError,
    updateUserProfile,
    selectUserBadge,
    selectUserQuest,
    calculateAndUpdateProgress
  } = useProfile(userId || '');

  // Vérification de l'authentification
  useEffect(() => {
    const getCurrentUser = () => {
      const user = auth.currentUser;
      if (user) {
        console.log('Current user found:', user.uid);
        setUserId(user.uid);
      } else {
        console.log('No current user found');
      }
    };
    
    getCurrentUser();
    
    // Écouter les changements d'authentification
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('Auth state changed, user found:', user.uid);
        setUserId(user.uid);
      } else {
        console.log('Auth state changed, no user found, redirecting to login');
        // Rediriger vers la page de connexion si non connecté
        router.replace('/(auth)/login' as AppRoute);
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  // Calcul et mise à jour de la progression au chargement du profil
  useEffect(() => {
    if (userId) {
      // Mettre à jour la progression à chaque fois que le profil est chargé
      calculateAndUpdateProgress()
        .then(() => console.log('Progression mise à jour avec succès'))
        .catch(error => console.error('Erreur lors de la mise à jour de la progression:', error));
    }
  }, [userId, calculateAndUpdateProgress]);
  
  // Si userId n'est pas encore défini
  if (!userId) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
        <View style={styles.loadingTextContainer}>
          <Text style={styles.loadingText}>Vérification de l'authentification...</Text>
        </View>
      </View>
    );
  }

  // Si le profil est en cours de chargement
  if (profileIsLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  // Gestion des erreurs
  if (profileError || !profile) {
    return (
      <View style={styles.container}>
        <MediaError
          message="Une erreur est survenue lors du chargement du profil"
          onRetry={() => window.location.reload()}
        />
      </View>
    );
  }

  const handleSettingsPress = () => {
    router.push("/settings" as AppRoute);
  };
  
  const handleStartPress = () => {
    // Rediriger vers la page d'achat de DodjeOne ou à activer une fonctionnalité
    router.push("/dodjeone" as AppRoute);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View style={styles.headerSpacer} />
            <View style={styles.headerTitleContainer}>
              <ProfileHeader 
                username="Mon profil"
                avatarUrl={profile.avatarUrl}
                showAvatar={false}
              />
            </View>
            <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
              <SettingsButton icon="cog" onPress={handleSettingsPress} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.profileInfoContainer}>
          <View style={styles.avatarSection}>
            <ProfilHomme />
          </View>

          <View style={styles.userInfoSection}>
            <View style={styles.usernameContainer}>
              <Text style={styles.usernameText}>#{profile.displayName || 'Utilisateur'}</Text>
            </View>

            <View style={styles.gainSection}>
              <Text style={styles.gainLabel}>Dodji</Text>
              <View style={styles.gainAmountContainer}>
                <Text style={styles.gainAmount}>{profile?.dodji || 0}</Text>
                <View style={styles.dodjiIconContainer}>
                  <Dodji width={16} height={24} />
                </View>
              </View>
            </View>

            <View style={styles.streakSection}>
              <Text style={styles.gainLabel}>Streak</Text>
              <View style={styles.gainAmountContainer}>
                <Text style={[styles.gainAmount, styles.streakAmount]}>{profile?.streak || 0}</Text>
                <View style={styles.dailyStrikeContainer}>
                  <DailyStrike width={16} height={24} />
                </View>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.mainContent}>
          <DodjeOneBanner onPress={handleStartPress} />
          
          <View style={styles.achievementsContainer}>
            <ProfileHeader 
              username="Mes succès"
              showAvatar={false}
              textStyle={styles.sectionTitle}
            />
            <AchievementBadges 
              profile={profile} 
              onBadgePress={selectUserBadge}
            />
          </View>
          
          <View style={styles.progressContainer}>
            <ProfileHeader 
              username="Ma progression"
              showAvatar={false}
              textStyle={styles.sectionTitle}
            />
            <ProgressCircles profile={profile} />
          </View>
          
          <View style={styles.questsContainer}>
            <ProfileHeader 
              username="Quêtes de la semaine"
              showAvatar={false}
              textStyle={styles.sectionTitle}
            />
            <WeeklyQuests 
              profile={profile}
              onQuestPress={selectUserQuest}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
    paddingTop: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  headerSpacer: {
    width: 40,
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileInfoContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  avatarSection: {
    width: '50%',
    aspectRatio: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  avatarContainer: {
    width: '100%',
    height: '100%',
  },
  userInfoSection: {
    width: '50%',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 12,
    height: '100%',
    paddingTop: 20,
  },
  usernameContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginBottom: 4,
  },
  usernameText: {
    fontFamily: 'Arboria-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  gainSection: {
    alignItems: 'center',
    width: '100%',
  },
  gainLabel: {
    fontFamily: 'Arboria-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  gainAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
  },
  gainAmount: {
    fontFamily: 'Arboria-Bold',
    fontSize: 24,
    color: '#F3FF90',
    textShadowColor: 'rgba(243, 255, 144, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    textAlign: 'center',
  },
  streakSection: {
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  streakAmount: {
    color: '#9BEC00',
    textShadowColor: 'rgba(155, 236, 0, 0.3)',
  },
  dodjiIconContainer: {
    marginTop: -4,
  },
  dailyStrikeContainer: {
    marginTop: -4,
  },
  achievementsContainer: {
    marginTop: 20,
  },
  progressContainer: {
    marginTop: 30,
  },
  questsContainer: {
    marginTop: 30,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  loadingTextContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
}); 