import {
  initConnection,
  getProducts,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  finishTransaction,
  ProductPurchase,
  PurchaseError,
  Product,
  PurchaseResult,
  Purchase
} from 'react-native-iap';
import { Platform } from 'react-native';

// IDs des produits dans les stores
const PRODUCT_IDS = {
  // Packs de Dodji
  DODJI_SMALL: 'dodji_small',
  DODJI_MEDIUM: 'dodji_medium',
  DODJI_LARGE: 'dodji_large',
  DODJI_XLARGE: 'dodji_xlarge',
  
  // Abonnements DodjeOne
  DODJEONE_MONTHLY: 'dodjeone_monthly',
  DODJEONE_YEARLY: 'dodjeone_yearly'
};

class IAPService {
  private static instance: IAPService;
  private isInitialized = false;
  private products: Product[] = [];

  private constructor() {}

  static getInstance(): IAPService {
    if (!IAPService.instance) {
      IAPService.instance = new IAPService();
    }
    return IAPService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Vérifier si nous sommes sur une plateforme supportée
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.log('IAP non supporté sur cette plateforme');
      this.isInitialized = true;
      return;
    }

    try {
      await initConnection();
      
      // Configurer les listeners
      purchaseErrorListener((error: PurchaseError) => {
        console.error('Erreur d\'achat:', error);
      });

      purchaseUpdatedListener(async (purchase: ProductPurchase) => {
        await this.handlePurchase(purchase);
      });

      // Récupérer les produits seulement si nous avons des IDs de produits définis
      const productIds = Object.values(PRODUCT_IDS);
      if (productIds.length > 0) {
        try {
          this.products = await getProducts({ skus: productIds });
        } catch (productError) {
          console.warn('Erreur lors de la récupération des produits:', productError);
        }
      } else {
        console.warn('Aucun ID de produit défini pour les achats in-app');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Erreur d\'initialisation IAP:', error);
      // Marquer comme initialisé même en cas d'erreur pour ne pas bloquer l'app
      this.isInitialized = true;
    }
  }

  private async handlePurchase(purchase: ProductPurchase): Promise<void> {
    try {
      // Valider la transaction
      if (purchase.transactionReceipt) {
        // TODO: Valider le reçu avec le backend
      }

      // Finaliser la transaction
      try {
        // On ne peut pas directement passer purchase, on doit construire un objet conforme
        await finishTransaction({
          purchase: purchase as unknown as Purchase,
          isConsumable: true
        });
      } catch (finishError) {
        console.error('Erreur lors de la finalisation de la transaction:', finishError);
      }

      // TODO: Mettre à jour le backend avec les détails de l'achat
    } catch (error) {
      console.error('Erreur lors du traitement de l\'achat:', error);
    }
  }

  async purchaseProduct(productId: string): Promise<PurchaseResult | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Vérifier si nous sommes sur une plateforme supportée
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.log('Achat non supporté sur cette plateforme');
      return null;
    }

    try {
      const result = await requestPurchase({ sku: productId });
      return result as PurchaseResult;
    } catch (error) {
      console.error('Erreur lors de l\'achat:', error);
      return null;
    }
  }

  getProduct(productId: string): Product | undefined {
    return this.products.find(product => product.productId === productId);
  }

  getAllProducts(): Product[] {
    return this.products;
  }
}

export const iapService = IAPService.getInstance(); 