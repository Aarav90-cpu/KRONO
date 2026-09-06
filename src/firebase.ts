import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBiRCS4_epveUuPIDhOFdWgyGARlxT_jhI",
  authDomain: "krono-social.firebaseapp.com",
  projectId: "krono-social",
  storageBucket: "krono-social.firebasestorage.app",
  messagingSenderId: "212307843761",
  appId: "1:212307843761:web:a7fcf49bfccc18f1112090",
  measurementId: "G-ERXXNBG5BG",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics conditionally if supported in environment
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Ignore analytics unsupported in non-standard environments
    });
}
