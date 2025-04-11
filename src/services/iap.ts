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
  PurchaseResult
} from 'react-native-iap';

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

    try {
      await initConnection();
      
      // Configurer les listeners
      purchaseErrorListener((error: PurchaseError) => {
        console.error('Erreur d\'achat:', error);
      });

      purchaseUpdatedListener(async (purchase: ProductPurchase) => {
        await this.handlePurchase(purchase);
      });

      // Récupérer les produits
      this.products = await getProducts(Object.values(PRODUCT_IDS));
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Erreur d\'initialisation IAP:', error);
      throw error;
    }
  }

  private async handlePurchase(purchase: ProductPurchase): Promise<void> {
    try {
      // Valider la transaction
      if (purchase.transactionReceipt) {
        // TODO: Valider le reçu avec le backend
      }

      // Finaliser la transaction
      await finishTransaction(purchase);

      // TODO: Mettre à jour le backend avec les détails de l'achat
    } catch (error) {
      console.error('Erreur lors du traitement de l\'achat:', error);
      throw error;
    }
  }

  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const result = await requestPurchase(productId);
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'achat:', error);
      throw error;
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