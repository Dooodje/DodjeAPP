import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Parcours } from '../../types/firebase';
import CourseCard from './CourseCard';

interface CourseGridProps {
  parcours: Parcours[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  refreshing: boolean;
}

const CourseGrid: React.FC<CourseGridProps> = ({
  parcours,
  loading,
  error,
  onRefresh,
  refreshing,
}) => {
  // Vérifier que parcours est défini et est bien un tableau
  const safeParcours = Array.isArray(parcours) ? parcours : [];

  // Rendu du message d'erreur
  if (error && !loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Rendu du loader initial
  if (loading && !refreshing && safeParcours.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#059212" />
      </View>
    );
  }

  // Rendu du message "Aucun résultat"
  if (!loading && safeParcours.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noResultsText}>Aucun parcours trouvé</Text>
      </View>
    );
  }

  // Filtrer les parcours valides
  const validParcours = safeParcours.filter(
    item => item && typeof item === 'object' && 'id' in item
  );

  // Rendu de la grille de parcours
  return (
    <FlatList
      data={validParcours}
      keyExtractor={(item) => item.id || Math.random().toString()}
      renderItem={({ item }) => <CourseCard parcours={item} />}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontFamily: 'Arboria-Medium',
    fontSize: 16,
    color: '#F3FF90',
    textAlign: 'center',
  },
  noResultsText: {
    fontFamily: 'Arboria-Medium',
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
  },
});

export default CourseGrid; 