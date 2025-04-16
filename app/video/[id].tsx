import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, Text } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { VideoPlayer } from '../../src/components/video/VideoPlayer';
import { useAuth } from '../../src/hooks/useAuth';
import { useVideo } from '../../src/hooks/useVideo';

export default function VideoPage() {
  const params = useLocalSearchParams<{ id: string }>();
  const { id } = params;
  const { user } = useAuth();
  const router = useRouter();

  console.log('📺 VideoPage - Params reçus:', params);
  console.log('📺 VideoPage - ID de la vidéo:', id);
  console.log('📺 VideoPage - Utilisateur:', user?.uid);

  // Rediriger si l'utilisateur n'est pas connecté ou si l'ID n'est pas fourni
  useEffect(() => {
    if (!user) {
      console.log('📺 VideoPage - Utilisateur non connecté, redirection vers login');
      router.replace('/(auth)/login');
      return;
    }
    
    if (!id) {
      console.log('📺 VideoPage - ID manquant, retour à la page précédente');
      router.back();
      return;
    }
    
    console.log('📺 VideoPage - Chargement de la vidéo:', id);
  }, [user, id, router]);

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white' }}>Utilisateur non connecté. Redirection...</Text>
      </View>
    );
  }

  if (!id) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white' }}>ID de vidéo non fourni. Retour...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, statusBarHidden: true }} />
      <StatusBar hidden translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <VideoPlayer videoId={id} userId={user.uid} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
}); 