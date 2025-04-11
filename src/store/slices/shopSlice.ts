import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ShopState, TokenPack, DodjeOneSubscription, Transaction } from '../../types/shop';

const initialState: ShopState = {
  tokenPacks: [],
  subscription: null,
  transactions: [],
  isLoading: false,
  error: null,
  selectedPack: null,
  selectedSubscription: null,
  isPurchasing: false
};

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    setTokenPacks: (state, action: PayloadAction<TokenPack[]>) => {
      state.tokenPacks = action.payload;
    },
    setSubscription: (state, action: PayloadAction<DodjeOneSubscription | null>) => {
      state.subscription = action.payload;
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    selectPack: (state, action: PayloadAction<TokenPack | null>) => {
      state.selectedPack = action.payload;
    },
    selectSubscription: (state, action: PayloadAction<DodjeOneSubscription | null>) => {
      state.selectedSubscription = action.payload;
    },
    setPurchasing: (state, action: PayloadAction<boolean>) => {
      state.isPurchasing = action.payload;
    },
    resetShop: (state) => {
      state.tokenPacks = [];
      state.subscription = null;
      state.transactions = [];
      state.isLoading = false;
      state.error = null;
      state.selectedPack = null;
      state.selectedSubscription = null;
      state.isPurchasing = false;
    }
  }
});

export const {
  setTokenPacks,
  setSubscription,
  setTransactions,
  addTransaction,
  setLoading,
  setError,
  selectPack,
  selectSubscription,
  setPurchasing,
  resetShop
} = shopSlice.actions;

export default shopSlice.reducer; 