export interface TokenPack {
  id: string;
  name: string;
  description?: string;
  amount: number;      // baseTokens dans Firestore
  price: number;
  bonus?: number;      // bonusPercentage dans Firestore
  isPopular?: boolean;
  isBestValue?: boolean;
  totalTokens?: number; // Total des jetons incluant le bonus
  status?: 'active' | 'inactive';
  createdAt?: Date;
}

export interface DodjeOneSubscription {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'purchase' | 'reward' | 'refund';
  amount: number;
  currency: 'DODJI' | 'EUR' | 'USD';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  timestamp: Date;
  productId: string;
  productType: 'token_pack' | 'subscription';
  receipt?: string;
}

export interface ShopState {
  tokenPacks: TokenPack[];
  subscription: DodjeOneSubscription | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  selectedPack: TokenPack | null;
  selectedSubscription: DodjeOneSubscription | null;
  isPurchasing: boolean;
}

export interface ShopHeaderProps {
  onBack: () => void;
}

export interface DodjiBalanceProps {
  balance: number;
  onRefresh: () => void;
}

export interface TokenPackProps {
  pack: TokenPack;
  onSelect: (pack: TokenPack) => void;
  isSelected: boolean;
}

export interface DodjeOneCardProps {
  subscription: DodjeOneSubscription;
  onSelect: (subscription: DodjeOneSubscription) => void;
  isSelected: boolean;
} 