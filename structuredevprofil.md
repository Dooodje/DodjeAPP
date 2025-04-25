Je te laisserai mettre à jour ce fichier au fur et mesure de notre avancement dans les étapes 

1. ✅ Modifier les règles Firestore
   - Configuration des règles de sécurité permettant à l'utilisateur de lire les données globales
   - Restriction de l'accès aux données des autres utilisateurs
   - Permission d'écrire uniquement les données brutes pour l'utilisateur authentifié
   - Ajout de validations pour garantir l'intégrité des données

2. ✅ Créer/modifier le formulaire de création de compte
   - Mise à jour du processus d'inscription pour inclure toutes les données de base nécessaires
   - Initialisation des sous-collections requises lors de la création du compte :
     - profil-invest : Données du profil d'investisseur
     - dodjelabs : Recommandations et analyses
     - jeton_dodji : Historique et balance des jetons
     - dodjeone : Statut de l'abonnement
     - video : Historique de visionnage
     - quiz : Historique et résultats des quiz
     - connexion : Historique de connexion avec streak
     - parcours : Progression dans les parcours
     - historique : Position dans l'application
   - Utilisation de Timestamp pour les horodatages
   - Ajout d'un mécanisme d'enregistrement de connexion lors de l'authentification

3. ⏳ Créer la logique côté client
   - ✅ Suivi du visionnage des vidéos et enregistrement de la progression
     - ✅ Création d'un service dédié (`videoTrackingService`) pour gérer les interactions avec Firestore
     - ✅ Mise en place d'un hook personnalisé (`useVideoTracking`) pour faciliter l'intégration dans les composants
     - ✅ Intégration dans le composant `VideoPlayer` pour suivre la progression en temps réel
     - ✅ Stockage de la progression, du temps de visionnage et des métadonnées dans la sous-collection `video`
     - ✅ Distinction entre les vidéos non commencées, en cours et terminées
     - ✅ Mise à jour périodique des données pendant le visionnage (toutes les secondes)
     - ✅ Enregistrement automatique lors des événements de pause, reprise et fin de vidéo
     - ⏳ Amélioration de la gestion des erreurs et des tentatives de reconnexion
     - ⏳ Optimisation des performances et réduction des écritures Firestore
   - ⏳ Suivi de la progression dans les parcours d'apprentissage
     - ⏳ Création d'un service dédié (`courseProgressService`) pour gérer la progression des parcours
     - ⏳ Développement d'un hook React (`useCourseProgress`) pour l'intégration dans les composants
     - ⏳ Mise à jour automatique de la progression du parcours lors de l'achèvement des vidéos
     - ⏳ Calcul du pourcentage de complétion global d'un parcours
     - ⏳ Mécanisme de déblocage des niveaux et modules suivants
     - ⏳ Attribution de badges et récompenses à l'achèvement de jalons
   - ⏳ Gestion des résultats des quiz et évaluations
     - ⏳ Service de traitement des réponses aux quiz (`quizService`)
     - ⏳ Validation des réponses et calcul des scores
     - ⏳ Stockage des résultats détaillés et statistiques par catégorie
     - ⏳ Intégration avec le système de progression des parcours
     - ⏳ Génération de rapports de performance pour l'utilisateur
   - ⏳ Enregistrement des connexions quotidiennes et streaks
     - ⏳ Service de suivi des connexions (`userActivityService`)
     - ⏳ Détection et enregistrement des connexions quotidiennes
     - ⏳ Calcul et mise à jour des streaks de connexion
     - ⏳ Système de récompenses pour les streaks significatifs
     - ⏳ Rappels et notifications pour maintenir les streaks
   - ✅ L'application enregistre les actions directes et met à jour l'UI en gérant l'ajout progressif des données
   - ⏳ Mise en place d'un mécanisme de mise en cache local pour préserver l'expérience hors-ligne
     - ⏳ Stockage local des données essentielles (AsyncStorage/IndexedDB)
     - ⏳ File d'attente des actions à synchroniser lors de la reconnexion
     - ⏳ Mécanisme de détection et résolution des conflits

4. ⏳ Créer les Cloud Functions
   - ⏳ Validation des données et application des règles métier côté serveur
   - ⏳ Mise à jour en cascade et calculs complexes
   - ⏳ Génération et envoi de notifications
   - ⏳ Tâches planifiées (calcul de statistiques, reset hebdomadaire, etc.)
   - ⏳ Structure modulaire pour faciliter la maintenance

5. ⏳ Système de synchronisation et gestion des conflits
   - ⏳ Détection et résolution des conflits de données
   - ⏳ Stratégie de synchronisation optimisée pour économiser la bande passante
   - ⏳ Mécanisme de reprise en cas d'échec de synchronisation
   - ⏳ Indicateurs visuels de l'état de synchronisation dans l'interface

6. ⏳ Mécanisme de déploiement et mise à jour des fonctions
   - ⏳ Configuration de l'environnement de développement avec émulateurs Firebase
   - ⏳ Tests automatisés pour les fonctions Cloud
   - ⏳ Stratégie de déploiement progressif (canary release)
   - ⏳ Système de rollback en cas de problème détecté

7. ⏳ Monitoring et logging
   - ⏳ Configuration du logging structuré pour faciliter l'analyse
   - ⏳ Mise en place d'alertes sur les erreurs critiques
   - ⏳ Tableau de bord de suivi des performances et utilisation
   - ⏳ Analyse des comportements utilisateurs et des points de friction

## Structure de fichiers pour la gestion des profils

Pour garantir une architecture modulaire, évolutive et facilement maintenable, voici la structure de fichiers mise en place pour la gestion des profils utilisateurs :

```
src/
├── services/
│   ├── firebase/
│   │   ├── config.ts                  # Configuration Firebase centralisée
│   │   ├── index.ts                   # Point d'entrée pour tous les services Firebase
│   │   ├── services.ts                # Services Firebase généraux (auth, firestore)
│   │   ├── videoTrackingService.ts    # Service dédié au suivi du visionnage des vidéos
│   │   ├── courseProgressService.ts   # Service pour le suivi de la progression des parcours
│   │   ├── quizService.ts             # Service pour la gestion des quiz et résultats
│   │   ├── userActivityService.ts     # Service pour le suivi des activités utilisateur
│   │   └── ... (autres services)      # Services pour d'autres fonctionnalités
│   └── ... (autres services)
├── hooks/
│   ├── useAuth.ts                     # Hook pour la gestion de l'authentification
│   ├── useVideoTracking.ts            # Hook pour le suivi de la progression des vidéos
│   ├── useCourseProgress.ts           # Hook pour la progression des parcours
│   ├── useQuiz.ts                     # Hook pour la gestion des quiz
│   ├── useUserActivity.ts             # Hook pour le suivi des activités utilisateur
│   └── ... (autres hooks)
├── components/
│   ├── video/
│   │   ├── VideoPlayer.tsx            # Composant lecteur vidéo intégrant le tracking
│   │   └── ... (autres composants)
│   ├── quiz/
│   │   ├── QuizContainer.tsx          # Conteneur principal pour les quiz
│   │   ├── QuestionCard.tsx           # Carte pour afficher une question de quiz
│   │   └── ... (autres composants)
│   └── ... (autres composants)
└── utils/
    ├── offlineQueue.ts                # Gestion de la file d'attente des actions hors-ligne
    ├── syncManager.ts                 # Gestionnaire de synchronisation
    └── ... (autres utilitaires)
```

## Schéma de données pour le suivi des vidéos

Les données de suivi des vidéos sont stockées dans la sous-collection `video` de chaque utilisateur avec la structure suivante :

```
users/
├── {userId}/
│   ├── video/
│   │   ├── {videoId}/                 # Document pour chaque vidéo visionnée
│   │   │   ├── videoId: string        # ID de la vidéo
│   │   │   ├── currentTime: number    # Position actuelle en secondes
│   │   │   ├── duration: number       # Durée totale de la vidéo en secondes
│   │   │   ├── progress: number       # Pourcentage de progression (0-100)
│   │   │   ├── lastUpdated: timestamp # Date de dernière mise à jour
│   │   │   ├── completionStatus: enum # 'notStarted', 'inProgress' ou 'completed'
│   │   │   └── metadata: object       # Métadonnées (courseId, videoTitle, etc.)
│   │   └── ...
│   ├── video_completions/             # Historique des vidéos terminées
│   │   ├── {videoId}/
│   │   │   ├── videoId: string
│   │   │   ├── completedAt: timestamp
│   │   │   └── courseId: string
│   │   └── ...
│   ├── parcours/                      # Progression dans les parcours d'apprentissage
│   │   ├── {parcoursId}/
│   │   │   ├── parcoursId: string     # ID du parcours
│   │   │   ├── progress: number       # Pourcentage global de progression (0-100)
│   │   │   ├── lastActivity: timestamp # Dernière activité dans ce parcours
│   │   │   ├── videosCompleted: number # Nombre de vidéos terminées
│   │   │   ├── quizCompleted: number  # Nombre de quiz terminés
│   │   │   ├── modules: array         # État de progression par module
│   │   │   ├── achievements: array    # Badges et récompenses débloqués
│   │   │   └── isCompleted: boolean   # Indicateur de complétion du parcours
│   │   └── ...
│   ├── quiz/                          # Résultats des quiz
│   │   ├── {quizId}/
│   │   │   ├── quizId: string         # ID du quiz
│   │   │   ├── score: number          # Score obtenu (0-100)
│   │   │   ├── completedAt: timestamp # Date de complétion
│   │   │   ├── timeSpent: number      # Temps passé en secondes
│   │   │   ├── answers: array         # Détail des réponses données
│   │   │   ├── incorrectAnswers: array # Questions avec réponses incorrectes
│   │   │   └── attempts: number       # Nombre de tentatives
│   │   └── ...
│   └── connexion/                     # Historique des connexions
│       ├── {date}/                    # Document par jour de connexion
│       │   ├── date: string           # Date de connexion (YYYY-MM-DD)
│       │   ├── timestamp: timestamp   # Horodatage de la première connexion du jour
│       │   ├── streak: number         # Valeur du streak à cette date
│       │   ├── platform: string       # Plateforme utilisée (iOS, Android, Web)
│       │   ├── device: string         # Informations sur l'appareil
│       │   └── sessions: array        # Détails des sessions de la journée
│       └── ...
└── ...
```

## Prochaines étapes

1. Implémenter le `courseProgressService` pour suivre la progression de l'utilisateur dans chaque parcours
2. Développer le système de quiz avec stockage des résultats et statistiques
3. Mettre en place le suivi des connexions quotidiennes et calcul des streaks
4. Ajouter le cache local pour permettre l'utilisation hors-ligne
5. Développer les Cloud Functions pour les traitements complexes côté serveur 