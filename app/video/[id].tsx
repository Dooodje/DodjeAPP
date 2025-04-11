import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { VideoPlayer } from '../../src/components/video/VideoPlayer';
import { useAuth } from '../../src/hooks/useAuth';
import { useVideo } from '../../src/hooks/useVideo';

export default function VideoPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  // Rediriger si l'utilisateur n'est pas connecté ou si l'ID n'est pas fourni
  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    }
    if (!id) {
      router.back();
    }
  }, [user, id, router]);

  if (!user || !id) {
    return null;
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