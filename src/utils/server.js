// This file provides mock implementations of server-side Font APIs
// to prevent errors when building for web

export const FontDisplay = {
  AUTO: 'auto',
  BLOCK: 'block',
  SWAP: 'swap',
  FALLBACK: 'fallback',
  OPTIONAL: 'optional',
};

export function processFontFamily(fontFamily) {
  return fontFamily;
}

export function getFullFontName(fontData) {
  return fontData.fullName;
}

export async function loadFontAsync() {
  // Mock implementation
  return null;
}

export function isLoaded() {
  return true;
}

export function unloadAllAsync() {
  return Promise.resolve();
}

export function unloadAllSync() {
  return true;
}

// Add any other needed exports from expo-font/build/server 