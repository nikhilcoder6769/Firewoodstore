import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "zinc-purpose-zlsxp",
  appId: "1:588869980872:web:5aa75b0d5702ac47700bfd",
  apiKey: "AIzaSyD8cJCqpJOhi4ZTGza_NwpZJnZdJOJ2f-8",
  authDomain: "zinc-purpose-zlsxp.firebaseapp.com",
  storageBucket: "zinc-purpose-zlsxp.firebasestorage.app",
  messagingSenderId: "588869980872",
  measurementId: "",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-2d69b9e1-6f28-4389-af15-9410dd704eef");
export const storage = getStorage(app);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send'
];

export const googleProvider = new GoogleAuthProvider();
SCOPES.forEach(scope => googleProvider.addScope(scope));

let cachedAccessToken: string | null = null;

export const getAccessToken = () => cachedAccessToken;

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential && credential.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};
