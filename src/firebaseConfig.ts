/// <reference types="vite/client" />

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
}

function resolveFirebaseConfig(): FirebaseConfig {
  // Check if custom config was saved locally for immediate testing
  try {
    if (typeof window !== 'undefined') {
      const custom = localStorage.getItem('krono_custom_firebase_config');
      if (custom) {
        const parsed = JSON.parse(custom);
        if (parsed.apiKey && parsed.projectId) {
          return parsed;
        }
      }
    }
  } catch {
    // fallback
  }

  return {
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
    measurementId:
      (import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID as string) ||
      (import.meta.env?.VITE_FIREBASE_MEASUREMENTID as string) ||
      'G-ERXXNBG5BG',
    firestoreDatabaseId:
      (import.meta.env?.VITE_FIRESTORE_DATABASE_ID as string) || undefined,
  };
}

export const firebaseConfig: FirebaseConfig = resolveFirebaseConfig();

export default firebaseConfig;


