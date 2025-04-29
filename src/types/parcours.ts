export type ParcoursStatus = 'blocked' | 'unblocked' | 'in_progress' | 'completed';

export interface UserParcours {
    userId: string;
    parcoursId: string;
    domaine: string;
    status: ParcoursStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface ParcoursStatusUpdate {
    userId: string;
    parcoursId: string;
    domaine: string;
    status: ParcoursStatus;
} 