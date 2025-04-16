import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Parcours } from '../../types/firebase';
import HorizontalCourseCard from './HorizontalCourseCard';

interface CatalogueSectionProps {
  title: string;
  parcours: Parcours[];
  onSeeAllPress?: () => void;
  onCoursePress: (parcoursId: string) => void;
}

const CatalogueSection: React.FC<CatalogueSectionProps> = ({
  title,
  parcours,
  onSeeAllPress,
  onCoursePress,
}) => {
  // Vérifier que parcours est défini et est bien un tableau
  const safeParcours = Array.isArray(parcours) ? parcours : [];

  if (safeParcours.length === 0) {
    return null;
  }

  const renderCourseItem = ({ item }: { item: Parcours }) => (
    <HorizontalCourseCard 
      parcours={item} 
      onPress={() => onCoursePress(item.id)} 
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAllPress && (
          <TouchableOpacity onPress={onSeeAllPress}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        horizontal
        data={safeParcours}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={176} // Card width (160) + horizontal margin (8*2)
        decelerationRate="fast"
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Arboria-Bold',
    fontSize: 18,
    color: '#FFF',
  },
  seeAllText: {
    fontFamily: 'Arboria-Medium',
    fontSize: 14,
    color: '#06D001',
  },
  list: {
    paddingRight: 20,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 4,
    paddingRight: 16,
  },
});

export default CatalogueSection; 