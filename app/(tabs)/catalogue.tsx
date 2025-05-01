import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SearchBar from '../../src/components/catalogue/SearchBar';
import FeaturedBanner from '../../src/components/catalogue/FeaturedBanner';
import FilterBar from '../../src/components/catalogue/FilterBar';
import CatalogueSection from '../../src/components/catalogue/CatalogueSection';
import CourseGrid from '../../src/components/catalogue/CourseGrid';
import { GlobalHeader } from '../../src/components/ui/GlobalHeader';
import { useCatalogue } from '../../src/hooks/useCatalogue';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';

export default function CataloguePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  
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

  const handleBackPress = () => {
    router.back();
  };

  // Helper function to get video count text
  const getVideoCountText = (count?: number) => {
    if (count === undefined || count === null) return "0 vidéo";
    return count === 1 ? "1 vidéo" : `${count} vidéos`;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, { paddingTop: insets.top > 0 ? 0 : 10 }]}>
          {/* Header avec GlobalHeader */}
          <GlobalHeader
            title="Catalogue"
            points={user?.dodji || 0}
            showBackButton={false}
          />
          
          {/* Search bar */}
          <View style={styles.searchBarContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={handleClearSearch}
              placeholder="Tapez votre recherche..."
            />
          </View>
          
          {/* Theme Filter Buttons */}
          <View style={styles.themeFilterContainer}>
            <TouchableOpacity 
              style={[
                styles.themeButton, 
                themeFilter === 'bourse' && styles.activeThemeButton
              ]}
              onPress={() => setThemeFilter('bourse')}
            >
              <Text style={styles.themeButtonText}>Bourse</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.themeButton, 
                themeFilter === 'crypto' && styles.activeThemeButton
              ]}
              onPress={() => setThemeFilter('crypto')}
            >
              <Text style={styles.themeButtonText}>Crypto</Text>
            </TouchableOpacity>
          </View>
          
          {isSearchActive ? (
            // Search results grid
            <CourseGrid
              parcours={parcours}
              loading={loading}
              error={error}
              onRefresh={handleRefresh}
              refreshing={refreshing}
            />
          ) : (
            // Main content
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
              {/* Featured Banner */}
              {organizedData.featured && (
                <View style={styles.featuredContainer}>
                  <FeaturedBanner 
                    parcours={organizedData.featured} 
                    onPress={handleCoursePress} 
                  />
                  <TouchableOpacity 
                    style={styles.lectureButton} 
                    onPress={() => organizedData.featured && handleCoursePress(organizedData.featured.id)}
                  >
                    <Text style={styles.lectureButtonText}>Lecture</Text>
                    <Ionicons name="play" size={16} color="#000" />
                  </TouchableOpacity>
                </View>
              )}
              
              <View style={styles.divider} />
              
              {/* "Ça peut te plaire" section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Ça peut te plaire</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {organizedData.recent.slice(0, 5).map((parcours) => (
                    <TouchableOpacity 
                      key={parcours.id} 
                      style={styles.courseCard}
                      onPress={() => handleCoursePress(parcours.id)}
                    >
                      <ImageBackground 
                        source={{ uri: parcours.thumbnail || parcours.imageUrl }} 
                        style={styles.cardBackground}
                        resizeMode="cover"
                      >
                        <View style={styles.courseCardContent}>
                          <Text style={styles.courseTitle}>{parcours.titre || parcours.title || "Titre du parcours"}</Text>
                          <View style={styles.courseInfoRow}>
                            <Text style={styles.courseLevel}>
                              {parcours.level === 'debutant' 
                                ? 'Niveau débutant' 
                                : parcours.level === 'avance'
                                  ? 'Niveau avancé'
                                  : 'Niveau expert'}
                            </Text>
                            <Text style={styles.videoCount}>{getVideoCountText(parcours.videoCount)}</Text>
                          </View>
                        </View>
                      </ImageBackground>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* "Les indispensables" section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Les indispensables</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {organizedData.byTheme.bourse.slice(0, 5).map((parcours) => (
                    <TouchableOpacity 
                      key={parcours.id} 
                      style={styles.courseCard}
                      onPress={() => handleCoursePress(parcours.id)}
                    >
                      <ImageBackground 
                        source={{ uri: parcours.thumbnail || parcours.imageUrl }} 
                        style={styles.cardBackground}
                        resizeMode="cover"
                      >
                        <View style={styles.courseCardContent}>
                          <Text style={styles.courseTitle}>{parcours.titre || parcours.title || "Titre du parcours"}</Text>
                          <View style={styles.courseInfoRow}>
                            <Text style={styles.courseLevel}>
                              Niveau {parcours.level === 'debutant' 
                                ? 'débutant' 
                                : parcours.level === 'avance'
                                  ? 'avancé'
                                  : 'expert'}
                            </Text>
                            <Text style={styles.videoCount}>{getVideoCountText(parcours.videoCount)}</Text>
                          </View>
                        </View>
                      </ImageBackground>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.bottomSpace} />
            </ScrollView>
          )}
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
  headerContainer: {
    width: '100%',
  },
  searchBarContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 70,
    marginBottom: 12,
  },
  themeFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  themeButton: {
    backgroundColor: '#9BEC00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
  },
  activeThemeButton: {
    backgroundColor: '#9BEC00',
  },
  themeButtonText: {
    color: '#000',
    fontFamily: 'Arboria-Medium',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  featuredContainer: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    backgroundColor: '#333', // Placeholder color
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  lectureButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#9BEC00',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lectureButtonText: {
    color: '#000',
    fontFamily: 'Arboria-Bold',
    fontSize: 16,
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
    marginVertical: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontFamily: 'Arboria-Bold',
    fontSize: 20,
    marginLeft: 16,
    marginBottom: 16,
  },
  horizontalScroll: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  courseCard: {
    width: 150,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  courseCardContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
  },
  courseTitle: {
    color: '#FFF',
    fontFamily: 'Arboria-Medium',
    fontSize: 14,
    marginBottom: 2,
  },
  courseLevel: {
    color: '#AAA',
    fontFamily: 'Arboria-Book',
    fontSize: 12,
  },
  bottomSpace: {
    height: 80,
  },
  courseInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoCount: {
    color: '#9BEC00',
    fontFamily: 'Arboria-Book',
    fontSize: 11,
  },
}); 