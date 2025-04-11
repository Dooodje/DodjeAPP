import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfile } from '../../hooks/useProfile';
import { ProfileLayout } from '../../components/profile/ProfileLayout';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import MediaError from '../../components/ui/MediaError';
import { auth } from '../../config/firebase';

function Profile() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  
  // Récupérer l'ID de l'utilisateur actuellement connecté
  useEffect(() => {
    const getCurrentUser = () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
      }
    };
    
    getCurrentUser();
    
    // Écouter les changements d'authentification
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // Rediriger vers la page de connexion si non connecté
        router.replace('/(auth)/login');
      }
    });
    
    return () => unsubscribe();
  }, [router]);
  
  // Si userId n'est pas encore défini, afficher un loader
  if (!userId) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }
  
  // Utiliser le hook useProfile avec l'ID utilisateur récupéré
  const {
    profile,
    isLoading,
    error,
    updateUserProfile,
    selectUserBadge,
    selectUserQuest,
  } = useProfile(userId);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.container}>
        <MediaError
          message="Une erreur est survenue lors du chargement du profil"
          onRetry={() => window.location.reload()}
        />
      </View>
    );
  }

  const handleEditProfile = () => {
    router.push("/(settings)");
  };

  const handleSettingsPress = () => {
    router.push("/(settings)");
  };

  return (
    <ProfileLayout
      profile={profile}
      onEditProfile={handleEditProfile}
      onSettingsPress={handleSettingsPress}
      onBadgePress={selectUserBadge}
      onQuestPress={selectUserQuest}
    />
  );
}

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 