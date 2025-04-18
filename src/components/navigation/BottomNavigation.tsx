import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Types pour les écrans
type ScreenName = 'home' | 'courses' | 'shop' | 'profile';

// Props du composant
interface BottomNavigationProps {
  currentScreen: ScreenName;
  onScreenChange: (screenName: ScreenName) => void;
}

/**
 * Barre de navigation inférieure basée sur le design Figma
 */
const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentScreen,
  onScreenChange
}) => {
  // Rendu du composant
  return (
    <View style={styles.container}>
      {/* Fond avec dégradé */}
      <LinearGradient
        colors={['rgba(10, 4, 0, 1)', 'rgba(0, 0, 0, 0)']}
        style={styles.gradientBackground}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      
      {/* Rectangle arrondi semi-transparent */}
      <View style={styles.menuBackground} />
      
      {/* Contenu de la barre de navigation */}
      <View style={styles.content}>
        <TabButton
          name="home"
          label="Accueil"
          iconSource={require('../../../assets/figma/icon_home.svg')}
          isActive={currentScreen === 'home'}
          onPress={() => onScreenChange('home')}
        />
        
        <TabButton
          name="courses"
          label="Catalogue"
          iconSource={require('../../../assets/figma/icon_learn.svg')}
          isActive={currentScreen === 'courses'}
          onPress={() => onScreenChange('courses')}
        />
        
        <TabButton
          name="shop"
          label="Boutique"
          iconSource={require('../../../assets/figma/icon_shop.svg')}
          isActive={currentScreen === 'shop'}
          onPress={() => onScreenChange('shop')}
        />
        
        <TabButton
          name="profile"
          label="Profil"
          iconSource={require('../../../assets/figma/icon_profile.svg')}
          isActive={currentScreen === 'profile'}
          onPress={() => onScreenChange('profile')}
        />
      </View>
    </View>
  );
};

// Props du bouton de navigation
interface TabButtonProps {
  name: ScreenName;
  label: string;
  iconSource: any;
  isActive: boolean;
  onPress: () => void;
}

/**
 * Bouton individuel de la barre de navigation
 */
const TabButton: React.FC<TabButtonProps> = ({
  name,
  label,
  iconSource,
  isActive,
  onPress
}) => {
  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        isActive && styles.activeIconContainer
      ]}>
        <Image
          source={iconSource}
          style={{
            width: 24,
            height: 24,
            tintColor: isActive ? '#06D001' : '#FFFFFF'
          }}
          resizeMode="contain"
        />
      </View>
      <Text
        style={[
          styles.tabLabel,
          isActive && styles.activeTabLabel
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Styles du composant
const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    height: 90,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  menuBackground: {
    position: 'absolute',
    top: 10,
    width: '95%',
    height: '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 25,
    paddingTop: 15,
    paddingBottom: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(6, 208, 1, 0.1)',
  },
  tabLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
    fontWeight: '400',
  },
  activeTabLabel: {
    color: '#06D001',
    fontWeight: '700',
  },
});

export default BottomNavigation; 