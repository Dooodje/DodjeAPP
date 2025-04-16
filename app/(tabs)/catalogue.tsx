import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SearchBar from '../../src/components/catalogue/SearchBar';
import FeaturedBanner from '../../src/components/catalogue/FeaturedBanner';
import FilterBar from '../../src/components/catalogue/FilterBar';
import CatalogueSection from '../../src/components/catalogue/CatalogueSection';
import CourseGrid from '../../src/components/catalogue/CourseGrid';
import { GlobalHeader } from '../../src/components/ui/GlobalHeader';
import { useCatalogue } from '../../src/hooks/useCatalogue';

export default function CataloguePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    parcours,
    organizedData,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    themeFilter,
    setThemeFilter,
    levelFilter,
    setLevelFilter,
    refreshCatalogue,
    isSearchActive
  } = useCatalogue();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshCatalogue();
    setRefreshing(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleCoursePress = (parcoursId: string) => {
    router.push(`/course/${parcoursId}`);
  };

  // Fonction pour afficher le contenu principal (Netflix-style)
  const renderNetflixContent = () => {
    if (loading && !refreshing) {
      return null; // Laissons la grille gérer l'état de chargement
    }

    return (
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Parcours en vedette (hero banner) */}
        {organizedData.featured && (
          <FeaturedBanner 
            parcours={organizedData.featured} 
            onPress={handleCoursePress} 
          />
        )}
        
        {/* Parcours Récents */}
        {organizedData.recent.length > 0 && (
          <CatalogueSection
            title="Ajoutés récemment"
            parcours={organizedData.recent}
            onCoursePress={handleCoursePress}
          />
        )}
        
        {/* Thème Bourse */}
        {organizedData.byTheme.bourse.length > 0 && (
          <CatalogueSection
            title="Parcours Bourse"
            parcours={organizedData.byTheme.bourse}
            onCoursePress={handleCoursePress}
          />
        )}
        
        {/* Thème Crypto */}
        {organizedData.byTheme.crypto.length > 0 && (
          <CatalogueSection
            title="Parcours Crypto"
            parcours={organizedData.byTheme.crypto}
            onCoursePress={handleCoursePress}
          />
        )}
        
        {/* Parcours Débutant */}
        {organizedData.byLevel.debutant.length > 0 && (
          <CatalogueSection
            title="Pour les débutants"
            parcours={organizedData.byLevel.debutant}
            onCoursePress={handleCoursePress}
          />
        )}

        {/* Parcours Avancé */}
        {organizedData.byLevel.avance.length > 0 && (
          <CatalogueSection
            title="Niveau avancé"
            parcours={organizedData.byLevel.avance}
            onCoursePress={handleCoursePress}
          />
        )}
        
        {/* Parcours Expert */}
        {organizedData.byLevel.expert.length > 0 && (
          <CatalogueSection
            title="Pour les experts"
            parcours={organizedData.byLevel.expert}
            onCoursePress={handleCoursePress}
          />
        )}
        
        {/* Ajouter un espace vide en bas pour assurer que la dernière section est entièrement visible */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <GlobalHeader
        title="CATALOGUE"
        showBackButton={false}
      />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0400" />
        
        <View style={[styles.content, { paddingTop: insets.top > 0 ? 0 : 10 }]}>
          {/* Barre de recherche */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={handleClearSearch}
          />
          
          {/* Filtres (visibles uniquement en mode recherche) */}
          {isSearchActive && (
            <FilterBar
              currentTheme={themeFilter}
              currentLevel={levelFilter}
              onThemeChange={setThemeFilter}
              onLevelChange={setLevelFilter}
            />
          )}
          
          {/* Contenu principal */}
          <View style={styles.mainContent}>
            {isSearchActive ? (
              // Affichage des résultats de recherche en grille
              <CourseGrid
                parcours={parcours}
                loading={loading}
                error={error}
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />
            ) : (
              // Affichage Netflix-style
              renderNetflixContent()
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  content: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  bottomSpace: {
    height: 40,
  },
}); 