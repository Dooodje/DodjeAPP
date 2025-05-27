import { homeDataCacheService } from './homeDataCache';
import { imageCacheService } from './imageCache';
import { Section, Level } from '../types/home';

interface InitializationProgress {
  step: string;
  progress: number; // 0-100
  message: string;
}

type ProgressCallback = (progress: InitializationProgress) => void;

class AppInitializationService {
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Initialise l'application en préchargeant toutes les données nécessaires
   */
  async initialize(onProgress?: ProgressCallback, loadGlobalDataOnly: boolean = false): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ Application déjà initialisée');
      return;
    }

    if (this.initializationPromise) {
      console.log('⏳ Initialisation déjà en cours...');
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization(onProgress, loadGlobalDataOnly);
    return this.initializationPromise;
  }

  private async _performInitialization(onProgress?: ProgressCallback, loadGlobalDataOnly: boolean = false): Promise<void> {
    console.log(`🚀 Début de l'initialisation ${loadGlobalDataOnly ? '(données globales uniquement)' : '(complète)'}`);

    try {
      if (loadGlobalDataOnly) {
        // Mode données globales uniquement - focus sur les données essentielles
        console.log('📊 Mode chargement données globales uniquement');
        
        // Étape 1: Précharger les données des 6 sous-pages (images + parcours)
        onProgress?.({
          step: 'homeData',
          progress: 20,
          message: 'Chargement des données globales (images et parcours)...'
        });

        console.log('🔄 Initialisation du cache des données de la page d\'accueil...');
        await homeDataCacheService.initialize();
        console.log('✅ Cache des données de la page d\'accueil initialisé');

        // Étape 2: Vérification du cache
        onProgress?.({
          step: 'verification',
          progress: 80,
          message: 'Vérification des données chargées...'
        });

        const cacheStats = homeDataCacheService.getCacheStats();
        console.log('📊 Statistiques du cache après chargement global:', cacheStats);

        if (cacheStats.validEntries === 0) {
          throw new Error('Aucune donnée valide chargée dans le cache');
        }

        // Étape 3: Finalisation
        onProgress?.({
          step: 'complete',
          progress: 100,
          message: 'Données globales chargées avec succès !'
        });

        console.log(`🎉 Chargement des données globales terminé - ${cacheStats.validEntries} entrées valides en cache`);
        
      } else {
        // Mode initialisation complète (comme avant)
        console.log('🔧 Mode initialisation complète');
        
        // Étape 1: Initialiser le cache d'images
        onProgress?.({
          step: 'imageCache',
          progress: 10,
          message: 'Initialisation du cache d\'images...'
        });

        await imageCacheService.initialize();
        console.log('✅ Cache d\'images initialisé');

        // Étape 2: Nettoyer les images expirées
        onProgress?.({
          step: 'cleanup',
          progress: 20,
          message: 'Nettoyage des données expirées...'
        });

        await imageCacheService.cleanExpiredImages();
        console.log('✅ Images expirées nettoyées');

        // Étape 3: Précharger les données des 6 sous-pages et récupérer les URLs d'images
        onProgress?.({
          step: 'homeData',
          progress: 30,
          message: 'Préchargement des données de la page d\'accueil...'
        });

        await homeDataCacheService.initialize();
        console.log('✅ Données de la page d\'accueil préchargées');

        // Étape 4: Précharger les images maintenant que nous avons les URLs
        onProgress?.({
          step: 'images',
          progress: 60,
          message: 'Préchargement des images...'
        });

        // Récupérer les URLs d'images depuis le cache de données
        const sections: Section[] = ['Bourse', 'Crypto'];
        const levels: Level[] = ['Débutant', 'Avancé', 'Expert'];
        const imageUrls: Record<string, string> = {};

        for (const section of sections) {
          for (const level of levels) {
            try {
              const data = await homeDataCacheService.getData(section, level);
              if (data.imageUrl) {
                const key = `${section}_${level}`;
                imageUrls[key] = data.imageUrl;
                console.log(`📸 URL d'image récupérée pour ${section} - ${level}: ${data.imageUrl.substring(0, 50)}...`);
              }
            } catch (error) {
              console.error(`Erreur récupération URL image ${section} - ${level}:`, error);
            }
          }
        }

        // Précharger toutes les images avec les URLs récupérées
        await imageCacheService.preloadAllHomeImages(imageUrls);
        console.log('✅ Images préchargées');

        // Étape 5: Vérification du cache
        onProgress?.({
          step: 'verification',
          progress: 90,
          message: 'Vérification du cache...'
        });

        const cacheStats = homeDataCacheService.getCacheStats();
        const imageStats = imageCacheService.getCacheStats();
        
        console.log('📊 Statistiques du cache:', {
          homeData: cacheStats,
          images: imageStats
        });

        // Étape 6: Finalisation
        onProgress?.({
          step: 'complete',
          progress: 100,
          message: 'Initialisation terminée'
        });

        console.log('🎉 Initialisation de l\'application terminée avec succès');
      }

      this.isInitialized = true;

    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de l\'application:', error);
      
      onProgress?.({
        step: 'error',
        progress: 0,
        message: 'Erreur lors de l\'initialisation'
      });

      // Réinitialiser pour permettre une nouvelle tentative
      this.isInitialized = false;
      this.initializationPromise = null;
      
      throw error;
    }
  }

  /**
   * Vérifie si l'application est initialisée
   */
  isAppInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Force une réinitialisation complète
   */
  async reinitialize(onProgress?: ProgressCallback): Promise<void> {
    console.log('🔄 Réinitialisation forcée de l\'application');
    
    // Nettoyer les caches
    homeDataCacheService.clearCache();
    await imageCacheService.clearCache();
    
    // Réinitialiser l'état
    this.isInitialized = false;
    this.initializationPromise = null;
    
    // Relancer l'initialisation
    return this.initialize(onProgress);
  }

  /**
   * Précharge spécifiquement les images pour une meilleure UX
   */
  async preloadCriticalImages(): Promise<void> {
    console.log('🖼️ Préchargement des images critiques');
    
    // Cette méthode peut être appelée très tôt dans le cycle de vie de l'app
    // pour commencer le préchargement des images avant même l'initialisation complète
    
    try {
      await imageCacheService.initialize();
      
      // Ici, on pourrait ajouter une logique pour précharger seulement
      // les images les plus importantes (ex: page d'accueil par défaut)
      console.log('✅ Images critiques préchargées');
    } catch (error) {
      console.error('❌ Erreur lors du préchargement des images critiques:', error);
    }
  }

  /**
   * Obtient les statistiques globales de l'initialisation
   */
  getInitializationStats(): {
    isInitialized: boolean;
    homeDataCache: any;
    imageCache: any;
  } {
    return {
      isInitialized: this.isInitialized,
      homeDataCache: this.isInitialized ? homeDataCacheService.getCacheStats() : null,
      imageCache: this.isInitialized ? imageCacheService.getCacheStats() : null
    };
  }

  /**
   * Méthode utilitaire pour vérifier la connectivité et adapter le comportement
   */
  async initializeWithConnectivityCheck(onProgress?: ProgressCallback): Promise<void> {
    try {
      // Vérifier la connectivité (peut être étendu avec NetInfo)
      const isOnline = true; // Placeholder - à remplacer par une vraie vérification
      
      if (!isOnline) {
        console.log('📱 Mode hors ligne détecté - initialisation limitée');
        onProgress?.({
          step: 'offline',
          progress: 50,
          message: 'Mode hors ligne - chargement des données en cache...'
        });
        
        // En mode hors ligne, on initialise seulement les caches locaux
        await imageCacheService.initialize();
        this.isInitialized = true;
        return;
      }
      
      // Mode en ligne - initialisation complète
      return this.initialize(onProgress);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation avec vérification de connectivité:', error);
      throw error;
    }
  }
}

// Instance singleton
export const appInitializationService = new AppInitializationService();

// Types exportés pour l'utilisation dans les composants
export type { InitializationProgress, ProgressCallback }; 