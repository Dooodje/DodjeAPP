import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import theme from '../../config/theme';

type ThemeType = 'bourse' | 'crypto';

interface ThemeSelectorProps {
  selectedTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onThemeChange
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.selectorContainer}>
        <Animated.View 
          style={[
            styles.selectionIndicator, 
            { transform: [{ translateX: selectedTheme === 'bourse' ? 0 : 100 }] }
          ]} 
        />
        <TouchableOpacity
          style={styles.themeButton}
          onPress={() => onThemeChange('bourse')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.themeText,
            selectedTheme === 'bourse' && styles.selectedThemeText
          ]}>
            Bourse
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.themeButton}
          onPress={() => onThemeChange('crypto')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.themeText,
            selectedTheme === 'crypto' && styles.selectedThemeText
          ]}>
            Crypto
          </Text>
        </TouchableOpacity>
      </View>

      {/* Points de sélection */}
      <View style={styles.dotsContainer}>
        {selectedTheme === 'bourse' && (
          <View style={styles.dots}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        )}
        {selectedTheme === 'crypto' && (
          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.activeDot]} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 15,
  },
  selectorContainer: {
    width: 200,
    height: 40,
    flexDirection: 'row',
    backgroundColor: theme.colors.background.light,
    borderRadius: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  selectionIndicator: {
    position: 'absolute',
    width: 100,
    height: 40,
    backgroundColor: theme.colors.primary.main,
    borderRadius: 30,
    zIndex: 1,
  },
  themeButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  themeText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  selectedThemeText: {
    color: theme.colors.text.highlight,
    fontWeight: '700',
  },
  dotsContainer: {
    marginTop: 15,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.text.inactive,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: theme.colors.primary.main,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default ThemeSelector; 