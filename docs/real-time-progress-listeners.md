# Listeners Firestore en Temps Réel - Section "Ma Progression"

## Vue d'ensemble

La section "Ma progression" de la page profil utilise maintenant des listeners Firestore en temps réel pour afficher les mises à jour de progression automatiquement, sans nécessiter de rechargement manuel.

## Architecture

### 1. Hook `useProfileProgress`

**Fichier**: `src/hooks/useProfileProgress.ts`

Ce hook personnalisé gère la synchronisation en temps réel de la progression utilisateur :

- **Listeners multiples** : Surveille à la fois le document profil utilisateur et la sous-collection `parcours`
- **Calcul automatique** : Recalcule la progression basée sur les parcours complétés
- **Gestion d'erreurs** : Gère les erreurs de connexion et les permissions
- **Optimisation** : Évite les listeners imbriqués pour de meilleures performances

#### Fonctionnalités clés :

```typescript
const { progress, isLoading, error, refreshProgress } = useProfileProgress(userId);
```

- `progress` : Données de progression en temps réel
- `isLoading` : État de chargement
- `error` : Messages d'erreur
- `refreshProgress` : Fonction de rafraîchissement manuel

### 2. Composants mis à jour

#### `ProgressCircles`
**Fichier**: `src/components/profile/ProgressCircles.tsx`

- Utilise `useProfileProgress` pour les données temps réel
- Affiche un indicateur de chargement pendant la synchronisation
- Fallback sur les données du profil si les listeners échouent

#### `ProgressBars`
**Fichier**: `src/components/profile/ProgressBars.tsx`

- Intégration similaire avec indicateurs visuels
- Bouton de rafraîchissement connecté aux listeners
- Gestion des erreurs avec messages utilisateur

### 3. Indicateur de synchronisation

#### `RealTimeProgressIndicator`
**Fichier**: `src/components/profile/RealTimeProgressIndicator.tsx`

Composant de débogage et de test qui affiche :
- Statut de connexion en temps réel
- Nombre de mises à jour reçues
- Dernière mise à jour
- Boutons de test pour simuler des changements

## Fonctionnement des Listeners

### 1. Surveillance du profil utilisateur

```typescript
const userProfileRef = doc(db, 'users', userId);
const unsubscribeProfile = onSnapshot(userProfileRef, (snapshot) => {
  // Mise à jour automatique quand le profil change
});
```

### 2. Surveillance des parcours

```typescript
const userParcoursRef = collection(db, 'users', userId, 'parcours');
const unsubscribeParcours = onSnapshot(userParcoursRef, () => {
  // Recalcul automatique quand les parcours changent
});
```

### 3. Nettoyage automatique

Les listeners sont automatiquement nettoyés au démontage du composant pour éviter les fuites mémoire.

## Avantages

### ✅ Temps réel
- Mises à jour instantanées sans rechargement
- Synchronisation automatique entre appareils
- Expérience utilisateur fluide

### ✅ Performance
- Listeners optimisés sans imbrication
- Calculs uniquement quand nécessaire
- Gestion efficace de la mémoire

### ✅ Robustesse
- Gestion d'erreurs complète
- Fallback sur données existantes
- Retry automatique en cas de déconnexion

### ✅ Testabilité
- Service de test intégré
- Simulation de mises à jour
- Indicateurs de débogage

## Utilisation

### Dans un composant

```typescript
import { useProfileProgress } from '../hooks/useProfileProgress';

const MyComponent = () => {
  const { user } = useAuth();
  const { progress, isLoading, error } = useProfileProgress(user?.uid || '');
  
  if (isLoading) return <LoadingIndicator />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <p>Bourse: {progress?.bourse.percentage}%</p>
      <p>Crypto: {progress?.crypto.percentage}%</p>
    </div>
  );
};
```

### Test des listeners

Le composant `RealTimeProgressIndicator` inclut des boutons pour :
- Tester les mises à jour en temps réel
- Remettre à zéro la progression
- Simuler des changements progressifs

## Service de test

**Fichier**: `src/services/testProgressUpdates.ts`

Fonctions utilitaires pour tester les listeners :

```typescript
// Test complet des listeners
await TestProgressUpdatesService.testRealTimeListeners(userId);

// Simulation de progression
await TestProgressUpdatesService.simulateProgressiveUpdate(userId, 'bourse', 5);

// Remise à zéro
await TestProgressUpdatesService.resetProgress(userId);
```

## Configuration Firestore

### Règles de sécurité

Assurez-vous que les règles Firestore permettent :
- Lecture du document utilisateur
- Lecture de la sous-collection `parcours`
- Écriture pour les tests (en développement)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /parcours/{parcoursId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Monitoring et débogage

### Console logs
Les listeners génèrent des logs détaillés :
- `🧪 Test:` - Actions de test
- `✅ Test:` - Succès
- `❌ Erreur:` - Erreurs
- `📊 Test:` - Progression

### Indicateur visuel
Le `RealTimeProgressIndicator` affiche en temps réel :
- Statut de connexion
- Nombre de mises à jour
- Données actuelles
- Erreurs éventuelles

## Migration

### Avant (sans listeners)
```typescript
// Rechargement manuel nécessaire
const loadProfile = async () => {
  const profile = await profileService.getUserProfile(userId);
  setProfile(profile);
};
```

### Après (avec listeners)
```typescript
// Mise à jour automatique
const { progress } = useProfileProgress(userId);
// Les données se mettent à jour automatiquement
```

## Bonnes pratiques

1. **Toujours nettoyer les listeners** dans le `useEffect` cleanup
2. **Gérer les cas d'erreur** avec des fallbacks appropriés
3. **Optimiser les requêtes** en évitant les listeners inutiles
4. **Tester régulièrement** avec le service de test intégré
5. **Monitorer les performances** avec les indicateurs fournis

## Prochaines étapes

- [ ] Étendre aux autres sections du profil
- [ ] Ajouter des animations pour les transitions
- [ ] Implémenter la synchronisation offline
- [ ] Optimiser pour les connexions lentes 