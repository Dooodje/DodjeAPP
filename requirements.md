# **Prompt Requirements pour Cursor :**

## **1. Contexte et objectif**

Je souhaite créer une application mobile nommée **Dodje**, développée en **React Native**, destinée à être déployée sur **Android** et **iOS**.

Cette application aura pour but d’offrir **une éducation financière** aux utilisateurs, en proposant principalement :

1. Des **connaissances financières** via des vidéos classées par thèmes (Bourse, Crypto) et par niveaux (Débutant, Avancé, Expert).
2. Des **fonctionnalités IA** pour former et accompagner l’utilisateur.

**Public cible :**

- Personnes novices en finances personnelles (étudiants, jeunes professionnels).
- Personnes de niveau intermédiaire souhaitant approfondir leurs connaissances.

### **Objectifs spécifiques :**

1. **Éducation** : Offrir des cours et modules financiers structurés sous forme de séries vidéo appelées aussi des parcours (chapitres, leçons, quiz…).
2. **Personnalisation** : Analyser le profil de l’utilisateur (objectifs financiers, revenu, tolérance au risque, horizon d’investissement) pour proposer des recommandations et un plan d’action individuel.
3. **Accessibilité** : Rendre le contenu ludique et facile à comprendre, même pour des utilisateurs sans background financier.
4. **Fidélisation** : Mettre en place des fonctionnalités de gamification (badges, succès, points) pour encourager la progression et l’engagement.

> Note : L’objectif de cette première étape est de développer la structure générale de l’application ainsi que ses différentes fonctionnalités, avec un design par page basique, épuré et moderne qui servira de base de test. Le design final sera intégré ultérieurement.
> 

---

## **2. Chartre graphique et configuration Firebase**

### **2.1. Charte graphique**

- **Couleurs :**
    - Primaire : `#000000`
    - Secondaire : `#059212`, `#06D001`, `#9BEC00`, `#F3FF90` (pour les boutons, call-to-action, etc.)
    - Couleur de fond de l’ensemble des pages : `#0A0400`
- **Typographies :**
    - Logotype : *Arboria Bold*
    - Déclinaisons : *Arboria Bold Italic, Light, Medium Italic, Medium, Book Italic, Book*

### **2.2. Configuration Firebase**

```
js
CopierModifier
firebaseConfig = {
  apiKey: "AIzaSyDgDWiRJuwuG6jnqwKyIVlNEAiNTTu6jdQ",
  authDomain: "doodje-455f9.firebaseapp.com",
  projectId: "doodje-455f9",
  storageBucket: "doodje-455f9.firebasestorage.app",
  messagingSenderId: "612838674498",
  appId: "1:612838674498:web:ba9f10dd9aa0d0a3d01ddb",
  measurementId: "G-PTCZR9N93R"
}

```

- L’application devra intégrer **Firebase** pour la gestion de l’authentification et le stockage des données utilisateur (Cloud Firestore).
- Si besoin des données de configuration Android/iOS pour l’intégration Firebase, n’hésitez pas à me les demander.

---

Je te laisse intégrer et installer les composants/bibliothèques nécessaires au bon développement de l’application 

# **3. Pages de l’application**

## **3.1. Page d’accueil**

### **Structure de la page d'accueil** :

- **Disposition** :
    - La page d'accueil sera divisée en **2 sections principales** :
        - **Section "Bourse"**
        - **Section "Crypto"**
    - Chaque section comporte **3 sous-pages** correspondant aux niveaux des parcours :
        - **Sous-page Débutant**
        - **Sous-page Avancé**
        - **Sous-page Expert**
    - Chaque sous-page contient des **parcours** hiérarchisés, de **n°1 à n** (par exemple, 1 à 5 parcours).
    - Les **parcours** seront disposés sous forme d’un **arbre interactif**, inspiré du design de **Duolingo**, où :
        - **Le 1er parcours** est en bas de la sous-page.
        - **Le dernier parcours** est en haut.
        - Les d’arbres des différentes pages seront stockés dans firebase 
    - L'utilisateur arrive **automatiquement** sur le **dernier parcours débloqué**.

---

### **Comportement de la page d'accueil** :

- **Initialisation** :
    - À l’ouverture de l’application, l’utilisateur est dirigé vers la **section** et le **niveau** choisi précédemment, ou vers le **premier parcours** de la section et du niveau **Débutant** si c'est sa première connexion.
    - Lors du **changement de thème** (par exemple, **Bourse** → **Crypto**), l'utilisateur arrive directement sur le **dernier parcours visionné** dans la sous-page correspondante.
- **Déblocage des parcours** :
    - Pour débloquer un **parcours n** dans une sous-page, l’utilisateur doit **avoir terminé le parcours n-1** de la même sous-page.
    - L'utilisateur peut également **débloquer immédiatement** un parcours en utilisant des **Dodji** (monnaie virtuelle).
    - Les **parcours bloqués** seront affichés avec un **cadenas**.

---

### **Composants et animations de la page d'accueil** :

### **Affichage des parcours** :

- **Disposition des parcours sur l’arbre** :
    - Chaque **parcours** est représenté par une image tiré de firebase storage sur l'arbre, affiché en fonction de la **hiérarchie** définie pour chaque **niveau**.
    - Les **parcours** sont positionnés en **(x, y)** dans l’image de l'arbre, selon leur **niveau** et leur **thème**. Ces **positions** sont stockées dans **Firestore**.
    - Les pastilles interactives de parcours sont des images tirés de firebase storage et sont positionnés en (x,y)

### **Animations et transitions des parcours** :

### **Statut "blocked" (verrouillé)** :

- Lorsqu'un parcours est en statut **"blocked"**, un **cadenas** en surbrillance est sur l’image circulaire du parcours.

### **Statut "completed" (complété)** :

- Lorsqu'un parcours est **complété**, l'**anneau** d'avancement disparaît avec une animation de **scale down**.
- Une **coche de validation** apparaît avec une animation de **translation** et **scale** (pour qu’elle grandisse à son apparition).

### **Statut "deblocked" (débloqué)** :

- Lorsque le parcours devient **débloqué**, le **cadenas disparaît** et un **anneau** apparaît autour du parcours, indiquant qu’il est maintenant disponible pour l'utilisateur.
- Animation de **disparition du cadenas** et **apparition de l'anneau** avec un effet de **scale up** et un mouvement fluide.

### **Comportement du parcours et animations de mouvement** :

- **Disparition et apparition de l'anneau** : Lorsqu'un parcours est marqué comme terminé, l'anneau se **réduit à zéro** en taille, puis disparaît.
- **Progression de l'utilisateur** : L'**anneau** autour du parcours change de couleur au fur et à mesure que l'utilisateur regarde les vidéos (de l’anneau **vide** au **vert** pour chaque vidéo vue).

### **Pop-up de nom de parcours** :

- Lors du **scrolling vertical** (naviguer dans l’arbre), le **nom du parcours** apparaît lorsque le bouton de ce parcours est **au centre de l'écran**.
- Le nom du parcours apparaît avec une **transition d’opacité** : il devient pleinement visible lorsqu’il est centré, puis disparaît progressivement au fur et à mesure que le parcours quitte le centre.

---

### **Affichage dynamique de l'arbre et gestion de la navigation entre les sous-pages** :

### **Arbre d'apprentissage** :

- Chaque sous-page (Débutant, Avancé, Expert, pour Bourse et Crypto) contient **une image** d’arbre qui sera **différente** pour chaque niveau.
- **Les parcours** sont positionnés sur l’arbre en fonction des **coordonnées (x, y)** définies dans **Firestore**.
    - **Image d'arbre responsive** : L'image est **plus grande** que l'écran et peut être **scrollée verticalement** par l'utilisateur pour naviguer entre les parcours.
    - L'**image d'arbre** est récupérée depuis **Firebase Storage** en fonction du **niveau** et du **thème** de l'utilisateur.

### **Navigation entre les sous-pages** :

- **Navigation verticale (scroll)** : L’utilisateur peut **faire défiler l'arbre verticalement** pour voir tous les parcours dans une sous-page.
- **Navigation horizontale** (swipe) : L’utilisateur peut **swipe** entre les **niveaux** (Débutant, Avancé, Expert) avec des **flèches de navigation** :
    - **Sous-page Débutant** : flèche à droite pour aller à **Avancé**.
    - **Sous-page Avancé** : flèche à gauche pour revenir à **Débutant**, flèche à droite pour aller à **Expert**.
    - **Sous-page Expert** : flèche à gauche pour revenir à **Avancé**.

---

### **Fonctionnalités et éléments supplémentaires** :

### **Streak et Dodji** :

- **Streak de connexion** (en haut à gauche) : Un **compteur de streak** sera affiché pour montrer le nombre de jours consécutifs où l'utilisateur s'est connecté.
- **Nombre de Dodji** (en haut à droite) : L'**argent virtuel** (Dodji) de l'utilisateur, affiché en haut à droite.
- Lorsqu’un utilisateur **débloque un parcours avec des Dodji**, l'**anneau de progression** apparaîtra sur le parcours déverrouillé, représentant le nombre de vidéos.

### **Choix de la section et niveau** :

- **Choix de la section (Bourse/Crypto)** en haut, au milieu de la page.
- **Niveau de la sous-page** actuelle (Débutant, Avancé, Expert), affiché au-dessus du filtre par thème.

### **Récupération et gestion des données** :

- Les **données des parcours** sont stockées dans **Firestore** (collection "parcours").
    
    ![image.png](attachment:5b2d0ea1-6599-458f-ad9c-2e7f430d57db:image.png)
    
- Le **statut** de chaque parcours : "blocked", "completed", "deblocked" est géré et stockés dans les metadonnées utilisateurs

### **Reconnexion ultérieure** :

- Lorsqu’un utilisateur revient après une **reconnexion**, il sera dirigé vers la **dernière sous-page du parcours** qu’il a visionnée ou le premier parcours du niveau **Débutant** s’il s’agit de sa première connexion.

---

### **Caractéristiques techniques et de performance** :

- **Images de l'arbre** : Les images sont **dynamiques et responsive**, mais peuvent nécessiter une gestion efficace des **ressources et de la mémoire** (notamment pour les grandes images). Pensez à optimiser les images pour une performance optimale.
- **Performance de l'animation** : Les animations de **mouvement** (cadenas, coche, anneau) doivent être fluides et réactives, notamment avec **React Native Reanimated** pour garantir de bonnes performances, même sur des appareils plus anciens.

---

## **3.2. Page parcours**

### **1. Contexte général**

La **Page Parcours** s’affiche lorsque l’utilisateur **clique sur un parcours** depuis la page d’accueil. Elle doit présenter **toutes les vidéos** (et leur statut) relatives à ce parcours, ainsi que le **quiz** de fin de parcours.

---

### **2. Design et structure visuelle**

1. **Design global**
    - Comme pour la page d’accueil, le **design** de la Page Parcours s’appuie sur **une image** représentant l’arbre ou la structure interne du parcours.
    - Cette image varie **en fonction du nombre de vidéos** présentes dans le parcours.
    - Les différentes **branches** ou **chemins** reliant les vidéos (et éventuellement le quiz) seront inclus dans l’image.
2. **Stockage et récupération de l’image**
    - Les images sont **hébergées** et **stockées** dans Firebase (Firestore ou Firebase Storage).
    - Chaque parcours dispose d’une image **spécifique** indiquant la structure des vidéos.
    - Au chargement de la page, l’application doit **récupérer l’URL** de l’image correspondante via la base de données.
3. **Positionnement des vidéos sur l’image**
    - Les **boutons de vidéos** (ou zones interactives) sont placés sur l’image via des **coordonnées (x, y)**, exactement comme sur la page d’accueil.
    - Chaque vidéo du parcours aura donc un **bouton** positionné à une coordonnée spécifique pour que l’utilisateur puisse cliquer dessus et accéder à la **lecture de la vidéo** (ou au déblocage si c’est verrouillé).

---

### **3. Contenu et fonctionnalités de la Page Parcours**

1. **Liste des vidéos associées au parcours**
    - **Informations par vidéo** :
        - Titre de la vidéo
        - Durée de la vidéo (indicative)
        - État de déblocage (verrouillée, disponible, en cours…)
    - **Icône de cadenas** : si la vidéo est verrouillée, un **logo cadenas** en surbrillance se superpose au bouton vidéo (comme la logique de cadenas sur la page d’accueil).
2. **Quiz de fin de parcours**
    - Le **quiz** est également **représenté sur l’image**, souvent à la fin du parcours (après la dernière vidéo).
    - Pour le **mettre en avant**, vous pouvez lui appliquer un **design légèrement différent** (couleur de bouton plus marquante, contour spécifique, etc.).
    - Les informations de base sur le quiz (titre “Quiz”, éventuellement nombre de questions) peuvent être affichées dans un petit pop-up ou descriptif, mais l’essentiel sera sur la **Page Quiz** elle-même.
3. **Animation / branches**
    - Des **petites branches** relient visuellement les vidéos entre elles, indiquant l’ordre à suivre.
    - L’organisation globale (et les branches) est incluse dans l’**image de fond**.
4. **Statut et déblocage des vidéos**
    - **Vidéo complétée** : lorsqu’un utilisateur a visionné **au moins 90%** de la vidéo, on considère cette vidéo comme **complétée**.
    - **Logique de déblocage** :
        - La **1re vidéo** du parcours est **débloquée** par défaut.
        - Chaque vidéo suivante se **débloque** automatiquement si l’utilisateur a **complété** la vidéo précédente.
        - Il est également possible de **débloquer** n’importe quelle vidéo en **utilisant des Dodji** (monnaie virtuelle de l’application). (Les prix de déblocage sont gérés dans Firestore, collection `token_dodji` sous-collection `expenses`.)

---

### **4. Gestion des états et interactions**

1. **Blocage / déblocage**
    - Si l’utilisateur n’a pas encore le droit d’accéder à une vidéo, un **cadenas** s’affiche et il ne peut pas lancer la vidéo.
    - **Interaction de déblocage** : un clic sur la vidéo verrouillée doit proposer (par exemple) un pop-up informant de la possibilité de la **débloquer avec des Dodji**.
2. **Lecture d’une vidéo**
    - Quand l’utilisateur clique sur une vidéo **débloquée**, il est redirigé vers la **Page Lecture Vidéo** (ou un composant vidéo) pour visionner le contenu.
    - À la **fin** de la vidéo (ou si l’utilisateur dépasse **90%** de visionnage), la **base de données** est mise à jour pour indiquer que la vidéo est **complétée**.
    - Cela peut **débloquer** la vidéo suivante (changement d’état dans Firestore).
3. **Statut du quiz**
    - Le **quiz** reste verrouillé tant que toutes les vidéos du parcours ne sont pas complétées (ou bien l’utilisateur peut choisir de le débloquer avec des Dodji si cette logique s’applique aussi au quiz).
    - Une fois **toutes les vidéos** du parcours complétées, le quiz devient **accessible**. Un bouton coloré ou un design distinct permet à l’utilisateur de **lancer** le quiz (redirige vers la **Page Quiz**).

---

### **5. Données à stocker / récupérer**

### **5.1. Métadonnées du parcours (Firestore)**

![image.png](attachment:cf959176-09ca-4845-8b98-2a7ff9b6710e:image.png)

### **5.2. Métadonnées des vidéos**

![image.png](attachment:b3eb3a22-fd7a-492f-a8e7-89607619f119:image.png)

### **5.3. Gestion du quiz**

- On peut enregistrer le **statut** du quiz (pas encore accessible, accessible, complété) en base pour chaque utilisateur.
- Les détails du quiz (nb de questions, récompenses, etc.) peuvent être récupérés sur la **Page Quiz**.

---

### **6. Navigation et ergonomie**

1. **Retour à la page d’accueil**
    - Prévoir un bouton ou un moyen de **revenir** à la page d’accueil (par exemple, un bouton “Retour” ou un icône de flèche en haut à gauche).
2. **Page responsive et défilement**
    - L’image de fond peut être **plus grande** que l’écran, permettant un **scroll vertical** (et/ou horizontal, selon le design) pour visualiser toutes les vidéos du parcours.
3. **Adaptation du design**
    - Comme le nombre de vidéos dans un parcours peut varier, l’**image et la disposition** doivent être adaptées (et l’affichage des boutons vidéos via leurs coordonnées doit se faire en fonction du design).
    - Si le parcours ne comporte qu’une seule vidéo, le design doit rester cohérent (ou un design simplifié).

---

### **7. Recommandations techniques**

1. **Images en haute résolution**
    - Les images utilisées pour représenter le parcours doivent être **optimisées** afin d’éviter de trop lourdes charges réseau.
    - Format **PNG** ou **JPEG** conseillé, avec éventuelles compressions.
2. **Animations / transitions**
    - Possibilité d’animer (comme sur la page d’accueil) les états de verrouillage/déverrouillage (affichage du cadenas, disparition, etc.).
    - Les **icônes** (cadenas, coche, etc.) peuvent être animées via **React Native Reanimated** ou des animations plus simples (opacité, scale, etc.) via `Animated` de React Native.
3. **Logique de complétion**
    - L’application doit écouter l’état du visionnage de la vidéo (par exemple, un **événement** quand l’utilisateur atteint 90% du temps).
    - La **base de données** (Firestore) doit être mise à jour pour marquer la vidéo comme **complétée** et **débloquer** la suivante si besoin.

## **3.3. Page vidéo**

### **1. Contexte général**

La **Page Vidéo** est accessible lorsqu’un utilisateur clique sur une vidéo précise depuis la **Page Parcours**. Elle doit permettre :

- La **lecture** de la vidéo.
- La **navigation** vers d’autres vidéos du même parcours.
- L’affichage d’**informations** complémentaires (titre, description).
- L’affichage d’**annonces publicitaires** (Ads) en début de vidéo si nécessaire.

---

### **2. Structure et design de la Page Vidéo**

1. **Layout principal** :
    - **Bouton “retour”** en haut à gauche : renvoie directement à la **Page Parcours** dont la vidéo est issue.
    - **Zone vidéo** : pour afficher la vidéo (incluant le mode plein écran, la gestion du player, etc.).
    - **Titre et description** : juste en dessous de la vidéo.
    - **Liste des vidéos suivantes** : pour encourager l’utilisateur à poursuivre le visionnage dans le même parcours.
2. **Affichage adaptatif** :
    - La page doit rester **responsive** pour différents formats d’écrans.
    - Le **mode paysage** en plein écran doit être correctement géré pour la vidéo.
3. **Design précis** (optionnel) :
    - Vous pouvez intégrer un **fond** ou un **thème** léger rappelant la page Parcours (couleurs, éléments de charte graphique).
    - Les **contrôles de la vidéo** (bouton lecture/pause, barre de progression, bouton plein écran, etc.) doivent être suffisamment grands et clairs pour un usage tactile.

---

### **3. Fonctionnalités de lecture vidéo**

1. **Composant vidéo** :
    - Utiliser **Expo AV** (ou un équivalent, si nécessaire) pour **intégrer la lecture** de la vidéo dans l’application.
    - Gérer la **progression** de la vidéo, la **mise en pause**, le **mode plein écran**, etc.
2. **Mode plein écran (paysage)** :
    - L’utilisateur doit pouvoir appuyer sur un **bouton plein écran** pour basculer la vidéo en **mode paysage** plein écran.
    - À la fermeture du plein écran, revenir à l’affichage normal de l’application.
    - Assurer la **rotation automatique** de l’écran si le téléphone est pivoté, ou proposer un **mode forcé** en orientation paysage.
3. **Paramètres de la vidéo** :
    - Contrôle du **volume** et de la **barre de progression** (accélérer, reculer).
    - Possibilité de passer en **muet** (optionnel) et d’ajuster la qualité (en fonction de la disponibilité de la source vidéo).
4. **Comptabilisation du visionnage** :
    - Vous pouvez stocker dans Firestore le **pourcentage** de la vidéo déjà visionné.
    - La vidéo est considérée **“complétée”** si l’utilisateur a vu **90%** (logique déjà mentionnée pour débloquer la suite des vidéos).

---

### **4. Intégration des ads (Google AdMob)**

1. **Annonce au début de la vidéo** :
    - Avant le démarrage de la vidéo, afficher une **publicité** gérée par **Google AdMob**.
    - Gérer la logique de **skippable** ou non-skippable** selon vos choix (et la configuration AdMob).
    - Vérifier la **compatibilité** avec le composant vidéo (s’assurer qu’au terme de l’annonce, on lance la vidéo proprement).
2. **Positions possibles** :
    - **Publicité interstitielle** : peut être lancée en plein écran avant le passage à la lecture vidéo.
    - **Bannière** (optionnelle) : si vous souhaitez aussi afficher une bannière dans la page, en bas de la zone vidéo ou plus bas, veillez à ce qu’elle ne gêne pas la lecture.
3. **Gestion du timing** :
    - L’annonce se lance **une seule fois** avant la lecture, ou éventuellement après un certain temps si l’utilisateur revient sur cette page.

---

### **5. Titre, description, et liste des vidéos suivantes**

1. **Titre et description** :
    - Affichés **sous la zone vidéo**.
    - Récupérés depuis **Firebase** (le document de la vidéo), contenant :
        - `title` : nom de la vidéo.
        - `description` : texte court décrivant le contenu.
2. **Liste des vidéos suivantes** :
    - Présenter les **autres vidéos** du même parcours pour faciliter la navigation.
    - Possibilité d’un **carrousel** ou d’une **liste horizontale** (miniatures + titres).
    - Chaque élément de la liste, cliqué, renvoie sur la **même page** (mais chargée avec la vidéo correspondante).
3. **Affichage du statut** (verrouillé / débloqué) pour les vidéos suivantes :
    - Si certaines vidéos ne sont pas débloquées, vous pouvez afficher un **cadenas** ou un message avertissant que l’utilisateur doit terminer la vidéo courante ou payer en Dodji pour débloquer.

---

### **6. Données et intégration Firebase**

1. **Récupération de la vidéo** :
    - Les **vidéos** peuvent être stockées dans une base ou référencées par **URL** (hébergement streaming).
    - Dans Firestore, chaque vidéo aura :
        
        ![image.png](attachment:6a445274-7639-4aa4-9c27-b40a8b276bcf:image.png)
        
2. **Mise à jour de l’avancement** :
    - Durant la lecture, quand l’utilisateur atteint **90%** de la vidéo, mettre à jour le champ `status` = `"completed"` (ou similaire) dans la base, pour indiquer que la vidéo est terminée.
    - Mettre également à jour la vidéo **suivante** si la logique de déblocage l’exige (ex. `status = "unlocked"`).
3. **Gestion des Dodji** :
    - En cas de vidéo **verrouillée**, vérifier si l’utilisateur peut la **débloquer** avec un certain montant de Dodji (voir collection `token_dodji`).
    - Si l’utilisateur paie le coût en Dodji, mettre à jour l’information dans Firestore pour le **déblocage** de cette vidéo.

---

### **7. Navigation et contrôles**

1. **Bouton “Retour”** (en haut à gauche) :
    - Renvoie à la **Page Parcours**.
    - Utiliser une icône de **flèche** ou un label “Retour”.
2. **Gestion du “scroll” vertical** :
    - Prévoir un **scroll** si la description du contenu et la liste des vidéos suivantes sont trop longues à l’écran.
3. **Transitions** :
    - Possibilité d’utiliser des **animations** (fade-in, slide-in) pour l’ouverture de la Page Vidéo ou l’affichage du player, mais ce n’est pas obligatoire.
    - Important : conserver une **performance fluide** pour la lecture vidéo.

---

### **8. Recommandations diverses**

1. **Performances** :
    - La lecture vidéo peut être gourmande en ressources (data, CPU). Assurez-vous d’**optimiser** la mise en cache ou le buffering.
    - Gérer les **connexions plus lentes** : proposer un changement de **qualité** (si possible) ou un **buffer** suffisant.
2. **Sécurité / Droits d’accès** :
    - Vérifiez que la vidéo est bien **débloquée** avant de permettre le lancement (sans contournement).
    - Gérer la **logique** : si l’utilisateur force l’accès par URL, valider si le parcours est débloqué côté back-end.
3. **Suivi Analytics** (optionnel) :
    - Vous pouvez configurer des **événements** pour savoir quelles vidéos sont le plus regardées, où les utilisateurs abandonnent la lecture, etc.

## **3.4. Page quiz**

### **1. Contexte général**

La **Page Quiz** permet à l’utilisateur d’évaluer ses connaissances sur le sujet du parcours.

Elle est **bloquée** tant que l’utilisateur n’a pas **complété** toutes les vidéos du parcours. Une fois accessible, l’utilisateur peut :

1. Consulter les **règles** du quiz (page introductive).
2. Répondre aux **questions** (page de quiz).
3. Obtenir un **résultat final**, accompagné d’éventuelles **récompenses** en **Dodji** et/ou **badge**.

---

### **2. Structure générale**

1. **Page introductive (Règles du quiz)**
    - **Nombre de questions** : indiquer le total de questions du quiz (ex. 10 questions).
    - **Badges et Dodji à la clé** : préciser la **récompense** potentielle si le quiz est **réussi**.
    - **Seuil de réussite** : % de bonnes réponses nécessaires (ex. 70%).
2. **Page de quiz** (Question/Réponse)
    - **Affichage d’une question** : titre de la question + un court descriptif si nécessaire.
    - **Choix de réponse(s)** : liste de réponses à sélectionner (format QCM, vrai/faux, etc.).
    - **Bouton de validation** : pour valider la réponse et afficher l’explication.
    - **Retour visuel (correct/faux)** : design distinct (couleur, encadré, icône) pour signaler une bonne ou mauvaise réponse.
    - **Paragraphe d’explication** : clarifie pourquoi la réponse est bonne ou fausse.
    - **Barre de progression** : montre combien de questions ont été traitées et combien il en reste.
3. **Page de résultat final**
    - **Note globale** : résumé du nombre de bonnes réponses / total.
    - **Récompenses** : Dodji gagnés et/ou badge obtenu, si le quiz est **réussi**.
    - **Bouton “Recommencer”** : pour retenter le quiz en cas d’échec ou pour s’entraîner davantage.
    - **Bouton “Parcours Suivant”** : redirection vers le **prochain parcours** hiérarchique du même domaine/niveau (ou vers la page d’accueil si c’était le dernier parcours).

---

### **3. Règles et logique du quiz**

1. **Blocage du quiz**
    - Par défaut, le quiz est **verrouillé**.
    - Il se **débloque** lorsque l’utilisateur a **visionné/complété** toutes les vidéos du parcours (ou débloqué manuellement avec des Dodji si vous l’autorisez pour le quiz également).
2. **Seuil de réussite**
    - Le quiz est considéré comme **“réussi”** si l’utilisateur obtient **≥ 70%** de bonnes réponses.
        - Exemple : sur 10 questions, il faut **7 bonnes réponses**.
3. **Récompenses**
    - Si le quiz est **réussi**, l’utilisateur reçoit des **Dodji** (et/ou un **badge**).
    - Le montant de Dodji ou le type de badge peut être défini dans Firestore (métadonnées du quiz).
4. **Possibilité de refaire le quiz**
    - Même si l’utilisateur échoue, il peut **recommencer**. Il n’y a pas de limite d’essais.
    - Les résultats sont **archivés** pour des statistiques ou pour afficher la meilleure note.
5. **Stockage des résultats**
    - Les résultats du quiz (score, date, nombre d’essais) sont stockés dans les **métadonnées utilisateurs** dans Firestore.
    - Cela permet de savoir si un utilisateur a déjà réussi le quiz, et de gérer la récompense de Dodji (pour éviter de les regagner en boucle, par exemple).

---

### **4. Page introductive (Règle du quiz)**

1. **Contenu** :
    - **Titre** : “Règles du quiz” ou “Informations avant de commencer”.
    - **Nombre de questions** : par exemple, “Ce quiz comporte 10 questions.”
    - **Seuil de réussite** : ex. “Vous devez obtenir au moins 70% de bonnes réponses pour réussir.”
    - **Récompenses** (Dodji, badges) : ex. “En cas de réussite, vous recevrez 50 Dodji et le badge “Débutant en Bourse””.
2. **Bouton “Commencer le quiz”** :
    - Permet de passer à la **Page Quiz** proprement dite.
    - Vérifie que le quiz est **débloqué**. Sinon, afficher un message “Vous devez d’abord compléter toutes les vidéos.”

---

### **5. Page de quiz (questions/réponses)**

1. **Affichage d’une question** :
    - Récupérer depuis Firestore la question, le type de question, la liste des réponses possibles, etc.
2. **Choix de réponse** :
    - Les réponses peuvent être présentées sous forme de **boutons** (radio buttons) ou **cases à cocher**.
    - L’utilisateur sélectionne une (ou plusieurs) réponse et appuie sur un **bouton de validation**.
3. **Animation / Retour visuel** :
    - Lors de la validation, montrer un design différent selon que la réponse est bonne ou fausse (par exemple, colorer la réponse en **vert** si bonne, en **rouge** si mauvaise).
    - Afficher un **court texte explicatif** (stocké dans Firestore) pour clarifier la bonne réponse.
4. **Barre de progression** :
    - **Progress bar** qui se remplit au fur et à mesure.
    - Mise à jour après chaque validation de question.
5. **Navigation entre questions** :
    - Après validation, un **bouton** “Question suivante” apparaît pour passer à la question suivante.
    - À la dernière question, passer à la **Page de résultat final**.

---

### **6. Page de résultat final**

1. **Score** :
    - Afficher la note finale, ex. “7/10”.
    - Préciser le **pourcentage** si besoin, ou un **message** (ex. “Félicitations, vous avez réussi le quiz !”).
2. **Récompenses** :
    - Si l’utilisateur a atteint le seuil de 70%, afficher le **gain de Dodji** et/ou la **remise de badge**.
    - Mettre à jour Firestore pour créditer les Dodji dans le compte utilisateur.
3. **Bouton “Recommencer”** :
    - Permet de retenter le quiz, même s’il est réussi, pour s’entraîner.
    - Les résultats sont enregistrés, mais vous pouvez décider si on récompense à nouveau ou pas.
4. **Renvoie l’utilisateur :**
    - Proposer 2 boutons “Recommencer” et “Continuer”
    - Renvoyer l’utilisateur à la sous-page d’accueil du même domaine et niveau correspondant
    - Si l’utilisateur à réussi le quiz, lancé l’animation de déblocage du parcours suivant lors du renvoi sur la sous-page correspondante

---

## **7. Données à  récupérer dans Firestore**

1. **Métadonnées du quiz** (collection “quizzes” ou dans la fiche du parcours) :
    
    ![image.png](attachment:532f027a-684d-4ad4-a471-d5fed22e4541:image.png)
    
    ![image.png](attachment:8734f044-8592-4a37-8c74-f1a107f240fe:image.png)
    
2. **Données par question** :
    
    ![image.png](attachment:366369ff-f626-4771-9d67-c1eaebeee80e:image.png)
    
    ![image.png](attachment:56938f4e-9aca-447f-b9f9-3c6077f040aa:image.png)
    
3. **Suivi utilisateur** :
    - `bestScore` pour ce quiz, `attempts` (nombre de tentatives).
    - `isQuizCompleted` : booléen indiquant si l’utilisateur a déjà atteint 70%.
    - `dodjiEarned` : pour éviter de donner des Dodji multiples si c’est un one-time reward.

---

## **8. Navigation et ergonomie**

1. **Bouton “Retour”** ou “Fermer” (facultatif) :
    - Peut renvoyer à la **Page Parcours** si l’utilisateur veut abandonner le quiz.
2. **Scrolling** :
    - Certaines questions peuvent être longues (descriptions, explications), donc prévoir un **scroll vertical** au besoin.
3. **Design et feedback** :
    - Soigner les visuels pour indiquer clairement **bonne/mauvaise réponse**.
    - Donner un **retour immédiat** (animation, changement de couleur, message) au moment de valider la question.
4. **Expérience utilisateur** :
    - Possibilité de **masquer** les réponses après la validation pour éviter les confusions.

---

## **9. Points supplémentaires / Recommandations**

1. **Gestion des corrections** :
    - L’utilisateur peut voir **quelles réponses** étaient correctes/faux après validation, pour comprendre ses erreurs.
2. **Accessibilité** :
    - Rendre la page navigable pour des utilisateurs ayant des difficultés d’interaction ou de vision.
3. **Performances** :
    - Les quiz sont légers (texte), donc pas d’exigences particulières.
    - Assurer la **sauvegarde** de la progression si l’utilisateur quitte en cours de quiz
4. **Évolutions futures** :
    - Possibilité d’ajouter un **timer** (temps limite).
    - Possibilité de rendre certaines questions adaptatives (logique conditionnelle).

## **3.5. Page DodjeIA**

### **1. Contexte général**

La **Page DodjeIA** est destinée à présenter une **fonctionnalité d’intelligence artificielle** dans l’application **Dodje**. Dans un premier temps (**MVP**), elle se limitera à :

1. **Analyser le profil investisseur** de l’utilisateur via un **questionnaire de 9 questions**.
2. **Fournir une recommandation** (ou des conseils d’investissement) basée sur ce profil.

D’autres fonctionnalités IA viendront s’ajouter ultérieurement.

---

### **2. Structure de la page**

1. **Message d’introduction**
    - Un petit paragraphe expliquant que **DodjeIA** vise à aller plus loin que la simple formation, et que d’autres fonctionnalités IA arrivent bientôt.
    - Par exemple : “Bienvenue dans DodjeIA, votre conseiller financier virtuel. Pour l’instant, nous vous proposons une **analyse de votre profil investisseur**, mais d’autres fonctionnalités arriveront très bientôt !”
2. **Section “Analyse de profil et recommandation d’investissement”**
    - C’est la **seule section** disponible pour le MVP.
    - Un **bouton** (ou une zone) permet de démarrer le **questionnaire** si l’utilisateur ne l’a pas encore rempli, ou d’**afficher les résultats** si le questionnaire est déjà complété.

---

## **3. Questionnaire DodjeIA**

1. **Logique d’affichage** :
    - Lorsque l’utilisateur se rend pour la **1re fois** sur la Page DodjeIA, un **questionnaire** de **9 questions** apparaît.
    - Les questions sont stockées dans **Firestore**, identifiées par un **ID** propre au questionnaire.
    - Les réponses sont **enregistrées** dans les **métadonnées utilisateurs** (dans Firestore) pour un accès futur.
2. **Contenu du questionnaire** :
    - Les **9 questions** portent sur le **profil investisseur** : tolérance au risque, horizon d’investissement, objectifs financiers, etc.
    - Format possible : QCM, échelle de 1 à 5, etc.
3. **Complétion du questionnaire** :
    - Après que l’utilisateur ait **validé** toutes les questions, un **résumé** des réponses est sauvegardé en base.
    - Un **prompt** peut être envoyé à **ChatGPT** (ou une API IA) pour générer un **texte** d’analyse.
4. **Possibilité de modification / retake** :
    - Choix de permettre à l’utilisateur de **refaire** le questionnaire plus tard pour mettre à jour son profil

---

## **4. Analyse de profil et recommandations**

1. **Appel à l’API ChatGPT / IA** :
    - Une fois le questionnaire complété, l’application construit un **prompt** résumant les réponses.
    - Le prompt est envoyé à l’**API** (ChatGPT ou un modèle local) pour générer une **analyse** et des **recommandations d’investissement**.
2. **Affichage du résultat** :
    - L’application affiche **un texte** : “Votre profil investisseur est …, nous vous suggérons de …”
    - Cette analyse est **stockée** dans les métadonnées utilisateur pour qu’il puisse la **consulter** à tout moment, sans refaire un appel à l’API.
3. **Mise à jour des données** :
    - Chaque fois que l’utilisateur **modifie** ses réponses, l’application peut **rafraîchir** l’analyse en appelant de nouveau l’IA ou en mettant à jour le texte.
4. **Disclaimer** :
    - Ajouter un petit **disclaimer** indiquant que les **recommandations** sont générées par un outil IA et ne constituent pas un **conseil financier professionnel**.

---

## **5. Consultation de l’analyse**

1. **Cas utilisateur déjà profilé** :
    - Si l’utilisateur **revient** sur la Page DodjeIA **après** avoir complété le questionnaire, la page affiche directement la **synthèse de son profil** et ses **recommandations**.
    - Possibilité de proposer un **bouton** pour “Modifier mon questionnaire” / “Mettre à jour mon profil”.
2. **Cas utilisateur non profilé** :
    - Afficher un **bouton** “Commencer le questionnaire” (ou “Démarrer l’analyse”) qui lance le **questionnaire**.
3. **Évolutions futures** (placeholder) :
    - Afficher un **message** du style “D’autres fonctionnalités IA arrivent bientôt ! Restez à l’écoute.”

---

## **6. Données à stocker dans Firestore**

1. **Questionnaire** :
    - Collection contenant :
        - L’**ID** du questionnaire.
        - Les **questions** (texte, type, options).
2. **Réponses utilisateur** :
    - Dans la **sous-collection** `users/{userId}/dodjeIA_profile/`, stocker :
        - Les **réponses** aux 9 questions.
        - La **date** de la dernière mise à jour.
        - L’**analyse** générée par l’IA (texte).
3. **Logs d’API** (optionnel) :
    - Vous pouvez consigner l’historique des **appels** à ChatGPT (date, prompts, réponse) pour debug.

---

## **7. Navigation et ergonomie**

1. **Format du questionnaire** :
    - Possible d’avoir un **formulaire** en plusieurs étapes (1 question par écran) ou un **formulaire unique**.
    - Ajouter une **barre de progression** (“Question 3/9”).
2. **Animations / transitions** :
    - Optionnel, mais peut améliorer l’expérience (ex. slider entre questions, fade-in des recommandations IA).

---

## **8. MVP vs évolutions futures**

1. **MVP** :
    - Une seule **section** : analyse du profil investisseur.
    - 9 questions, réponses stockées, envoi à l’API, affichage du texte de recommandation.
2. **Évolutions futures** :
    - Ajout d’autres **sections** IA (par ex. : calcul de budget, chat financier en temps réel, etc.).
    - Mise en place d’une **logique plus complexe** (par ex. : multiples algorithmes, interactions conversationnelles).
    - Système de **notifications** ou de **chatbot** plus approfondi.

---

## **9. Points techniques et recommandations**

1. **Intégration API** :
    - Gérer l’**authentification** et l’**appel** à ChatGPT ou un modèle GPT-like (API key, prompts, envoi/retour JSON).
    - Prévoir une **gestion d’erreur** si l’API est indisponible ou si le quota est dépassé.
2. **Performance et usage** :
    - Les appels IA peuvent être **coûteux** ou **limités** : vous pouvez mettre en place un **cache** pour ne pas relancer le même calcul si l’utilisateur n’a pas changé ses réponses.
3. **Sécurité / Confidentialité** :
    - Les réponses au questionnaire peuvent être considérées comme **données personnelles**. Veiller à sécuriser l’accès à Firestore.
    - Fournir un **disclaimer** expliquant que l’analyse IA n’est pas un conseil financier officiel.

### Couts DodjeIA:

- Chaque analyse générée avec API coute 500 dodji
- Si l’utilisateur n’a pas les dodji nécessaire, il ne peut pas avoir accès une analyse (disclaimer)

## **3.6. Page boutique**

### **1. Contexte général**

La **Page Boutique** permet à l’utilisateur de gérer tout l’aspect **monnaie virtuelle** (Dodji), **purchases** (p.ex. packs de Dodji) et l’accès à un **modèle premium** (Dodje One). L’utilisateur peut :

- Consulter et acheter des **packs de Dodji**.
- Accéder à l’offre **Dodje One** (premium).
- Visualiser son **solde de Dodji** et ses **transactions** (achats, dépenses, gains).

---

### **2. Structure visuelle de la page**

1. **Barre supérieure**
    - **En haut à gauche** : icône/flèche de **retour** permettant de revenir à la page précédente (ou à l’accueil, selon votre navigation).
    - **En haut à droite** : affichage du **solde de Dodji** de l’utilisateur (ex. “Dodji : 1500”).
2. **Contenu principal**
    - **Bloc Dodje One (modèle premium)** : un **carré** ou un **encadré** mettant en avant l’offre premium Dodje One, avec un bouton “C’est parti” qui dirige vers la **Page Dodje One** dédiée.
    - **Liste/Packs de Dodji** : présentation des packs disponibles à l’achat.
        - Indiquer **le nombre de Dodji** inclus.
        - Mettre en évidence les **bonus** offerts.
        - **Deux packs** doivent être mis en avant (highlight) : éventuellement plus gros bonus, plus rentable, etc.
        
        ⇒ voir métadonnées firestore 
        
3. **Bouton d’achat** sur chaque pack
    - Un bouton “Acheter” ou “Acheter maintenant” à côté de chaque pack de Dodji.

---

### **3. Gestion des achats et paiement**

1. **Sur mobile (Android / iOS)**
    - **Android** : Intégrer **Google Play Billing**.
    - **iOS** : Utiliser **StoreKit** (In-App Purchase), implémenté via la bibliothèque **`react-native-iap`**.
    - Les achats sont donc **in-app purchases** conformes aux guidelines Google/Apple.
2. **Flux d’achat**
    - L’utilisateur sélectionne un pack → déclenche la **procédure de paiement** via la plateforme adéquate (Google, Apple).
    - En cas de succès, **FireStore** est mis à jour, ajoutant le **nombre de Dodji** correspondant (plus le bonus éventuel) au solde de l’utilisateur.
    - En cas d’échec ou d’annulation, aucune mise à jour n’est faite.
3. **Réception et validation**
    - Après un achat, les **informations de la transaction** (ex. receipt Apple, token Google) sont **vérifiées** sur votre backend ou par la bibliothèque `react-native-iap` pour éviter la fraude.
    - Si la transaction est valide, le compte utilisateur est **crédité** du montant de Dodji.

---

### **4. Packs de Dodji**

1. **Présentation des packs**
    - Chaque pack doit afficher :
        - Le **nom** du pack (par ex. “Pack 500 Dodji”).
        - **Prix** (ex. 4,99 €).
        - **Bonus** (ex. “+50 Dodji offerts !”).
    - Mettre en avant (highlight) **2 packs** : possiblement le pack de milieu et de très grande valeur, pour attirer l’utilisateur.
2. **Données stockées en base**
    - Dans **Firestore**, vous pouvez avoir une collection "token_packs" listant les données des packs 
3. **Logique d’affichage**
    - Récupérer les packs depuis Firestore et les afficher dynamiquement.
    - Le **highlight** peut être géré via un champ `isHighlighted = true`.

---

### **5. Bloc “Dodje One” (Offre Premium)**

1. **Visuel**
    - Un **encadré** ou un **cartouche** en haut de la liste, précisant les **avantages** de Dodje One.
    - Un **bouton** “C’est parti” qui redirige vers la **Page Dodje One** où l’utilisateur pourra souscrire (ex. abonnement mensuel ou annuel).
2. **Gestion du paiement**
    - Si Dodje One est un **abonnement**, vous devrez gérer la **souscription** In-App (StoreKit / Google Play Subscriptions) ou un **abonnement Stripe** pour le web.
    - Tout comme les packs, la **transaction** est validée et la base est mise à jour pour que l’utilisateur ait l’**état** premium.
3. **Évolutions futures**
    - Si vous prévoyez plus de **modèles premium** ou **variantes**, vous pouvez ajouter un carrousel.
    - Pour le MVP, un seul bloc “Dodje One” suffit, renvoyant vers la page dédiée.

---

### **6. Structure des jetons : achats, dépenses, gains**

1. **Achats**
    - Lorsqu’un utilisateur achète un pack, on enregistre :
        - la **transaction** (date, type de pack, montant).
        - l’**augmentation** de son solde de Dodji.
2. **Dépenses**
    - Dans l’application, l’utilisateur dépense des Dodji pour :
        - Débloquer des parcours ou des vidéos.
        - Autres fonctionnalités (ex. quiz, re-tenter ?).
    - Chaque dépense doit être enregistrée (date, montant, raison).
3. **Gains**
    - L’utilisateur peut gagner des Dodji dans certains contextes :
        - **Première connexion** (récompense de bienvenue).
        - **Compléter son premier parcours**.
        - **Terminer un quiz** avec succès.
    - Enregistrez ces gains dans la base (type = “gain”, date, raison).
4. **Stockage des transactions**
    - Dans Firestore, vous pouvez structurer une **sous-collection** “transactions” pour chaque utilisateur, contenant :
        - `type`: “purchase”, “spend”, “earn”.
        - `amount`: nombre de Dodji.
        - `reason`: ex. “Pack 500”, “Déblocage parcours 2”, “Quiz réussi”.
        - `timestamp`: date + heure.

---

## **7. Navigation et ergonomie**

1. **Retour à la page précédente**
    - Icône/flèche en haut à gauche.
    - éventuellement un swipe-back si la navigation s’y prête.
2. **Affichage responsive**
    - affichage en liste verticale des packs.
3. **Mise en avant des 2 packs highlight**
    - Ajouter un **ribbon** “Meilleur choix” ou “Meilleure offre” pour inciter les utilisateurs.
4. **Affichage du solde Dodji**
    - Toujours visible en haut à droite.
    - Mettre à jour **en temps réel** après un achat si possible.
5. **Design et animation** 
    - Adapter la **charte graphique** (couleurs, police).
    - Ajouter des **icônes** / images pour les packs, rendre la page attrayante.
    - Ajouter une animation lors de l’ajout des dodji

---

## **9. Sécurité et validations**

1. **Validation des achats** :
    - Vérifier les **receipts** (Apple, Google) ou l’**Event** (Stripe) pour être sûr que l’achat est **réel** et éviter la fraude.
    - Stocker un identifiant unique de transaction pour éviter la **double incrémentation** de Dodji.
2. **Limitation d’utilisation** :
    - Empêcher les accès directs à la fonction “ajout de Dodji” via des endpoints non autorisés.
    - Vérifier que l’utilisateur possède le **droit** ou a effectué la transaction.
3. **Sauvegarde des logs** :
    - Garder trace de toutes les transactions dans Firestore pour audit ultérieur.

## **3.7. Page catalogue**

### **1. Contexte général**

La **Page Catalogue** permet à l’utilisateur de **rechercher** et de **parcourir** du contenu (vidéos, parcours, ou autre format) présenté sous forme de **catalogue**, avec une mise en page **inspirée des plateformes de streaming** (Netflix, Canal, etc.). Cette page constitue une **bibliothèque de contenus** que l’utilisateur peut explorer librement.

---

### **2. Structure visuelle**

1. **Barre de recherche (en haut)**
    - L’utilisateur peut saisir un **mot-clé** pour filtrer le contenu.
    - Le champ de recherche doit être **accessible** en permanence (ou via un bouton d’ouverture si vous souhaitez économiser de l’espace).
2. **Section de catalogue**
    - Présentation des **contenus** sous forme de **vignettes** (cards) ou de **bandes horizontales** (carrousels), à la manière de Netflix.
    - Possibilité d’avoir **plusieurs rangées** (par exemple, “Nouveautés”, “Populaires”, “Nos recommandations”, etc.), ou un affichage unique en grille.
3. **Filtres et catégories (optionnel)**
    - En plus de la recherche textuelle, l’utilisateur peut filtrer le catalogue par **thème**, **niveau**, ou **catégories** prédéfinies.
    - Par exemple : “Bourse”, “Crypto”, “Expert”, “Nouveaux parcours”, etc.
4. **Inspiration Netflix / Canal**
    - **Vignettes** (couverture d’un contenu) avec le **titre** visible.
    - **Hover** (ou clic) pour afficher un **résumé** ou des **infos** complémentaires (durée, nombre de vidéos, statut).

---

### **3. Recherche**

1. **Barre de recherche**
    - Saisie libre du texte.
    - Déclenchement d’une **requête** sur le catalogue pour renvoyer les contenus correspondants (parcours, vidéos, quiz…).
2. **Autocomplétion** 
    - Dès que l’utilisateur tape, on peut proposer des **suggestions** (titres de parcours, chapitres, etc.) si la structure de données le permet.
    - Permet de gagner du temps et de découvrir du contenu.
3. **Algorithme de recherche**
    - Basé sur la **base de données** (FireStore ou autre).
    - Indexation possible sur les champs : titre, description, thème, niveau.
    - Retour d’une **liste de résultats** triés par pertinence.
4. **Affichage des résultats**
    - Soit intégré directement dans le **catalogue** (actualisé en temps réel).
    - Soit sur une **page** ou section spécifique “Résultats de recherche” affichant la liste correspondante.

---

### **4. Catalogue et navigation**

1. **Organisation du catalogue**
    - **Rangées** thématiques (à la Netflix) ou grille unique.
    - Chaque item (parcours, vidéo, module) est représenté par un **card** ou **vignette**.
    - Titre ou description courte est visible, éventuellement un **mini-icône** (ex. cadenas si bloqué).
2. **État du contenu**
    - Contenu **débloqué** vs **verrouillé** :
        - Ajouter un **cadenas** ou un indicateur pour le contenu non accessible.
    - **Progression** (facultatif) : si l’utilisateur a déjà visionné une partie du contenu, afficher une **barre de progression** ou un pourcentage.
3. **Interaction**
    - Un **clic** (ou tap) sur une vignette ouvre la **Page Parcours** correspondante, ou la **Page Vidéo** si c’est un item vidéo unique.
    - Possibilité d’afficher un pop-up d’info rapide (titre complet, résumé, durée, etc.) lors du survol (pour desktop) ou du clic long (mobile).

---

### **5. Filtres et catégories (optionnel mais conseillé)**

1. **Filtres rapides**
    - L’utilisateur peut **cocher** ou **sélectionner** des filtres : “Thème : Bourse / Crypto”, “Niveau : Débutant / Avancé / Expert”.
    - Les **résultats** du catalogue s’actualisent en conséquence.
2. **Combinaison de filtres**
    - L’utilisateur peut combiner **recherche textuelle** et **filtres** (ex. “Débutant + crypto + mot-clé ‘Trading’”).
3. **Affichage dynamique**
    - Les filtres peuvent être présentés en haut ou dans un **menu latéral** escamotable, selon le design.

---

### **6. Données et intégration en base**

1. **FireStore** 
    - Le catalogue récupère les **metadonnées** de tous les contenus (parcours, vidéos, etc.) :
    
    ![image.png](attachment:125a415f-7d43-4857-8cf6-c4c6a69ce5ba:image.png)
    
2. **Logique de mise à jour**
    - Quand un nouveau **parcours** ou **contenu** est ajouté, il apparaît automatiquement dans le **catalogue** (si ses métadonnées sont correctes).
    - Si un contenu est **restreint**, on peut filtrer côté front-end ou back-end pour ne pas l’afficher ou l’afficher en mode “bloqué”.

---

## **7. Expérience utilisateur**

1. **Netflix-like UI**
    - **Carrousel horizontal** : l’utilisateur peut faire défiler les vignettes avec un **swipe** (mobile) ou flèches (desktop).
    - **Labels** au-dessus de chaque carrousel : “Nouveautés”, “Populaires”, “Recommandés pour vous” (optionnel si vous implémentez un algorithme de recommandation).
2. **Performances**
    - Si la **liste** est très longue, envisager une **pagination** ou un **lazy load** (chargement au scroll).
    - Optimiser les **images** (taille réduite, placeholders…).
3. **Personnalisation** (futur)
    - Possibilité de mettre en avant du contenu **personnalisé** (basé sur le profil de l’utilisateur).
    - MVP : un simple listing divisé par catégories suffira.

---

### **8. Navigation et interactions détaillées**

1. **Depuis la barre de recherche**
    - Quand l’utilisateur tape un mot-clé, on affiche en temps réel (ou après validation) les résultats.
    - S’il clique sur un item, il va sur la **Page Parcours**/**Page Vidéo** correspondante.
2. **Depuis les carrousels**
    - L’utilisateur peut **scroller** horizontalement pour voir plus de contenus de la même catégorie.
    - Un **clic** (ou tap) sur la vignette ouvre la page du contenu.
3. **Retour**
    - Un **bouton** ou un **gest** (back) peut permettre de revenir à la page précédente (accueil ou autre).

---

### **9. Points techniques et recommandations**

1. **Gestion des images**
    - Les **vignettes** (imageUrl) doivent être optimisées (tailles adaptées à l’affichage).
2. **Sécurité / Droits d’accès**
    - Certains contenus peuvent être **non visibles** si l’utilisateur n’a pas acheté un certain pack ou un statut premium.
    - Vérifier la **logique** si un item est censé apparaître en mode “bloqué” plutôt que de disparaître.
3. **Compatibilité mobile / desktop**
    - Le design doit s’adapter (grille sur desktop, carrousels sur mobile, etc.).

## **3.8. Page profil**

### **1. Contexte général**

La **Page Profil** permet à l’utilisateur de consulter et personnaliser ses informations (nom d’utilisateur, avatar), de suivre sa progression (streak, avancée dans Bourse/Crypto), de visualiser ses quêtes en cours, ainsi que les badges déjà débloqués. Elle inclut également un accès aux **paramètres** de l’application.

---

### **2. Structure visuelle**

1. **Section “Identité”**
    - **Nom d’utilisateur** : affiché de façon claire, avec possibilité de modification (selon votre logique).
    - **Avatar** (optionnel pour le MVP) : un espace réservé ou un avatar par défaut, cliquable pour le changer (si vous décidez de l’implémenter).
2. **Section “Progression”**
    - **Streak** de connexion : nombre de jours consécutifs de connexion.
    - **Pourcentage Bourse et Crypto réalisé** : un visuel (barre ou anneau) indiquant le pourcentage d’avancement global dans chaque thème.
    - **Quêtes** : liste ou résumé des quêtes en cours/accomplies.
3. **Section “Badges débloqués”**
    - Un espace présentant **les badges** que l’utilisateur a gagnés (petites icônes/illustrations) avec éventuellement un court descriptif (ex. “Badge Débutant Crypto”).
4. **Paramètres** (en haut à droite)
    - Icône/roue dentée pour accéder aux **paramètres** de l’application (compte, notifications, préférences…).

---

### **3. Composants détaillés**

### **3.1. Identité (Nom + Avatar)**

1. **Nom d’utilisateur**
    - Affiché en **gros** en haut de la page.
    - Possibilité de modification (selon vos choix) : un **bouton** ou une **icône d’édition** à côté.
2. **Avatar** (optionnel MVP)
    - Peut être un **carré** ou **cercle** avec une image par défaut.
    - Si implémenté, un **clic** dessus pourrait proposer de **choisir** un avatar parmi une petite galerie, ou d’en **uploader** un (selon la complexité souhaitée).

---

### **3.2. Streak**

1. **Affichage du streak**
    - Indiquer “Streak : X jours” ou un **compteur** spécifique.
    - Possibilité d’ajouter une icône **flamme** ou un design marquant la continuité.
2. **Logique de calcul**
    - Le streak est incrémenté chaque jour où l’utilisateur se connecte.
    - S’il manque un jour, le streak retombe à 0 (ou un système de “rattrapage” si vous le souhaitez).

---

### **3.3. Pourcentage Bourse et Crypto réalisé**

1. **Progression globale**
    - Afficher deux **barres** ou **anneaux** de progression :
        - **Bourse** : pourcentage global de contenu parcouru (vidéos, quiz).
        - **Crypto** : idem, pourcentage.
2. **Calcul**
    - Le pourcentage peut se baser sur le **nombre** de parcours/vidéos finalisés dans le thème par rapport au **total** existant.
    - Stocké et mis à jour dans Firestore lors de la complétion d’un parcours/quiz.
3. **Visuel**
    - Possibilité de colorer l’anneau/ barre pour Bourse (vert ?) et Crypto (bleu ?), par exemple.
    - Indiquer le pourcentage en chiffres (“65% réalisé”).

---

### **3.4. Quêtes**

1. **Liste des quêtes**
    - Afficher les **quêtes en cours** ou terminées (ex. “Regarde 3 vidéos dans Bourse Débutant”, “Termine 2 quiz cette semaine”, etc.).
    - Chaque quête indique son **statut** : en cours, terminée, expirée…
2. **Récompenses**
    - S’il y a des Dodji ou badges à la clé, mentionnez-les.
    - Afficher la **progression** de la quête (par exemple, 2/3 vidéos vues).
3. **Organisation**
    - Vous pouvez scinder :
        - “Quêtes actives” / “Quêtes terminées”
        - Ou simplement indiquer un label de statut.

---

### **3.5. Badges débloqués**

1. **Présentation visuelle**
    - Petite grille d’icônes ou de cartes représentant chaque **badge**.
    - Au clic ou survol (selon la plateforme), afficher le **nom du badge** et une brève **description** (“Obtenu après avoir complété le parcours 3 de Crypto Avancé”, etc.).
2. **Badges non débloqués ?** (optionnel)
    - Vous pouvez afficher en **gris** ou flouté les badges pas encore obtenus, pour inciter l’utilisateur à progresser.
3. **Données en base**
    - Les badges sont **attribués** lors de certains exploits (finir un parcours, un quiz, un ensemble de parcours, etc.) et stockés dans Firestore dans un champ “badges” de l’utilisateur.

---

### **3.6. Paramètres**

1. **Bouton/ Icône en haut à droite**
    - Ouvre la **Page Paramètres** ou un **menu latéral** pour gérer :
        - Informations du compte (email, mot de passe…).
        - Notifications (activer / désactiver).
        - Paramètres d’affichage, etc.
2. **Portée du MVP**
    - Vous pouvez limiter le MVP à un simple **accès** vers la Page Paramètres, où un minimal set de réglages est géré.

---

### **4. Données et logique en base**

1. **Utilisateur** (collection “users”)
    - `displayName`: nom d’utilisateur.
    - `avatarUrl`: lien vers l’avatar (ou “default”).
    - `streak`: nb jours consécutifs.
    - `badges`: liste/array des badges débloqués.
    - `quests`: liste des quêtes en cours/terminées (ou gérées dans une sous-collection).
    - `progressBourse`, `progressCrypto`: pourcentages stockés ou calculés dynamiquement.
2. **Calcul de la progression**
    - L’application met à jour `progressBourse`/`progressCrypto` lorsque l’utilisateur termine un parcours dans l’un ou l’autre thème.
    - Ou bien calcul dynamique (compter combien de parcours terminés / total).
3. **Quêtes**
    - Les quêtes (objectifs particuliers) peuvent être stockées dans une sous-collection `users/{userId}/quests` ou un champ `quests`.
    - Chaque quête a un `type`, une `condition`, un `reward`.

---

### **5. Navigation et ergonomie**

1. **Accès à la Page Profil**
    - Via un bouton “Profil” dans la barre de navigation principale, ou un icône d’utilisateur.
    - Sur mobile, un onglet “Profil” (si vous avez un bottom tab bar).
2. **Retour**
    - Eventuellement un **bouton “Retour”** en haut à gauche si vous venez d’une autre page.
    - Ou vous pouvez considérer cette page comme un “root tab” (pas de retour).
3. **Animations**
    - Vous pouvez animer la **croissance** du streak ou l’affichage des **pourcentages** (ex. un anneau qui se remplit).
    - Les **badges** peuvent apparaître avec un effet si nouvellement acquis.

---

### **6. Évolutions futures (optionnel)**

1. **Personnalisation poussée**
    - Modification libre de l’avatar (upload d’images, etc.).
    - Thèmes de couleurs, style de la page, etc.
2. **Système social**
    - Possibilité d’afficher le **profil d’autres utilisateurs**, comparer les streaks/badges (classement).
3. **Historique de progression**
    - Graphiques montrant la progression de l’utilisateur au fil des semaines ou mois.
4. **Notifications / Rappels**
    - En cas de streak, envoyer un rappel quotidien.
    - Paramétrable dans les **paramètres.**

---

## **3.10. Page DodjeOne**

### **1. Contexte général**

La **Page DodjeOne** présente l’**offre premium** de l’application Dodje, appelée **“DodjeOne”**. L’utilisateur y découvre :

1. Les **avantages** et **fonctionnalités supplémentaires** inclus dans DodjeOne.
2. Un **bouton d’achat** pour souscrire, affichant **le prix** de l’abonnement/d’achat unique.
3. L’intégration des **services** nécessaires (Google Play, Apple Developer, Firebase Function) pour gérer le paiement et les gains de Dodji mensuels.

---

### **2. Design et structure de la page**

1. **Titre / En-tête**
    - Afficher clairement **“DodjeOne”** en haut, avec un sous-titre mettant en avant l’idée de **premium** ou **expérience améliorée**.
2. **Liste des avantages / fonctionnalités supplémentaires**
    - Présentation visuelle simple et efficace, **inspirée de Twitch** et **Duolingo** :
        - Par ex. puces ou cartes listant les **bénéfices** (ex. plus de déblocages instantanés, gains de Dodji supplémentaires, accès exclusif à certaines vidéos, etc.).
3. **Zone “Offre Premium”**
    - Un **encadré** ou un **bloc** final avec le **bouton d’achat** affichant **le prix** (ex. 4,99€/mois).
    - S’inspirer de **Duolingo** pour le style : couleurs dynamiques, clair et incitatif.
4. **Page sobre et impactante**
    - Un design **simple** mais **percutant**, montrant clairement la **valeur** de DodjeOne.
    - **Exemples** : un mock-up d’écran, icônes attractives, etc.

---

### **3. Fonctionnalités et avantages inclus dans DodjeOne**

1. **Gains de Dodji mensuels**
    - Chaque mois, l’utilisateur reçoit automatiquement un **bonus** de Dodji.
    - Géré via une **Firebase Function** pour créditer les Dodji de manière récurrente.
2. **Déblocage illimité**
    - Tous les parcours sont débloqués (plus besoin de dépenser des Dodji pour les débloquer en avance)
3. **Contenus exclusifs**
    - Accès à des **vidéos premium** ou des **quiz** spéciaux.
4. **Autres avantages**
    - Icône ou badge “DodjeOne” sur le profil,
    - Suppression des publicités,
    - Support prioritaire,
    - Etc.

*(La liste exacte dépend de votre politique. Mentionnez clairement tout ce que l’utilisateur obtient.)*

---

### **4. Bouton d’achat et intégration des paiements**

1. **Bouton d’achat**
    - Mettre en avant le **prix** (mensuel/annuel).
    - Un simple **clic** redirige l’utilisateur vers la procédure de paiement in-app (Google/Apple)
2. **Google Play Console / Apple Developer**
    - Configuration côté **Google Play** (abonnements) et côté **Apple Developer** (In-App Purchase / Abonnements StoreKit).
    - **react-native-iap** (ou une solution similaire) pour initier l’achat dans l’application et vérifier la validité de la souscription.
3. **Firebase Function** pour les gains mensuels
    - Logique d’une **fonction Cloud** (par ex. Cloud Scheduler) qui, chaque mois, vérifie quels utilisateurs possèdent un abonnement DodjeOne actif et leur crédite le **bonus de Dodji** automatique.
4. **Validation des abonnements**
    - Après paiement, le **reçu** est validé (via Google ou Apple) pour activer le statut premium de l’utilisateur dans Firestore.
    - Système de **renouvellement** automatique (mensuel) si c’est un abonnement.

---

### **5. Intégration technique et logique de statut Premium**

1. **Statut Premium** dans Firestore
    - Au moment de l’achat, l’application met à jour un champ `isDodjeOne = true` (ou un champ `subscriptionEndDate`) dans le document utilisateur.
    - Permet de conditionner l’affichage de certaines fonctionnalités (déblocage illimité, bonus Dodji…).
2. **Firebase Functions** : Gains automatiques
    - Une fonction Cloud planifiée (via **Cloud Scheduler**) qui, une fois par mois, exécute :
        - Vérification si `isDodjeOne = true` et/ou si la **date d’abonnement** est encore valide.
        - Créditer le compte de l’utilisateur de **X Dodji**.
        - Notifier l’utilisateur si besoin (push notification ou email).
3. **Annulation / Résiliation**
    - Si l’utilisateur annule le renouvellement (dans Google/Apple), vous devez mettre à jour `isDodjeOne = false` quand la période payée se termine.
4. **Suivi analytics**
    - Facultatif : surveiller le nombre d’abonnés, la durée d’abonnement, etc.

---

### **6. Design inspiré de Twitch / Duolingo**

1. **Style Twitch**
    - Couleurs vives, encadrés, symboles d’exclusivité, badges “VIP” ou “Premium”.
    - Mots-clés : “Soutien”, “Exclusif”, “Récompenses”.
2. **Style Duolingo**
    - Visuels ludiques, mascottes, icônes accrocheuses, cartouches colorés.
    - Sur la Page DodjeOne : un design minimaliste et clair, sans trop d’informations superflues.
3. **Éléments graphiques**
    - Possible usage de **ribbons** ou labels (“+100 Dodji / mois”, “Accès exclusif”, etc.).
    - Un **encadré** final “Souscrire maintenant”, bien mis en valeur.

---

### **7. Expérience utilisateur**

1. **Simplicité**
    - L’utilisateur doit rapidement comprendre ce qu’il gagne en devenant **DodjeOne** et combien ça coûte.
    - Un bouton unique d’action (“S’abonner”, “Acheter” ou “C’est parti”).
2. **Clarté sur la facturation**
    - Mention du **renouvellement** mensuel automatique (ou non),
    - Mention d’une période d’essai s’il y en a une, etc.
3. **Navigation**
    - Possibilité de retourner à la **Page Boutique** ou à l’écran précédent (flèche retour),
    - Lien vers **Conditions** / **Politique** si nécessaire (Apple/Google guidelines).

## **3.10. Page d’inscription et d’authentification**

- **Création de compte**
    - Méthodes d’inscription : e-mail + mot de passe.
    - Champs obligatoires : **Adresse e-mail**, **nom d’utilisateur**, **mot de passe**.
- **Connexion**
    - Authentification via e-mail/mot de passe.
    - Option “mot de passe oublié” avec réinitialisation par e-mail.

> Intégration : Utiliser Firebase Authentication pour la gestion de l’inscription et de la connexion, ainsi que Firestore pour la gestion des données utilisateur.
>