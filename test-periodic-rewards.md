# Test du Système de Récompenses Périodiques

## Modifications apportées

### 1. Fonction `calculateStreakReward` (src/streak/types.ts)
- **Avant** : Récompenses uniques pour J7 (50) et J30 (250)
- **Après** : Récompenses périodiques tous les 7 jours (50) et tous les 30 jours (250)

### 2. Fonction `getStreakRewardInfo` (src/streak/types.ts)
- **Avant** : Descriptions pour récompenses uniques
- **Après** : Descriptions pour récompenses périodiques avec compteurs

### 3. Fonction `getNextRewards` (src/streak/components/StreakModal.tsx)
- **Avant** : Affichage des prochaines récompenses seulement si pas encore atteintes
- **Après** : Calcul des prochaines récompenses périodiques avec jours restants

## Tests à effectuer

### Test 1 : Récompenses périodiques de 7 jours
- Jour 7 : 50 Dodjis ✓
- Jour 14 : 50 Dodjis ✓
- Jour 21 : 50 Dodjis ✓
- Jour 28 : 50 Dodjis ✓

### Test 2 : Récompenses périodiques de 30 jours
- Jour 30 : 250 Dodjis ✓
- Jour 60 : 250 Dodjis ✓
- Jour 90 : 250 Dodjis ✓

### Test 3 : Éviter les doubles récompenses
- Jour 30 : Seulement 250 Dodjis (pas 50 + 250)
- Jour 60 : Seulement 250 Dodjis (pas 50 + 250)

### Test 4 : Calcul des prochaines récompenses
Pour un streak de 33 jours :
- Prochaine récompense quotidienne : J34 (+5)
- Prochaine récompense hebdomadaire : J35 (+50) - dans 2 jours
- Prochaine récompense mensuelle : J60 (+250) - dans 27 jours

## Vérification du code

```typescript
// Test calculateStreakReward
console.log('J7:', calculateStreakReward(7));   // 50
console.log('J14:', calculateStreakReward(14)); // 50
console.log('J21:', calculateStreakReward(21)); // 50
console.log('J30:', calculateStreakReward(30)); // 250
console.log('J35:', calculateStreakReward(35)); // 50
console.log('J60:', calculateStreakReward(60)); // 250

// Test getNextRewards pour streak 33
const nextRewards = getNextRewards(33);
console.log('Prochaines récompenses pour J33:', nextRewards);
```

## Résultat attendu
Le système doit maintenant permettre aux utilisateurs de gagner :
- 5 Dodjis chaque jour
- 50 Dodjis tous les 7 jours (J7, J14, J21, J28, J35, etc.)
- 250 Dodjis tous les 30 jours (J30, J60, J90, etc.)

Les récompenses sont maintenant **périodiques** et non plus **uniques** ! 