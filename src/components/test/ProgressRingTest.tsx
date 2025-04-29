import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import Slider from '@react-native-community/slider';
import { ProgressRing } from '../ui/vectors/ProgressRing';
import { PastilleParcoursDefault } from '../PastilleParcoursDefault';

/**
 * Composant de test pour visualiser les anneaux de progression avec différentes valeurs
 */
export const ProgressRingTest: React.FC = () => {
  const [totalSegments, setTotalSegments] = useState(5);
  const [completedSegments, setCompletedSegments] = useState(2);
  const [size, setSize] = useState(100);
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Test des anneaux de progression</Text>
      
      <View style={styles.controlsContainer}>
        <Text style={styles.label}>Nombre total de vidéos: {totalSegments}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={20}
          step={1}
          value={totalSegments}
          onValueChange={setTotalSegments}
        />
        
        <Text style={styles.label}>Vidéos complétées: {completedSegments}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={totalSegments}
          step={1}
          value={Math.min(completedSegments, totalSegments)}
          onValueChange={setCompletedSegments}
        />
        
        <Text style={styles.label}>Taille: {size}px</Text>
        <Slider
          style={styles.slider}
          minimumValue={60}
          maximumValue={200}
          step={10}
          value={size}
          onValueChange={setSize}
        />
      </View>
      
      <View style={styles.ringContainer}>
        {/* Anneau avec pastille */}
        <View style={styles.ringWrapper}>
          <ProgressRing
            size={size}
            totalSegments={totalSegments}
            completedSegments={completedSegments}
            completedColor="#06D001"
            incompleteColor="#F3FF90"
          />
          <View style={[styles.pastilleContainer, { width: size * 0.8, height: size * 0.8 }]}>
            <PastilleParcoursDefault style={{ width: '100%', height: '100%' }} />
          </View>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Exemples avec différents nombres de vidéos</Text>
      
      <View style={styles.examplesContainer}>
        {[1, 2, 3, 5, 7, 10, 15, 20].map(segments => (
          <View key={segments} style={styles.exampleItem}>
            <Text style={styles.exampleLabel}>{segments} vidéo{segments > 1 ? 's' : ''}</Text>
            <View style={styles.exampleRing}>
              <ProgressRing
                size={80}
                totalSegments={segments}
                completedSegments={Math.floor(segments / 2)}
                completedColor="#06D001"
                incompleteColor="#F3FF90"
              />
              <View style={[styles.pastilleContainer, { width: 64, height: 64 }]}>
                <PastilleParcoursDefault style={{ width: '100%', height: '100%' }} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1A1A1A',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  controlsContainer: {
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 16,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  ringWrapper: {
    position: 'relative',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastilleContainer: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 16,
  },
  examplesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  exampleItem: {
    width: '48%',
    marginBottom: 24,
    alignItems: 'center',
  },
  exampleLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  exampleRing: {
    position: 'relative',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProgressRingTest; 