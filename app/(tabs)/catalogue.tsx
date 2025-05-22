import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Text, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SearchBar from '../../src/components/catalogue/SearchBar';
import FeaturedBanner from '../../src/components/catalogue/FeaturedBanner';
import FilterBar from '../../src/components/catalogue/FilterBar';
import CatalogueSection from '../../src/components/catalogue/CatalogueSection';
import CourseGrid from '../../src/components/catalogue/CourseGrid';
import { AnnexeHeader } from '../../src/components/ui/AnnexeHeader';
import { useCatalogue } from '../../src/hooks/useCatalogue';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';

const { width: screenWidth } = Dimensions.get('window');

export default function CataloguePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
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

  const [activeFilter, setActiveFilter] = useState<'bourse' | 'crypto' | null>(null);
  const [activeLevelFilter, setActiveLevelFilter] = useState<'debutant' | 'avance' | 'expert' | null>(null);
  const [showLevelFilters, setShowLevelFilters] = useState(false);

  // Utiliser un useEffect avec un délai pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 500); // Délai de 500ms

    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshCatalogue();
    setRefreshing(false);
  };

  const handleSearchChange = (text: string) => {
    setLocalSearchQuery(text);
  };

  const handleSearchClear = () => {
    setLocalSearchQuery('');
    setSearchQuery('');
  };

  const handleCoursePress = (parcoursId: string) => {
    router.push(`/course/${parcoursId}?from=catalogue`);
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleSeeAllPress = () => {
    // Implémenter la navigation vers la vue complète
    console.log('Voir tout pressed');
  };

  const handleFilterPress = (filter: 'bourse' | 'crypto') => {
    if (activeFilter === filter) {
      setActiveFilter(null);
      setThemeFilter('all');
    } else {
      setActiveFilter(filter);
      setThemeFilter(filter);
    }
  };

  const handleLevelFilterPress = (level: 'debutant' | 'avance' | 'expert' | null) => {
    if (activeLevelFilter === level) {
      setActiveLevelFilter(null);
      setLevelFilter('all');
    } else {
      setActiveLevelFilter(level);
      setLevelFilter(level || 'all');
    }
    setShowLevelFilters(false);
  };

  const handleLevelExpandPress = () => {
    if (activeLevelFilter) {
      // Si un niveau est déjà sélectionné, on réinitialise tout
      setActiveLevelFilter(null);
      setLevelFilter('all');
      setShowLevelFilters(false);
    } else {
      // Sinon, on affiche/masque la liste des niveaux
      setShowLevelFilters(!showLevelFilters);
    }
  };

  return (
    <View style={styles.container}>
      {!isSearchActive && (
        <AnnexeHeader
          title="Catalogue"
          points={user?.dodji || 0}
          showBackButton={false}
        />
      )}
      
      {isSearchActive ? (
        // Mode recherche
        <View style={styles.searchModeContainer}>
          <View style={styles.searchHeaderContainer}>
            <View style={[styles.searchBarContainer, styles.searchBarActive]}>
              <SearchBar
                value={localSearchQuery}
                onChangeText={handleSearchChange}
                onClear={handleSearchClear}
                placeholder="Tapez votre recherche..."
              />
            </View>
          </View>
          
          <View style={styles.searchResultsContainer}>
            <CourseGrid
              parcours={parcours}
              loading={loading}
              error={error}
              onRefresh={handleRefresh}
              refreshing={refreshing}
            />
          </View>
        </View>
      ) : (
        // Mode normal
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Search bar */}
          <View style={styles.searchBarContainer}>
            <SearchBar
              value={localSearchQuery}
              onChangeText={handleSearchChange}
              onClear={handleSearchClear}
              placeholder="Tapez votre recherche..."
            />
          </View>
          
          {/* Theme Filter Buttons */}
          <View style={styles.themeFilterContainer}>
            {(!activeFilter || activeFilter === 'bourse') && (
              <TouchableOpacity 
                style={[
                  styles.themeButton, 
                  activeFilter === 'bourse' && styles.activeThemeButton
                ]}
                onPress={() => handleFilterPress('bourse')}
              >
                <Text style={[
                  styles.themeButtonText,
                  activeFilter === 'bourse' && styles.activeThemeButtonText
                ]}>
                  {activeFilter === 'bourse' ? '✕ Bourse' : 'Bourse'}
                </Text>
              </TouchableOpacity>
            )}
            
            {(!activeFilter || activeFilter === 'crypto') && (
              <TouchableOpacity 
                style={[
                  styles.themeButton, 
                  activeFilter === 'crypto' && styles.activeThemeButton
                ]}
                onPress={() => handleFilterPress('crypto')}
              >
                <Text style={[
                  styles.themeButtonText,
                  activeFilter === 'crypto' && styles.activeThemeButtonText
                ]}>
                  {activeFilter === 'crypto' ? '✕ Crypto' : 'Crypto'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Level Filter Button */}
            <View>
              <TouchableOpacity 
                style={[
                  styles.themeButton,
                  (showLevelFilters || activeLevelFilter) && styles.activeThemeButton
                ]}
                onPress={handleLevelExpandPress}
              >
                <View style={styles.levelButtonContent}>
                  <Text style={[
                    styles.themeButtonText,
                    (showLevelFilters || activeLevelFilter) && styles.activeThemeButtonText
                  ]}>
                    {activeLevelFilter ? `✕ ${activeLevelFilter === 'debutant' ? 'Débutant' : activeLevelFilter === 'avance' ? 'Avancé' : 'Expert'}` : 'Niveau'}
                  </Text>
                  {!activeLevelFilter && (
                    <Ionicons 
                      name={showLevelFilters ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color={(showLevelFilters || activeLevelFilter) ? "#000000" : "#FFFFFF"} 
                      style={styles.levelIcon}
                    />
                  )}
                </View>
              </TouchableOpacity>

              {showLevelFilters && (
                <View style={styles.levelFiltersContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.themeButton,
                      activeLevelFilter === 'debutant' && styles.activeThemeButton
                    ]}
                    onPress={() => handleLevelFilterPress('debutant')}
                  >
                    <Text style={[
                      styles.themeButtonText,
                      activeLevelFilter === 'debutant' && styles.activeThemeButtonText
                    ]}>
                      {activeLevelFilter === 'debutant' ? '✕ Débutant' : 'Débutant'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.themeButton,
                      activeLevelFilter === 'avance' && styles.activeThemeButton
                    ]}
                    onPress={() => handleLevelFilterPress('avance')}
                  >
                    <Text style={[
                      styles.themeButtonText,
                      activeLevelFilter === 'avance' && styles.activeThemeButtonText
                    ]}>
                      {activeLevelFilter === 'avance' ? '✕ Avancé' : 'Avancé'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.themeButton,
                      activeLevelFilter === 'expert' && styles.activeThemeButton
                    ]}
                    onPress={() => handleLevelFilterPress('expert')}
                  >
                    <Text style={[
                      styles.themeButtonText,
                      activeLevelFilter === 'expert' && styles.activeThemeButtonText
                    ]}>
                      {activeLevelFilter === 'expert' ? '✕ Expert' : 'Expert'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          
          {/* Featured Carousel - Ne montrer que les parcours du thème sélectionné */}
          <View style={styles.featuredCarouselContainer}>
            <ScrollView 
              horizontal 
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
              onScroll={(event) => {
                const slideSize = screenWidth - 32;
                const x = event.nativeEvent.contentOffset.x;
                const newSlide = Math.round(x / slideSize);
                if (newSlide !== activeSlide) {
                  setActiveSlide(newSlide);
                }
              }}
              scrollEventThrottle={16}
            >
              {(activeFilter === 'bourse' 
                ? organizedData.byTheme.bourse 
                : activeFilter === 'crypto'
                ? organizedData.byTheme.crypto
                : organizedData.recent
              ).slice(0, 3).map((parcours, index) => (
                <View key={parcours.id} style={styles.carouselItem}>
                  <TouchableOpacity 
                    style={styles.carouselTouchable}
                    onPress={() => handleCoursePress(parcours.id)}
                  >
                    <ImageBackground
                      source={{ uri: parcours.thumbnail || parcours.imageUrl }}
                      style={styles.carouselImage}
                      imageStyle={styles.carouselImageStyle}
                    >
                      <View style={styles.carouselContent}>
                        <Text style={styles.carouselTitle}>
                          {parcours.titre || parcours.title}
                        </Text>
                        <View style={styles.carouselInfoRow}>
                          <View style={styles.courseMetaInfo}>
                            <Text style={styles.carouselDomain}>
                              {parcours.domaine}
                            </Text>
                            <Text style={styles.carouselDot}>•</Text>
                            <Text style={styles.carouselLevel}>
                              {parcours.niveau || (
                                parcours.level === 'debutant'
                                  ? 'Niveau débutant'
                                  : parcours.level === 'avance'
                                  ? 'Niveau avancé'
                                  : 'Niveau expert'
                              )}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            {/* Dots indicator */}
            <View style={styles.dotsContainer}>
              {(activeFilter === 'bourse' 
                ? organizedData.byTheme.bourse 
                : activeFilter === 'crypto'
                ? organizedData.byTheme.crypto
                : organizedData.recent
              ).slice(0, 3).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === activeSlide && styles.activeDot
                  ]}
                />
              ))}
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* "Ça peut te plaire" section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Ça peut te plaire</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {(activeFilter === 'bourse' 
                ? organizedData.byTheme.bourse 
                : activeFilter === 'crypto'
                ? organizedData.byTheme.crypto
                : organizedData.recent
              ).slice(0, 5).map((parcours) => (
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
                        <View style={styles.courseMetaInfo}>
                          <Text style={styles.courseDomain}>
                            {parcours.domaine}
                          </Text>
                          <Text style={styles.courseDot}>•</Text>
                          <Text style={styles.courseLevel}>
                            {parcours.niveau || (
                              parcours.level === 'debutant'
                                ? 'Niveau débutant'
                                : parcours.level === 'avance'
                                ? 'Niveau avancé'
                                : 'Niveau expert'
                            )}
                          </Text>
                        </View>
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
              {(activeFilter === 'bourse' 
                ? organizedData.byTheme.bourse 
                : activeFilter === 'crypto'
                ? organizedData.byTheme.crypto
                : organizedData.recent
              ).slice(0, 5).map((parcours) => (
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
                        <View style={styles.courseMetaInfo}>
                          <Text style={styles.courseDomain}>
                            {parcours.domaine}
                          </Text>
                          <Text style={styles.courseDot}>•</Text>
                          <Text style={styles.courseLevel}>
                            {parcours.niveau || (
                              parcours.level === 'debutant'
                                ? 'Niveau débutant'
                                : parcours.level === 'avance'
                                ? 'Niveau avancé'
                                : 'Niveau expert'
                            )}
                          </Text>
                        </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  scrollView: {
    flex: 1,
    marginTop: 80,
  },
  searchBarContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 80,
    marginBottom: 12,
  },
  themeFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 10,
  },
  themeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeThemeButton: {
    backgroundColor: '#9BEC00',
  },
  themeButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Arboria-Bold',
    fontSize: 16,
  },
  activeThemeButtonText: {
    color: '#000000',
  },
  featuredCarouselContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  carousel: {
    width: '100%',
  },
  carouselItem: {
    width: screenWidth - 32, // 16px padding on each side
    height: 200,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselImageStyle: {
    borderRadius: 12,
  },
  carouselTouchable: {
    flex: 1,
    width: '100%',
  },
  carouselContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  carouselTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Arboria-Bold',
    marginBottom: 12,
  },
  carouselInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  courseMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carouselDomain: {
    color: '#9BEC00',
    fontSize: 14,
    fontFamily: 'Arboria-Medium',
  },
  courseDomain: {
    color: '#9BEC00',
    fontFamily: 'Arboria-Book',
    fontSize: 13,
  },
  carouselDot: {
    color: '#FFFFFF',
    fontSize: 14,
    marginHorizontal: 8,
    opacity: 0.5,
  },
  courseDot: {
    color: '#FFFFFF',
    fontSize: 12,
    marginHorizontal: 6,
    opacity: 0.5,
  },
  carouselLevel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Arboria-Medium',
  },
  lectureButton: {
    backgroundColor: '#9BEC00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  lectureButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Arboria-Bold',
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#9BEC00',
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
    width: 200,
    height: 140,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  courseCardContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
  },
  courseTitle: {
    color: '#FFF',
    fontFamily: 'Arboria-Medium',
    fontSize: 16,
    marginBottom: 4,
  },
  courseLevel: {
    color: '#AAA',
    fontFamily: 'Arboria-Book',
    fontSize: 13,
  },
  bottomSpace: {
    height: 80,
  },
  courseInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchModeContainer: {
    flex: 1,
    marginTop: 0,
  },
  searchHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 50,
  },
  searchBarActive: {
    marginTop: 0,
    flex: 1,
  },
  searchResultsContainer: {
    flex: 1,
    marginTop: 0,
  },
  levelFiltersContainer: {
    marginTop: 10,
    gap: 10,
  },
  levelButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelIcon: {
    marginLeft: 5,
  },
}); 