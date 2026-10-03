import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const isFirebaseConfigured = () => {
  return (
    Boolean(import.meta.env.VITE_FIREBASE_API_KEY) && 
    import.meta.env.VITE_FIREBASE_API_KEY !== "YOUR_FIREBASE_API_KEY"
  );
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Firebase Google Sign-In error:", error);
    
    // If popup is blocked or cross-origin iframe blocked, try Redirect auth
    if (
      error.code === 'auth/popup-blocked' || 
      error.code === 'auth/cancelled-popup-request' ||
      error.code === 'auth/internal-error'
    ) {
      console.log("Attempting signInWithRedirect fallback...");
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (redirectErr) {
        console.error("Redirect auth error:", redirectErr);
      }
    }

    if (error.code === 'auth/internal-error' || error.code === 'auth/operation-not-allowed') {
      const customErr = new Error('Google Sign-In is not enabled or domain authorized in your Firebase Console. Please verify Firebase Console > Authentication settings.');
      customErr.code = error.code;
      throw customErr;
    }
    if (error.code === 'auth/unauthorized-domain') {
      const customErr = new Error(`Domain (${window.location.hostname}) is not authorized in Firebase. Please add BOTH https://mystudyzone.online and https://www.mystudyzone.online in Firebase Console > Authentication > Settings > Authorized domains.`);
      customErr.code = error.code;
      throw customErr;
    }
    if (error.code === 'auth/popup-closed-by-user') {
      const customErr = new Error('Sign-in popup was closed before completing authentication.');
      customErr.code = error.code;
      throw customErr;
    }
    throw error;
  }
};

export const checkRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result ? result.user : null;
  } catch (err) {
    console.error("Error getting redirect result:", err);
    return null;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase Sign-Out error:", error);
  }
};
