# Règles Firestore pour le Système de Streak

Ce document décrit les règles Firestore nécessaires pour sécuriser le système de streak de connexion.

## Règles pour la collection `users`

Les champs `streak` et `lastStreakUpdate` doivent être protégés contre les modifications non autorisées.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour la collection users
    match /users/{userId} {
      // Lecture : l'utilisateur peut lire ses propres données
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Écriture : l'utilisateur peut modifier ses données mais avec restrictions
      allow write: if request.auth != null && request.auth.uid == userId
        && validateUserUpdate(resource, request.resource);
    }
  }
}

// Fonction de validation pour les mises à jour utilisateur
function validateUserUpdate(existingData, newData) {
  // Vérifier que les champs critiques ne sont pas modifiés directement par le client
  return (
    // Le streak ne peut être modifié que par le serveur (via Cloud Functions)
    (!('streak' in newData.data) || newData.data.streak == existingData.data.streak) &&
    
    // lastStreakUpdate ne peut être modifié que par le serveur
    (!('lastStreakUpdate' in newData.data) || newData.data.lastStreakUpdate == existingData.data.lastStreakUpdate) &&
    
    // Les autres champs peuvent être modifiés normalement
    true
  );
}
```

## Règles recommandées avec Cloud Functions

Pour une sécurité maximale, il est recommandé d'utiliser des Cloud Functions pour gérer les mises à jour de streak :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Lecture autorisée pour l'utilisateur
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Écriture limitée (sans streak et lastStreakUpdate)
      allow update: if request.auth != null && request.auth.uid == userId
        && !('streak' in request.resource.data)
        && !('lastStreakUpdate' in request.resource.data);
      
      // Création autorisée pour les nouveaux utilisateurs
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Collection pour les logs de streak (optionnel)
    match /streakLogs/{logId} {
      allow read, write: if false; // Seulement accessible via Cloud Functions
    }
  }
}
```

## Cloud Function pour la sécurité

Exemple de Cloud Function pour gérer les streaks de manière sécurisée :

```typescript
import { onCall } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

export const updateStreak = onCall(async (request) => {
  const { auth } = request;
  
  if (!auth) {
    throw new Error('Utilisateur non authentifié');
  }
  
  const userId = auth.uid;
  const db = getFirestore();
  
  // Logique de mise à jour du streak ici
  // Cette fonction s'exécute côté serveur avec des privilèges admin
  
  return { success: true };
});
```

## Validation côté client

Même avec les règles Firestore, il est important de valider côté client :

```typescript
// Dans StreakService.ts
static async checkAndUpdateStreak(userId: string): Promise<StreakData> {
  // Vérifications de sécurité
  if (!userId || typeof userId !== 'string') {
    throw new Error('ID utilisateur invalide');
  }
  
  // Vérifier que l'utilisateur est authentifié
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error('Utilisateur non autorisé');
  }
  
  // Logique de mise à jour...
}
```

## Logs et audit

Pour tracer les modifications de streak :

```typescript
// Ajouter des logs lors des mises à jour
await addDoc(collection(db, 'streakLogs'), {
  userId,
  action: 'streak_updated',
  oldStreak: currentStreak,
  newStreak: newStreak,
  timestamp: new Date().toISOString(),
  dodjiAwarded: dodjiReward
});
```

## Recommandations de sécurité

1. **Validation serveur** : Toujours valider les données côté serveur
2. **Rate limiting** : Limiter le nombre de tentatives de mise à jour par utilisateur
3. **Logs d'audit** : Enregistrer toutes les modifications de streak
4. **Vérification temporelle** : Vérifier que les mises à jour respectent la logique temporelle
5. **Détection d'anomalies** : Surveiller les patterns suspects (ex: trop de streaks en peu de temps)

## Tests de sécurité

```typescript
// Test : tentative de modification directe du streak
try {
  await updateDoc(doc(db, 'users', userId), {
    streak: 999,
    dodji: 999999
  });
  // Ce test devrait échouer avec les bonnes règles
} catch (error) {
  console.log('Sécurité OK : modification non autorisée bloquée');
}
``` 