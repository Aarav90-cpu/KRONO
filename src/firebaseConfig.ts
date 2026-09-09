/// <reference types="vite/client" />

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId: string;
}

export const firebaseConfig: FirebaseConfig = {
  apiKey:
    (import.meta.env?.VITE_FIREBASE_API_KEY as string) ||
    'AIzaSyDummyKeyForBuildAndOfflineTesting',
  authDomain:
    (import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN as string) ||
    'ai-studio-kronodecentraliz.firebaseapp.com',
  projectId:
    (import.meta.env?.VITE_FIREBASE_PROJECT_ID as string) ||
    'ai-studio-kronodecentraliz',
  storageBucket:
    (import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET as string) ||
    'ai-studio-kronodecentraliz.appspot.com',
  messagingSenderId:
    (import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID as string) ||
    '556303840144',
  appId:
    (import.meta.env?.VITE_FIREBASE_APP_ID as string) ||
    '1:556303840144:web:c892b7db54cc48f6af96b8',
  firestoreDatabaseId:
    (import.meta.env?.VITE_FIRESTORE_DATABASE_ID as string) ||
    'ai-studio-kronodecentraliz-c892b7db-54cc-48f6-af96-b80b2aa80bd1',
};

export default firebaseConfig;

