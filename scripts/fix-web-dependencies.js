const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Chemin vers le fichier package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Lire le fichier package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Mettre à jour les versions des dépendances selon les recommandations d'Expo
const updatedDependencies = {
  'expo-router': '~4.0.20',
  'react-native': '0.76.9',
  'react-native-reanimated': '~3.16.1',
  'react-native-svg': '15.8.0'
};

// Mettre à jour les dépendances dans le package.json
let hasChanges = false;
for (const [name, version] of Object.entries(updatedDependencies)) {
  if (packageJson.dependencies[name] && packageJson.dependencies[name] !== version) {
    console.log(`Mise à jour de ${name} de ${packageJson.dependencies[name]} vers ${version}`);
    packageJson.dependencies[name] = version;
    hasChanges = true;
  }
}

// Si des modifications ont été faites, écrire le fichier package.json mis à jour
if (hasChanges) {
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf8'
  );
  console.log('package.json mis à jour avec succès !');

  // Effacer le cache de npm et node_modules si nécessaire
  try {
    console.log('Nettoyage du cache...');
    execSync('npm cache clean --force', { stdio: 'inherit' });
    
    console.log('Suppression du dossier node_modules/.cache...');
    const cacheDir = path.join(__dirname, '..', 'node_modules', '.cache');
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
    }
    
    console.log('Installation des dépendances mises à jour...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('Tout est prêt ! Essayez de relancer votre application avec: npm run web');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des dépendances:', error);
  }
} else {
  console.log('Aucune mise à jour nécessaire !');
} 