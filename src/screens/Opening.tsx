import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LogoDodje } from '../components/LogoDodje';
import FondCo from '../components/FondCo';

const Opening: React.FC = () => {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const handleConnexion = () => {
    router.push('/login');
  };

  const handleInscription = () => {
    router.push('/register');
  };

  return (
    <View style={styles.container}>
      <FondCo width={windowWidth} height={windowHeight} />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <LogoDodje width={200} height={200} />
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.connexionButton]}
            onPress={handleConnexion}
          >
            <Text style={styles.buttonText}>Connexion</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.inscriptionButton]}
            onPress={handleInscription}
          >
            <Text style={[styles.buttonText, styles.inscriptionText]}>Inscription</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  content: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  buttonsContainer: {
    paddingHorizontal: 30,
    gap: 30,
    marginBottom: 50,
  },
  button: {
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connexionButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  inscriptionButton: {
    backgroundColor: '#9BEC00',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Arboria-Medium',
  },
  inscriptionText: {
    color: '#FFFFFF',
  },
});

export default Opening; 