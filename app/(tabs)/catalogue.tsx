import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchBar from '../../src/components/catalogue/SearchBar';
import FilterBar from '../../src/components/catalogue/FilterBar';
import CourseGrid from '../../src/components/catalogue/CourseGrid';
import { useCatalogue } from '../../src/hooks/useCatalogue';
import { GlobalHeader } from '../../src/components/ui/GlobalHeader';
import { useRouter } from 'expo-router';

export default function CataloguePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    parcours,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    themeFilter,
    setThemeFilter,
    levelFilter,
    setLevelFilter,
    refreshCatalogue,
  } = useCatalogue();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshCatalogue();
    setRefreshing(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
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
          
          {/* Filtres */}
          <FilterBar
            currentTheme={themeFilter}
            currentLevel={levelFilter}
            onThemeChange={setThemeFilter}
            onLevelChange={setLevelFilter}
          />
          
          {/* Grille de parcours */}
          <View style={styles.gridContainer}>
            <CourseGrid
              parcours={parcours}
              loading={loading}
              error={error}
              onRefresh={handleRefresh}
              refreshing={refreshing}
            />
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
  gridContainer: {
    flex: 1,
  },
}); 