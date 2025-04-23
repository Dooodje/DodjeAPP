import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PastilleAnnexe from '../PastilleAnnexe';

/**
 * Exemple d'utilisation du composant PastilleAnnexe
 * Ce composant est utilisé pour démontrer l'intégration du composant Figma
 */
const PastilleAnnexeExample: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Composant PastilleAnnexe</Text>
      
      <View style={styles.row}>
        <View style={styles.exampleContainer}>
          <Text style={styles.label}>Taille par défaut (64x64)</Text>
          <PastilleAnnexe />
        </View>
        
        <View style={styles.exampleContainer}>
          <Text style={styles.label}>Taille personnalisée (48x48)</Text>
          <PastilleAnnexe width={48} height={48} />
        </View>
        
        <View style={styles.exampleContainer}>
          <Text style={styles.label}>Grande taille (96x96)</Text>
          <PastilleAnnexe width={96} height={96} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  exampleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default PastilleAnnexeExample; 