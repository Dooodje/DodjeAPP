/**
 * Fichier de typages globaux pour le projet
 * Définit des types et interfaces globales utilisés dans l'application
 */

// Définition de Image pour la compatibilité web
interface ImageEventTarget extends EventTarget {
  src?: string;
}

interface ImageEvent extends Event {
  target: ImageEventTarget;
}

// Classe Image pour le web qui n'est pas définie par défaut en TypeScript
declare class Image {
  src: string;
  onload: () => void;
  onerror: (event: ImageEvent | string) => void;
  width: number;
  height: number;
}

// Ajout de types pour éviter les erreurs lors de l'utilisation de APIs natives sur le web
declare namespace NodeJS {
  interface Timeout {}
  interface Timer {}
}

// Types utiles pour les timeout dans useDebounce
declare interface Window {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
}

// Types pour la compatibilité avec Firebase et IAP
declare interface IAPPurchase {
  productId: string;
  transactionId: string;
  transactionDate: number;
  transactionReceipt: string;
}

// Types utilitaires pour le projet
declare type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>
};

declare type Nullable<T> = T | null;
declare type Optional<T> = T | undefined; 