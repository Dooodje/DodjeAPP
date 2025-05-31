# Système de Questionnaire - Dodje

## Vue d'ensemble

Le système de questionnaire de Dodje collecte des informations auprès des nouveaux utilisateurs lors de leur première connexion. Les réponses sont sauvegardées dans deux endroits :
1. **Document principal de l'utilisateur** dans la collection `users` avec des données structurées
2. **Sous-collection `profil-invest`** pour l'historique complet des réponses

## Architecture

Le système comprend plusieurs composants principaux :

1. **FirstConnectionQuestionnaire** : Composant principal du questionnaire
2. **QuestionnaireService** : Service pour les opérations Firestore
3. **useQuestionnaire** : Hook personnalisé pour la gestion des données
4. **FirstConnectionContext** : Contexte pour la gestion de l'affichage

## Structure des données

### Document utilisateur principal (`users/{userId}`)

Les données structurées sont sauvegardées directement dans le document utilisateur :

```typescript
interface UserQuestionnaireData {
  sexe: 'homme' | 'femme';
  age: number;
  name: string;
  preference: 'bourse' | 'crypto';
  lvl: 'debutant' | 'avance' | 'expert';
  questionnaireCompletedAt: Timestamp;
}
```

**Mapping des réponses :**
- **Sexe** : "1748684755763-1" → "homme", "1748684755763-2" → "femme"
- **Âge** : Sauvegardé tel quel
- **Nom** : Sauvegardé tel quel
- **Préférence** : "1748684849492-1" → "bourse", "1748684849492-2" → "crypto"
- **Niveau** : "1748684888584-1" → "debutant", "1748684888584-2" → "avance", "1748684888584-3" → "expert"

### Sous-collection historique (`users/{userId}/profil-invest/questionnaire-initial`)

Les réponses complètes sont également sauvegardées pour l'historique :

```typescript
interface QuestionnaireAnswers {
  answers: Record<string, string>;
  completedAt: Timestamp;
  questionnaireId: string;
  version: string;
}
```

## Analyse des réponses

Le service analyse automatiquement les réponses pour extraire :
- **Sexe** : Basé sur l'ID de réponse
- **Âge** : Valeur numérique
- **Nom** : Texte libre
- **Préférence d'investissement** : Bourse ou crypto
- **Niveau d'expérience** : Débutant, avancé ou expert

## Utilisation

### Affichage du questionnaire

```typescript
import { FirstConnectionQuestionnaire } from './app/first-connection-questionnaire';

// Le questionnaire s'affiche automatiquement si non complété
<FirstConnectionQuestionnaire />
```

### Récupération des réponses

```typescript
import { useQuestionnaire } from './src/hooks/useQuestionnaire';

function MyComponent() {
  const { 
    userData,        // Nouvelles données structurées
    answers,         // Réponses complètes (legacy)
    hasCompleted, 
    isLoading, 
    error,
    analysis         // Analyse legacy
  } = useQuestionnaire();

  if (userData) {
    console.log('Nom:', userData.name);
    console.log('Âge:', userData.age);
    console.log('Sexe:', userData.sexe);
    console.log('Préférence:', userData.preference);
    console.log('Niveau:', userData.lvl);
  }
}
```

### Service direct

```typescript
import { QuestionnaireService } from './src/services/questionnaireService';

// Sauvegarder les réponses
await QuestionnaireService.saveQuestionnaireAnswers(userId, answers);

// Vérifier la complétion
const hasCompleted = await QuestionnaireService.hasCompletedQuestionnaire(userId);

// Récupérer les données utilisateur
const userData = await QuestionnaireService.getUserQuestionnaireData(userId);
```

## Sécurité

Les règles Firestore existantes s'appliquent :
- Seul le propriétaire des données peut lire/écrire ses réponses
- Accès admin spécifié dans les règles

## Gestion d'erreur

Le système inclut une gestion d'erreur robuste :
- Fallback vers AsyncStorage en cas d'échec Firestore
- Logging détaillé pour le débogage
- États de chargement et d'erreur dans le hook

## Personnalisation

### Ajouter de nouvelles questions

1. Modifier le questionnaire dans `first-connection-questionnaire.tsx`
2. Mettre à jour le mapping dans `parseAnswersToUserData` du service
3. Ajuster l'interface `UserQuestionnaireData` si nécessaire

### Modifier l'analyse des réponses

Éditer la méthode `parseAnswersToUserData` dans `QuestionnaireService` :

```typescript
private static parseAnswersToUserData(answers: Record<string, string>): Partial<UserQuestionnaireData> {
  // Ajouter votre logique de mapping ici
}
```

## Exemple d'utilisation

Voir `src/examples/QuestionnaireExample.tsx` pour un exemple complet d'affichage des données du questionnaire.

## Maintenance

### Logging et monitoring

- Taux de complétion des questionnaires
- Erreurs de sauvegarde
- Performance des requêtes Firestore

### Migration

Pour les changements de structure de données :

1. Incrémenter la version du questionnaire
2. Ajouter la logique de migration dans le service
3. Tester avec les anciennes données

## Support

En cas de problème :
1. Vérifier les logs de l'application
2. Contrôler les règles Firestore
3. Tester la connectivité réseau 