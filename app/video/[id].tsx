import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { VideoPlayer } from '../../src/components/video/VideoPlayer';
import { useAuth } from '../../src/hooks/useAuth';
import { useVideo } from '../../src/hooks/useVideo';
import { LogoLoadingSpinner } from '../../src/components/ui/LogoLoadingSpinner';

const { width, height } = Dimensions.get('screen');

export default function VideoPage() {
  const params = useLocalSearchParams<{ id: string }>();
  const { id } = params;
  const { user } = useAuth();
  const router = useRouter();
  
  // État pour contrôler l'overlay de chargement
  const [isLoadingOverlayVisible, setIsLoadingOverlayVisible] = useState(true);
  
  // Animation pour l'overlay
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

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

  // Overlay de chargement avec animation douce seulement à la fermeture
  useEffect(() => {
    if (user && id) {
      console.log('🎬 Démarrage overlay pour vidéo:', id);
      setIsLoadingOverlayVisible(true);
      
      // Apparition immédiate (pas d'animation)
      overlayOpacity.setValue(1);
      
      const timer = setTimeout(() => {
        console.log('🎬 Début animation de fermeture overlay vidéo');
        
        // Animation de disparition douce seulement
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 500, // 500ms pour une transition douce
          useNativeDriver: true,
        }).start(() => {
          console.log('🎬 Fin overlay vidéo après animation');
          setIsLoadingOverlayVisible(false);
        });
      }, 2000);

      return () => {
        console.log('🎬 Nettoyage timer overlay vidéo');
        clearTimeout(timer);
      };
    }
  }, [user, id, overlayOpacity]); // Se déclenche à chaque changement d'ID

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
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Le VideoPlayer se charge en arrière-plan */}
        <VideoPlayer videoId={id} userId={user.uid} />
        
        {/* Overlay de chargement avec animation */}
        {isLoadingOverlayVisible && (
          <Animated.View style={[styles.loadingOverlay, { opacity: overlayOpacity }]}>
            <LogoLoadingSpinner />
          </Animated.View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0400',
    zIndex: 999999,
  },
}); 