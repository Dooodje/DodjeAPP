# Dodje App

Application mobile d'éducation financière développée en React Native avec Expo.

## Structure du projet

Le projet est organisé selon la structure suivante :

```
dodje/
├── app/                    # Entrée de l'application (Expo Router)
│   ├── (auth)/             # Routes d'authentification
│   ├── (tabs)/             # Routes des onglets principaux
│   └── _layout.tsx         # Layout principal
├── src/                    # Code source principal
│   ├── assets/             # Ressources statiques (images, fonts, etc.)
│   ├── components/         # Composants réutilisables
│   ├── constants/          # Constantes et thèmes
│   ├── hooks/              # Hooks personnalisés
│   ├── screens/            # Écrans complets
│   ├── services/           # Services (API, Firebase, etc.)
│   ├── store/              # État global (Redux)
│   │   └── slices/         # Slices Redux
│   ├── types/              # Types TypeScript
│   └── utils/              # Fonctions utilitaires
├── scripts/                # Scripts d'automatisation
├── .cursorrules            # Documentation et règles du projet
├── babel.config.js         # Configuration de Babel
└── tsconfig.json           # Configuration de TypeScript
```

## Conventions d'imports

Le projet utilise un système d'alias pour simplifier les imports. Voici les alias disponibles :

- `@/*` : Import depuis le répertoire `src/`
- `@components/*` : Import depuis `src/components/`
- `@hooks/*` : Import depuis `src/hooks/`
- `@services/*` : Import depuis `src/services/`
- `@store/*` : Import depuis `src/store/`
- `@types/*` : Import depuis `src/types/`
- `@utils/*` : Import depuis `src/utils/`
- `@constants/*` : Import depuis `src/constants/`
- `@assets/*` : Import depuis `src/assets/`
- `@screens/*` : Import depuis `src/screens/`

### Exemples d'utilisation des alias

```typescript
// Import depuis src/
import { someFunction } from '@/utils/helpers';

// Import depuis src/components
import { Button } from '@components/ui/Button';

// Import depuis src/hooks
import { useAuth } from '@hooks/useAuth';
```

## Commandes utiles

### Démarrage de l'application

```bash
# Démarrer l'application avec Expo
npm start

# Démarrer sur Android
npm run android

# Démarrer sur iOS
npm run ios

# Démarrer sur le web
npm run web
```

### Vérification du code

```bash
# Lancer le linter
npm run lint

# Vérifier les imports
npm run check-imports
```

## Bonnes pratiques

### Imports

- Préférez les imports avec alias pour le code du projet
- Utilisez des imports relatifs uniquement pour les fichiers très proches
- Évitez les imports circulaires

### Redux

- Assurez-vous que tous les reducers sont enregistrés dans le store principal
- Définissez clairement les types pour vos états et actions
- Utilisez les hooks Redux (`useSelector`, `useDispatch`) plutôt que connect

### Firebase

- Centralisez les appels Firebase dans les services
- Gérez correctement les erreurs Firebase
- N'exposez pas directement les objets Firebase aux composants

### Components

- Créez des composants modulaires et réutilisables
- Respectez le principe de responsabilité unique
- Utilisez les types TypeScript pour les props

## Résolution des problèmes courants

### Problème d'imports non résolus

Si vous rencontrez des erreurs d'imports non résolus :

1. Exécutez la commande `npm run check-imports` pour identifier les problèmes
2. Vérifiez que tous les packages nécessaires sont installés
3. Assurez-vous que les chemins d'import sont corrects
4. Vérifiez la structure du projet

### Problèmes de types TypeScript

Si vous rencontrez des erreurs de types :

1. Vérifiez que les interfaces et types sont correctement définis
2. Assurez-vous que les imports de types sont corrects
3. Utilisez `as` avec parcimonie pour les assertions de type

### Problèmes Redux

Si vous rencontrez des problèmes avec Redux :

1. Vérifiez que tous les reducers sont enregistrés dans `src/store/index.ts`
2. Assurez-vous que les types sont correctement définis
3. Vérifiez que les actions sont correctement importées
