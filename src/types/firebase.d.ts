import { FirebaseApp } from '@firebase/app-types';
import { Auth } from '@firebase/auth-types';
import { Firestore } from '@firebase/firestore-types';
import { Storage } from '@firebase/storage-types';

declare module 'firebase/app' {
  interface FirebaseApp {
    name: string;
    options: object;
  }
  
  function initializeApp(config: any): FirebaseApp;
}

declare module 'firebase/auth' {
  interface Auth {
    currentUser: User | null;
    onAuthStateChanged(callback: (user: User | null) => void): () => void;
    signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;
    createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;
    signOut(): Promise<void>;
  }

  interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }

  interface UserCredential {
    user: User;
  }

  function getAuth(): Auth;
}

declare module 'firebase/firestore' {
  interface Firestore {
    type: 'firestore';
    app: import('firebase/app').FirebaseApp;
  }

  interface DocumentData {
    [field: string]: any;
  }

  interface DocumentReference<T = DocumentData> {
    id: string;
    path: string;
    firestore: Firestore;
  }

  interface DocumentSnapshot<T = DocumentData> {
    id: string;
    exists(): boolean;
    data(): T | undefined;
  }

  class Timestamp {
    seconds: number;
    nanoseconds: number;
    static now(): Timestamp;
    static fromDate(date: Date): Timestamp;
    toDate(): Date;
  }

  function getFirestore(): Firestore;
  function doc(firestore: Firestore, ...pathSegments: string[]): DocumentReference;
  function getDoc<T>(ref: DocumentReference<T>): Promise<DocumentSnapshot<T>>;
  function setDoc<T>(ref: DocumentReference<T>, data: T): Promise<void>;
  function updateDoc<T>(ref: DocumentReference<T>, data: Partial<T>): Promise<void>;
}

declare module 'firebase/storage' {
  interface Storage {
    app: import('firebase/app').FirebaseApp;
  }

  interface StorageReference {
    bucket: string;
    fullPath: string;
    name: string;
    storage: Storage;
  }

  interface UploadTaskSnapshot {
    ref: StorageReference;
    state: string;
    bytesTransferred: number;
    totalBytes: number;
  }

  function getStorage(): Storage;
  function ref(storage: Storage, path?: string): StorageReference;
  function uploadBytes(ref: StorageReference, data: Uint8Array | Blob | ArrayBuffer): Promise<UploadTaskSnapshot>;
  function getDownloadURL(ref: StorageReference): Promise<string>;
}

declare module 'firebase/auth' {
  export * from 'firebase/auth';
}

declare module 'firebase/firestore' {
  export * from 'firebase/firestore';
}

declare module 'firebase/storage' {
  export * from 'firebase/storage';
}

declare module 'firebase/app' {
  export interface FirebaseApp {
    auth(): import('firebase/auth').Auth;
    firestore(): import('firebase/firestore').Firestore;
    storage(): import('firebase/storage').Storage;
  }
}

declare module '@firebase/firestore' {
  export interface DocumentData {
    [field: string]: any;
  }

  export interface DocumentReference<T = DocumentData> {
    id: string;
    path: string;
  }

  export interface DocumentSnapshot<T = DocumentData> {
    id: string;
    exists(): boolean;
    data(): T | undefined;
  }

  export class Timestamp {
    static now(): Timestamp;
    static fromDate(date: Date): Timestamp;
    toDate(): Date;
  }

  export function doc(firestore: any, ...pathSegments: string[]): DocumentReference;
  export function getDoc<T>(ref: DocumentReference<T>): Promise<DocumentSnapshot<T>>;
  export function setDoc<T>(ref: DocumentReference<T>, data: T): Promise<void>;
  export function updateDoc<T>(ref: DocumentReference<T>, data: Partial<T>): Promise<void>;
}

declare module 'firebase/storage' {
  export interface Storage {
    ref(path: string): StorageReference;
  }

  export interface StorageReference {
    put(file: Blob | File): Promise<UploadTaskSnapshot>;
    getDownloadURL(): Promise<string>;
  }

  export interface UploadTaskSnapshot {
    ref: StorageReference;
    state: string;
    downloadURL: string | null;
  }
} 