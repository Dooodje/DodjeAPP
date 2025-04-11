import { Timestamp } from 'firebase/firestore';

export interface UserData {
  id: string;
  email: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  displayName?: string;
  photoURL?: string;
  subscription?: {
    plan: 'monthly' | 'yearly';
    status: 'active' | 'cancelled' | 'expired';
    startDate: Timestamp;
    endDate: Timestamp;
    autoRenewal: boolean;
  };
} 