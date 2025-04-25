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

## Instructions pour résoudre les problèmes d'authentification et de Firestore

Si vous rencontrez l'erreur "FirebaseError: Missing or insufficient permissions" lors de la création d'un compte ou de la connexion, suivez ces étapes :

### 1. Configuration des règles Firestore

Les règles Firestore contrôlent les accès en lecture et écriture à votre base de données. Sans les bonnes règles, vous obtiendrez des erreurs de permission.

Les fichiers nécessaires ont été créés dans le projet :
- `firestore.rules` - Les règles de sécurité pour Firestore
- `.firebaserc` - Configuration du projet Firebase
- `firebase.json` - Configuration des services Firebase
- `firestore.indexes.json` - Index pour optimiser les requêtes

### 2. Déploiement des règles Firestore

Pour déployer ces règles sur votre projet Firebase :

```bash
# Installer Firebase CLI (si ce n'est pas déjà fait)
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Déployer les règles Firestore
firebase deploy --only firestore:rules
```

### 3. Vérification de la configuration

Les règles devraient maintenant permettre à chaque utilisateur d'accéder à son propre document dans la collection "users" et d'autres collections liées.

Si les problèmes persistent :
- Vérifiez que vous utilisez le bon projet Firebase dans `.firebaserc`
- Assurez-vous que l'authentification par email/mot de passe est activée dans la console Firebase
- Vérifiez les journaux dans la console de votre navigateur ou dans l'application pour des erreurs plus spécifiques

### 4. Travail en mode test

Pour travailler en mode test (npx expo start), les émulateurs Firebase peuvent être utiles :

```bash
# Démarrer les émulateurs
firebase emulators:start
```

Cela démarre des versions locales de Firebase Auth et Firestore que vous pouvez utiliser pour le développement.

## Gestion optimisée des tokens d'authentification

Nous avons implémenté un système avancé de gestion des tokens d'authentification Firebase pour améliorer la sécurité et l'expérience utilisateur :

### Fonctionnalités ajoutées

1. **Rafraîchissement automatique des tokens** 
   - Les tokens sont automatiquement rafraîchis 15 minutes avant leur expiration (par défaut après 45 minutes)
   - Évite les déconnexions inattendues dues à l'expiration des tokens

2. **Double système de sécurité**
   - Système principal : Rafraîchissement proactif planifié
   - Système de secours : Vérification périodique du token toutes les 15 minutes

3. **Gestion intelligente des erreurs**
   - Tentative de rafraîchissement avant déconnexion en cas de problème
   - Remontée d'erreurs détaillées pour faciliter le débogage

4. **Nettoyage propre des ressources**
   - Les timers sont correctement annulés lors de la déconnexion ou du démontage des composants
   - Évite les fuites mémoire et les comportements inattendus

### Comment ça fonctionne

1. À la connexion/inscription, le token est obtenu automatiquement et un rafraîchissement est planifié
2. 45 minutes après, le token est automatiquement rafraîchi et un nouveau cycle commence
3. En parallèle, une vérification est effectuée toutes les 15 minutes comme filet de sécurité
4. Si un problème est détecté, le système tente de rafraîchir le token avant de déconnecter l'utilisateur

### API exposée

Le hook `useAuth` expose désormais les fonctions suivantes liées aux tokens :
- `isTokenValid` : Indique si le token actuel est valide
- `checkTokenValidity()` : Vérifie manuellement la validité du token et tente un rafraîchissement si nécessaire
- `refreshToken()` : Force un rafraîchissement manuel du token

### Avantages pour l'utilisateur final

- Sessions plus longues sans interruption
- Transitions transparentes lors du rafraîchissement des tokens
- Meilleure récupération après une perte de connectivité
- Réduction des déconnexions inattendues
