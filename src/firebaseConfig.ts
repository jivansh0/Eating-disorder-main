import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Create and configure Google provider with proper scopes
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Set persistent authentication - IMPORTANT for session persistence
// This keeps the user logged in even after browser restarts or refreshes
(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log("Firebase persistence set to LOCAL");
    
    // Store auth initialization status
    window.localStorage.setItem('firebaseInitialized', 'true');
    
    // Check if auth is already initialized with a user
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log("Found existing Firebase user on initialization:", currentUser.uid);
      // Store this information to help with debugging
      window.localStorage.setItem('firebaseUserDetected', currentUser.uid);
    }
  } catch (error) {
    console.error("Error setting persistence:", error);
  }
})();

export { app, auth, db, googleProvider };