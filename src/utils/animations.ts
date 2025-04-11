import { Animated } from 'react-native';

export const fadeIn = (value: Animated.Value) => {
  Animated.timing(value, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }).start();
};

export const fadeOut = (value: Animated.Value) => {
  Animated.timing(value, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  }).start();
};

export const slideInRight = (value: Animated.Value) => {
  Animated.spring(value, {
    toValue: 1,
    useNativeDriver: true,
  }).start();
};

export const slideOutLeft = (value: Animated.Value) => {
  Animated.spring(value, {
    toValue: 0,
    useNativeDriver: true,
  }).start();
};

export const scaleIn = (value: Animated.Value) => {
  Animated.spring(value, {
    toValue: 1,
    useNativeDriver: true,
  }).start();
};

export const scaleOut = (value: Animated.Value) => {
  Animated.spring(value, {
    toValue: 0,
    useNativeDriver: true,
  }).start();
};

export const rotateIn = (value: Animated.Value) => {
  Animated.spring(value, {
    toValue: 1,
    useNativeDriver: true,
  }).start();
};

export const rotateOut = (value: Animated.Value) => {
  Animated.spring(value, {
    toValue: 0,
    useNativeDriver: true,
  }).start();
}; 