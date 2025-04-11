import { Href } from 'expo-router/build/types';

// Types pour les routes de l'application
type AuthRoutes = '/(auth)/login' | '/(auth)/register';
type TabRoutes = '/(tabs)' | '/(tabs)/profile' | '/(tabs)/index';
type SettingsRoutes = '/(settings)' | '/(settings)/subscription' | '/(settings)/terms' | '/(settings)/privacy';
type DodjeOneRoutes = '/(dodjeone)';
type CourseRoutes = `/course/${string}`;
type VideoRoutes = `/video/${string}`;

// Type principal pour les routes de l'application
export type AppRoute = Href & (
  | '/' 
  | AuthRoutes 
  | TabRoutes 
  | SettingsRoutes 
  | DodjeOneRoutes 
  | CourseRoutes 
  | VideoRoutes
);

// Type helper pour les paramètres de route
export type RouteParams = {
  '/course/[id]': { id: string };
  '/video/[id]': { id: string };
};

// Type helper pour vérifier si une route a des paramètres
export type HasParams<T extends AppRoute> = T extends keyof RouteParams ? true : false;

// Type helper pour obtenir les paramètres d'une route
export type GetRouteParams<T extends AppRoute> = T extends keyof RouteParams ? RouteParams[T] : never; 