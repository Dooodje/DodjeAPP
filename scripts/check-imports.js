#!/usr/bin/env node

/**
 * Script pour vérifier la cohérence des imports dans le projet
 * 
 * Ce script parcourt tous les fichiers du projet et vérifie:
 * - Les imports absolus vs relatifs
 * - Les dépendances non installées
 * - La cohérence avec les alias configurés
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const APP_DIR = path.resolve(__dirname, '../app');
const PACKAGE_JSON = path.resolve(__dirname, '../package.json');
const NODE_MODULES = path.resolve(__dirname, '../node_modules');

// Alias configurés dans babel.config.js et tsconfig.json
const ALIASES = {
  '@': './src',
  '@components': './src/components',
  '@hooks': './src/hooks',
  '@services': './src/services',
  '@store': './src/store',
  '@types': './src/types',
  '@utils': './src/utils',
  '@constants': './src/constants',
  '@assets': './src/assets',
  '@screens': './src/screens',
};

// Extensions à vérifier
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Charger package.json pour vérifier les dépendances
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

// Liste pour stocker les problèmes trouvés
const issues = [];

// Fonction pour scanner récursivement les répertoires
function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Ignorer node_modules et .git
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        scanDirectory(fullPath);
      }
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      checkImports(fullPath);
    }
  }
}

// Fonction pour vérifier les imports dans un fichier
function checkImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativeToSrc = path.relative(SRC_DIR, filePath);
  const relativeToApp = path.relative(APP_DIR, filePath);
  
  // Regex pour trouver les imports
  const importRegex = /import\s+(?:(?:{[^}]*}|\*\s+as\s+[^;]+|[^;{]*)\s+from\s+)?['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Vérifier si c'est un import de package npm
    if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
      // Vérifier si le package est installé
      const packageName = importPath.split('/')[0];
      if (!dependencies[packageName] && !fs.existsSync(path.join(NODE_MODULES, packageName))) {
        issues.push({
          file: filePath,
          issue: `Dépendance non installée: ${packageName}`,
          type: 'missing-dependency',
          importPath
        });
      }
    } 
    // Vérifier les imports avec alias
    else if (importPath.startsWith('@/')) {
      // C'est un import avec alias, vérifier s'il correspond à un fichier réel
      const realPath = importPath.replace('@/', './src/');
      const resolvedPath = path.resolve(__dirname, '..', realPath);
      
      if (!fs.existsSync(resolvedPath) && 
          !fs.existsSync(`${resolvedPath}.js`) && 
          !fs.existsSync(`${resolvedPath}.ts`) && 
          !fs.existsSync(`${resolvedPath}.tsx`) && 
          !fs.existsSync(`${resolvedPath}.jsx`)) {
        issues.push({
          file: filePath,
          issue: `Import avec alias non trouvé: ${importPath}`,
          type: 'invalid-alias-import',
          importPath
        });
      }
    }
    // Vérifier les imports relatifs
    else if (importPath.startsWith('.')) {
      // C'est un import relatif, vérifier s'il correspond à un fichier réel
      const dirName = path.dirname(filePath);
      const resolvedPath = path.resolve(dirName, importPath);
      
      if (!fs.existsSync(resolvedPath) && 
          !fs.existsSync(`${resolvedPath}.js`) && 
          !fs.existsSync(`${resolvedPath}.ts`) && 
          !fs.existsSync(`${resolvedPath}.tsx`) && 
          !fs.existsSync(`${resolvedPath}.jsx`) && 
          !fs.existsSync(`${resolvedPath}/index.js`) && 
          !fs.existsSync(`${resolvedPath}/index.ts`) && 
          !fs.existsSync(`${resolvedPath}/index.tsx`) && 
          !fs.existsSync(`${resolvedPath}/index.jsx`)) {
        issues.push({
          file: filePath,
          issue: `Import relatif non trouvé: ${importPath}`,
          type: 'invalid-relative-import',
          importPath
        });
      }
    }
  }
}

// Fonction principale
function main() {
  console.log('Vérification des imports...');
  
  // Vérifier les fichiers dans src/
  if (fs.existsSync(SRC_DIR)) {
    scanDirectory(SRC_DIR);
  } else {
    console.warn('Répertoire src/ non trouvé');
  }
  
  // Vérifier les fichiers dans app/
  if (fs.existsSync(APP_DIR)) {
    scanDirectory(APP_DIR);
  } else {
    console.warn('Répertoire app/ non trouvé');
  }
  
  // Afficher les résultats
  if (issues.length === 0) {
    console.log('✅ Aucun problème d\'import détecté !');
  } else {
    console.log(`❌ ${issues.length} problèmes d'import détectés :`);
    
    // Grouper par type de problème
    const missingDeps = issues.filter(i => i.type === 'missing-dependency');
    const invalidAliasImports = issues.filter(i => i.type === 'invalid-alias-import');
    const invalidRelativeImports = issues.filter(i => i.type === 'invalid-relative-import');
    
    if (missingDeps.length > 0) {
      console.log('\n📦 DÉPENDANCES MANQUANTES :');
      // Extraire les noms uniques de packages
      const uniquePackages = [...new Set(missingDeps.map(i => i.importPath.split('/')[0]))];
      
      uniquePackages.forEach(pkg => {
        const filesAffected = missingDeps
          .filter(i => i.importPath.split('/')[0] === pkg)
          .map(i => path.relative(process.cwd(), i.file));
        
        console.log(`\n  ${pkg} (${filesAffected.length} fichiers concernés):`);
        console.log(`    Commande d'installation: npm install ${pkg}`);
        console.log(`    Fichiers concernés: ${filesAffected.slice(0, 3).join(', ')}${filesAffected.length > 3 ? ` et ${filesAffected.length - 3} autres...` : ''}`);
      });
    }
    
    if (invalidAliasImports.length > 0) {
      console.log('\n🔗 IMPORTS AVEC ALIAS INVALIDES :');
      invalidAliasImports.forEach(issue => {
        console.log(`  ${path.relative(process.cwd(), issue.file)}: ${issue.importPath}`);
      });
    }
    
    if (invalidRelativeImports.length > 0) {
      console.log('\n🔗 IMPORTS RELATIFS INVALIDES :');
      invalidRelativeImports.forEach(issue => {
        console.log(`  ${path.relative(process.cwd(), issue.file)}: ${issue.importPath}`);
      });
    }
    
    console.log('\nConsidérez l\'utilisation de la commande suivante pour installer toutes les dépendances manquantes :');
    console.log(`npm install ${[...new Set(missingDeps.map(i => i.importPath.split('/')[0]))].join(' ')}`);
    
    process.exit(1);
  }
}

// Lancer le script
main(); 