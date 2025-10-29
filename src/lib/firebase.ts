import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import type { Analytics } from 'firebase/analytics';

/**
 * Firebase Configuration
 * Values loaded from environment variables (Vite)
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    'Firebase config is missing! Make sure .env.local file exists with all VITE_FIREBASE_* variables.'
  );
}

/**
 * Initialize Firebase App
 */
export const app = initializeApp(firebaseConfig);

/**
 * Firebase Services
 */
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'europe-west1'); // Closest region to Ghana

/**
 * Lazy-loaded Firebase Analytics
 *
 * Why lazy load?
 * - Analytics is NOT critical for initial page render
 * - Loading synchronously blocks LCP by 2-3 seconds
 * - Users don't see/need analytics data immediately
 *
 * Call initAnalytics() after your page renders, typically in a useEffect:
 *
 * useEffect(() => {
 *   initAnalytics(); // Non-blocking, loads in background
 * }, []);
 */
let analyticsInstance: Analytics | null = null;

export const initAnalytics = async (): Promise<Analytics | null> => {
  // Only load in browser (not during SSR)
  if (typeof window === 'undefined') {
    return null;
  }

  // Return cached instance if already loaded
  if (analyticsInstance) {
    return analyticsInstance;
  }

  try {
    // Dynamically import analytics module (code-split)
    const { getAnalytics } = await import('firebase/analytics');
    analyticsInstance = getAnalytics(app);
    console.log('📊 Firebase Analytics initialized (lazy-loaded)');
    return analyticsInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Analytics:', error);
    return null;
  }
};

// Getter for analytics instance (use after initAnalytics() has been called)
export const getAnalyticsInstance = (): Analytics | null => analyticsInstance;

/**
 * Connect to Firebase emulators when explicitly enabled.
 * Toggle via VITE_USE_FIREBASE_EMULATORS=true in .env.*.
 */
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  console.log('🔧 Connected to Firebase Emulators');
}

/**
 * Enable Offline Persistence for Firestore
 * Allows app to work offline (important for Ghana 3G/4G networks)
 */
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log('✅ Firestore offline persistence enabled');
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('⚠️ Multiple tabs open, offline persistence disabled');
      } else if (err.code === 'unimplemented') {
        console.warn('⚠️ Browser does not support offline persistence');
      } else {
        console.error('❌ Error enabling offline persistence:', err);
      }
    });
}

/**
 * Firebase Project Info
 */
console.log('🔥 Firebase initialized:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  region: 'europe-west1',
});
