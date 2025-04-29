import { Timestamp } from 'firebase/firestore';

export interface DodjiTransaction {
    id?: string;
    userId: string;
    amount: number;
    source: 'quiz' | 'admin' | 'system' | 'parcours_completion';
    sourceId?: string; // ID du quiz ou autre source
    description: string;
    createdAt: Date;
}

export interface UserDodji {
    userId: string;
    total: number;
    transactions: DodjiTransaction[];
    lastUpdated: Date;
    [key: string]: any; // Pour permettre des propriétés dynamiques
} 