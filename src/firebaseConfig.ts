import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAF1Swurg_GF5n6HKbvySocD7nNogrWDQ8",
  authDomain: "recovery-journey-e950b.firebaseapp.com",
  projectId: "recovery-journey-e950b",
  storageBucket: "recovery-journey-e950b.firebasestorage.app",
  messagingSenderId: "312698346068",
  appId: "1:312698346068:web:d35ff0ebefe7597564ebc1",
  measurementId: "G-CZKZQTV96F",
  // Optional: Replace with your actual measurement ID
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
  } catch (error) {
    console.error("Error setting persistence:", error);
  }
})();

export { app, auth, db, googleProvider };