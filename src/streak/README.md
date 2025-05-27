# Système de Streak de Connexion

Ce dossier contient l'implémentation complète du système de streak de connexion pour l'application.

## 📁 Structure

```
src/streak/
├── components/
│   ├── StreakModal.tsx      # Modal d'affichage des récompenses
│   └── StreakDisplay.tsx    # Composant d'affichage du streak
├── hooks/
│   └── useStreak.ts         # Hook React pour gérer les streaks
├── services/
│   ├── StreakService.ts     # Service principal de gestion des streaks
│   └── StreakInitializationService.ts # Service d'initialisation
├── types.ts                 # Types TypeScript
├── index.ts                 # Exports principaux
└── README.md               # Cette documentation
```

## 🎯 Fonctionnalités

### Récompenses de Streak

Basé sur le cahier des charges fourni :

- **Jour 1** : +5 Dodji (Connexion quotidienne)
- **7 jours consécutifs** : +50 Dodji (Système de streaks hebdomadaire)
- **30 jours consécutifs** : +250 Dodji (Encourager la récurrence)

### Logique de Fonctionnement

1. **Vérification lors de la connexion** : Le système vérifie automatiquement le streak à chaque connexion
2. **Calcul du streak** :
   - Si l'utilisateur s'est connecté hier : streak +1
   - Si l'utilisateur ne s'est pas connecté hier : streak repart à 1
   - Si l'utilisateur s'est déjà connecté aujourd'hui : pas de changement
3. **Attribution des récompenses** : Les Dodji sont automatiquement ajoutés au compte utilisateur
4. **Affichage du modal** : Un modal s'affiche sur la page d'accueil pour montrer les gains

## 🔧 Utilisation

### Hook useStreak

```typescript
import { useStreak } from '@/streak';

const MyComponent = () => {
  const { 
    streakData, 
    modalData, 
    checkLoginStreak, 
    closeModal 
  } = useStreak();

  // Le modal s'affiche automatiquement lors d'un nouveau streak
  return (
    <StreakModal modalData={modalData} onClose={closeModal} />
  );
};
```

### Service StreakService

```typescript
import { StreakService } from '@/streak';

// Vérifier et mettre à jour le streak
const streakData = await StreakService.checkAndUpdateStreak(userId);

// Récupérer le streak actuel
const currentStreak = await StreakService.getCurrentStreak(userId);

// Vérifier si l'utilisateur peut gagner un streak aujourd'hui
const canEarn = await StreakService.canEarnStreakToday(userId);
```

### Composants

```typescript
import { StreakModal, StreakDisplay } from '@/streak';

// Modal de récompense
<StreakModal modalData={modalData} onClose={closeModal} />

// Affichage compact du streak
<StreakDisplay streakCount={5} compact />
```

## 🗄️ Base de Données

### Champs ajoutés à la collection `users`

- `streak` (number) : Nombre de jours consécutifs de connexion
- `lastStreakUpdate` (string) : Date de la dernière mise à jour du streak (ISO string)

### Exemple de document utilisateur

```json
{
  "uid": "user123",
  "email": "user@example.com",
  "dodji": 155,
  "streak": 7,
  "lastStreakUpdate": "2025-01-20T10:30:00.000Z",
  "lastLogin": "2025-01-20T10:30:00.000Z"
}
```

## 🔄 Intégration

### Dans useAuth.ts

Le système est automatiquement intégré dans le hook d'authentification :

```typescript
// Après une connexion réussie
await StreakService.checkAndUpdateStreak(userData.uid);
```

### Dans index.tsx (Page d'accueil)

Le modal de streak s'affiche automatiquement :

```typescript
const { modalData: streakModalData, closeModal: closeStreakModal } = useStreak();

return (
  <View>
    {/* Contenu de la page */}
    <StreakModal modalData={streakModalData} onClose={closeStreakModal} />
  </View>
);
```

## 🎨 Design

Le système utilise le design system de l'application :

- **Couleurs** : 
  - Primaire : `#9BEC00` (vert)
  - Streak : `#FF6B35` (orange)
  - Fond : `#1A1A1A` (noir)
- **Typographie** : Famille Arboria
- **Animations** : Spring animations avec React Native Reanimated

## 🧪 Tests

Pour tester le système :

```typescript
// Réinitialiser le streak d'un utilisateur
await StreakService.resetStreak(userId);

// Ou via le hook
const { resetStreak } = useStreak();
await resetStreak();
```

## 📱 Responsive

Le modal et les composants sont optimisés pour :
- Différentes tailles d'écran
- Mode portrait et paysage
- Accessibilité

## 🚀 Évolutions Futures

Possibles améliorations :
- Notifications push pour rappeler la connexion quotidienne
- Statistiques de streak dans le profil utilisateur
- Badges spéciaux pour les longs streaks
- Système de défis de streak
- Partage social des achievements 