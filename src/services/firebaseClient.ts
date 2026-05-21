import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, inMemoryPersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const envValues = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
} as const;

for (const [key, value] of Object.entries(envValues)) {
  if (!value) {
    throw new Error(`Missing Firebase env: ${key}`);
  }
}

const firebaseConfig = {
  apiKey: envValues.apiKey,
  authDomain: envValues.authDomain,
  projectId: envValues.projectId,
  storageBucket: envValues.storageBucket,
  messagingSenderId: envValues.messagingSenderId,
  appId: envValues.appId,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = (() => {
  try {
    return initializeAuth(firebaseApp, { persistence: inMemoryPersistence });
  } catch {
    return getAuth(firebaseApp);
  }
})();

export const db = getFirestore(firebaseApp);
