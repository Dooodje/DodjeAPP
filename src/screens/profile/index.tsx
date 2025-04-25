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
import { BottomTabBar } from '../../components/ui/BottomTabBar';
import { SettingsButton } from '../../components/profile/SettingsButton';
import { AppRoute } from '../../types/routes';

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
      <View style={styles.headerContainer}>
        <View style={styles.flexSpace} />
        
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
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileInfoContainer}>
          <View style={styles.avatarSection}>
            <ProfileHeader 
              username=""
              avatarUrl={profile.avatarUrl}
              showUsername={false}
              showAvatar={true}
            />
          </View>
          
          <View style={styles.profileData}>
            <View style={styles.balanceContainer}>
              <ProfileHeader 
                username={`Dodji\n${profile.dodjiBalance || 0} ฿`}
                showAvatar={false}
                textAlign="right"
              />
            </View>
            
            <View style={styles.usernameContainer}>
              <ProfileHeader 
                username={`#${profile.displayName || 'Utilisateur'}`}
                showAvatar={false}
                textAlign="center"
                containerStyle={styles.usernameTag}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.dodjeOneContainer}>
          <ProfileHeader 
            username="DODJE ONE"
            showAvatar={false}
            containerStyle={styles.dodjeOneBox}
            textAlign="center"
          />
          <ProfileHeader 
            username="Essai sans frais unique 7 jours"
            showAvatar={false}
            textAlign="center"
            containerStyle={styles.freeTrialBanner}
            textStyle={styles.freeTrialText}
          />
          <TouchableOpacity style={styles.startButton} onPress={handleStartPress}>
            <ProfileHeader 
              username="C'est parti !"
              showAvatar={false}
              textAlign="center"
              containerStyle={styles.startButtonContainer}
              textStyle={styles.startButtonText}
            />
          </TouchableOpacity>
        </View>
        
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
      </ScrollView>
      
      <BottomTabBar />
    </View>
  );
}

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 10,
    height: 60,
    borderBottomWidth: 0,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  flexSpace: {
    width: 40,
  },
  settingsButton: {
    padding: 8,
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  profileInfoContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  avatarSection: {
    flex: 1,
  },
  profileData: {
    flex: 1,
    justifyContent: 'space-between',
  },
  balanceContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  usernameContainer: {
    alignItems: 'center',
  },
  usernameTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  dodjeOneContainer: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  dodjeOneBox: {
    backgroundColor: 'rgba(255, 255, 0, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  freeTrialBanner: {
    marginTop: -8,
    paddingVertical: 8,
  },
  freeTrialText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  startButton: {
    marginTop: 8,
  },
  startButtonContainer: {
    backgroundColor: '#9BEC00',
    borderRadius: 24,
    paddingVertical: 12,
  },
  startButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  achievementsContainer: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  progressContainer: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  questsContainer: {
    marginVertical: 10,
    paddingBottom: 80,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingTextContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  }
}); 