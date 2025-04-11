const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Fonction pour exécuter des commandes avec gestion d'erreur
function runCommand(command, description) {
  console.log(`\n🧹 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} réussi!`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de: ${description}`);
    console.error(error.message);
    return false;
  }
}

// Fonction pour supprimer un dossier s'il existe
function removeDir(dir, description) {
  if (fs.existsSync(dir)) {
    console.log(`\n🧹 Suppression de ${description}...`);
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Suppression de ${description} réussie!`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de ${description}`);
      console.error(error.message);
      return false;
    }
  } else {
    console.log(`\n⏭️ ${description} n'existe pas, aucune action nécessaire.`);
    return true;
  }
}

// Chemins des dossiers à nettoyer
const rootDir = path.join(__dirname, '..');
const nodeModulesDir = path.join(rootDir, 'node_modules');
const expoDir = path.join(rootDir, '.expo');
const cacheDir = path.join(nodeModulesDir, '.cache');
const metroDir = path.join(os.tmpdir(), 'metro-cache');
const expoCacheDir = path.join(os.homedir(), '.expo');
const expoBundlerCacheDir = path.join(expoCacheDir, 'cache');

console.log('🧹 NETTOYAGE COMPLET DES CACHES 🧹');
console.log('----------------------------------');

// Arrêter les processus de Metro/Expo si en cours d'exécution
runCommand('npx kill-port 8081 19000 19001 19002', 'Arrêt des processus Metro');

// Suppression des dossiers de cache
removeDir(cacheDir, 'cache des modules');
removeDir(path.join(rootDir, '.expo'), 'cache Expo local');
removeDir(path.join(rootDir, 'web-build'), 'build web');
removeDir(path.join(rootDir, '.docusaurus'), 'cache Docusaurus');
removeDir(path.join(rootDir, 'dist'), 'dossier dist');
removeDir(path.join(rootDir, 'build'), 'dossier build');

// Nettoyage des caches Yarn, npm et Metro
runCommand('npm cache clean --force', 'Nettoyage du cache npm');
runCommand('npx expo doctor --fix', 'Réparation des problèmes Expo');

// Si le dossier Expo n'existe plus, reconfigurez-le
if (!fs.existsSync(expoCacheDir)) {
  fs.mkdirSync(expoCacheDir, { recursive: true });
}

console.log('\n✨ NETTOYAGE TERMINÉ ✨');
console.log('-------------------------------');
console.log('🔄 Suivez ces étapes pour redémarrer votre projet:');
console.log('1. Exécutez: npm install');
console.log('2. Puis lancez: npx expo start --clear');
console.log('-------------------------------'); 