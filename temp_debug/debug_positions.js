image.png// Script de débogage pour les positions et parcours
// Ces données sont à remplacer par des données de test réelles pour vérifier le formatage

const mockPositions = {
  "position1": {
    x: 20, // 20% de la largeur de l'image
    y: 30, // 30% de la hauteur de l'image
    order: 1,
    isAnnex: false
  },
  "position2": {
    x: 50,
    y: 40,
    order: 2,
    isAnnex: false
  },
  "position3": {
    x: 70,
    y: 60,
    order: 3,
    isAnnex: false
  },
  // Position annexe
  "positionAnnex1": {
    x: 85,
    y: 30,
    order: 4,
    isAnnex: true
  }
};

const mockParcours = {
  "1": {
    id: "Q5oeS83AsqiG1o6S2T1x",
    titre: "Tout savoir sur le projet Dodje",
    description: "Description du parcours", 
    domaine: "Bourse",
    niveau: "Débutant",
    ordre: 1,
    status: "deblocked"
  },
  "2": {
    id: "parcours-2",
    titre: "Les bases de la bourse",
    description: "Apprenez les fondamentaux",
    domaine: "Bourse",
    niveau: "Débutant",
    ordre: 2,
    status: "blocked"
  },
  "3": {
    id: "parcours-3",
    titre: "Stratégies d'investissement",
    description: "Techniques avancées", 
    domaine: "Bourse",
    niveau: "Débutant",
    ordre: 3,
    status: "deblocked"
  },
  "4": {
    id: "parcours-annexe-1",
    titre: "Comprendre les indices boursiers",
    description: "Annexe informative",
    domaine: "Bourse", 
    niveau: "Débutant",
    ordre: 4,
    status: "completed",
    isAnnex: true
  }
};

// Tester la correspondance entre positions et parcours
const positionsWithParcours = Object.entries(mockPositions).map(([posId, posData]) => {
  const parcoursData = posData.order ? mockParcours[posData.order.toString()] : null;
  return {
    positionId: posId,
    x: posData.x,
    y: posData.y,
    order: posData.order,
    isAnnex: posData.isAnnex,
    parcours: parcoursData ? {
      id: parcoursData.id,
      titre: parcoursData.titre,
      status: parcoursData.status
    } : null
  };
});

console.log("Positions avec parcours associés:");
console.log(JSON.stringify(positionsWithParcours, null, 2));

// Débogage de la fonction d'affichage des boutons
function debugPositionButton(position, parcours) {
  console.log(`
Bouton à la position: (${position.x}%, ${position.y}%)
Ordre: ${position.order || 'Non défini'}
Type: ${position.isAnnex ? 'Annexe' : 'Principal'}
${parcours ? `
Parcours associé: ${parcours.titre}
ID: ${parcours.id}
Statut: ${parcours.status}
` : 'Aucun parcours associé'}
-------------------
  `);
}

// Tester l'affichage de chaque position
Object.entries(mockPositions).forEach(([posId, posData]) => {
  const parcours = posData.order ? mockParcours[posData.order.toString()] : null;
  debugPositionButton(posData, parcours);
});

console.log("INSTRUCTIONS DE DÉBOGAGE:");
console.log(`
1. Vérifiez que les coordonnées x, y sont bien définies en % dans Firestore
2. Assurez-vous que chaque position a un attribut "order" correspondant à l'ordre d'un parcours
3. Pour les documents dans la collection "parcours", vérifiez que chaque document a:
   - Un champ "ordre" numérique
   - Un champ "domaine" ("Bourse" ou "Crypto")
   - Un champ "niveau" ("Débutant", "Avancé", "Expert")
4. Dans le document home_design, vérifiez:
   - Les coordonnées des positions
   - L'URL de l'image d'arrière-plan
   - Que le domaine et niveau correspondent aux parcours à afficher
`); 