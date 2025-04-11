/**
 * Polyfills et adaptations pour la compatibilité web
 * Ce fichier contient des polyfills et des adaptations pour les APIs qui ne sont pas disponibles sur le web
 */

import { Platform } from 'react-native';

/**
 * Polyfill pour les animations basées sur la performance
 */
export const setupPerformancePolyfill = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (!window.performance) {
      (window as any).performance = {};
    }

    if (!window.performance.now) {
      let nowOffset = Date.now();
      window.performance.now = function now() {
        return Date.now() - nowOffset;
      };
    }
  }
};

/**
 * Polyfill pour requestIdleCallback sur les plateformes qui ne le supportent pas
 */
export const setupRequestIdleCallbackPolyfill = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && !window.requestIdleCallback) {
    window.requestIdleCallback = function(callback, options?) {
      const start = Date.now();
      return setTimeout(function() {
        callback({
          didTimeout: false,
          timeRemaining: function() {
            return Math.max(0, 50 - (Date.now() - start));
          }
        });
      }, 1) as unknown as number;
    };

    window.cancelIdleCallback = function(id) {
      clearTimeout(id);
    };
  }
};

/**
 * Adaptation de l'API Image pour le web
 */
export const createCompatibleImage = () => {
  if (Platform.OS === 'web') {
    return new Image();
  }
  
  // Retourne un objet compatible sur les autres plateformes
  return {
    src: '',
    onload: () => {},
    onerror: () => {},
    width: 0,
    height: 0,
  };
};

/**
 * Configuration des polyfills pour l'application
 */
export const setupWebPolyfills = () => {
  setupPerformancePolyfill();
  setupRequestIdleCallbackPolyfill();
};

export default setupWebPolyfills; 