import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

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
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

/**
 * Connect to Firebase Emulators in Development
 * Uncomment to use local emulators
 */
if (import.meta.env.DEV && false) { // Set to true when using emulators
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
