import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import FondCo from '../FondCo';

interface DodjeOneBannerProps {
  onPress: () => void;
}

export const DodjeOneBanner: React.FC<DodjeOneBannerProps> = ({ onPress }) => {
  const screenWidth = Dimensions.get('window').width;
  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <FondCo width={screenWidth} height={screenWidth} />
        <View style={styles.content}>
          <View style={styles.trialBadge}>
            <Text style={styles.trialText}>Essai sans frais unique 7 jours</Text>
          </View>
          <Text style={styles.title}>DODJE ONE</Text>
          <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>C'est parti !</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  background: {
    width: '100%',
    height: 140,
    backgroundColor: '#F3FF90',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
    position: 'relative',
    gap: 8,
  },
  trialBadge: {
    backgroundColor: '#0A0400',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  trialText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Arboria-Medium',
  },
  title: {
    color: '#0A0400',
    fontSize: 20,
    fontFamily: 'Arboria-Bold',
  },
  button: {
    backgroundColor: '#9BEC00',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 50,
    width: 196,
    height: 33,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Arboria-Bold',
  },
});

export default DodjeOneBanner; 