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

// Add current domain to the list of authorized domains during runtime
// This helps during development and when deploying to various environments
const addCurrentDomainToConfig = (config) => {
  const currentDomain = window.location.hostname;
  console.log("Current domain:", currentDomain);
  
  // Skip for localhost development
  if (currentDomain === 'localhost') {
    return config;
  }
  
  // Check if we have authorized domains in environment variables
  const authorizedDomains = import.meta.env.VITE_AUTHORIZED_DOMAINS;
  
  if (authorizedDomains) {
    console.log("Found authorized domains:", authorizedDomains);
    // Split multiple domains if provided
    const domains = authorizedDomains.split(',').map(d => d.trim());
    
    // If current domain is in the authorized list, use it
    if (domains.includes(currentDomain)) {
      console.log("Using current domain as it's in authorized list:", currentDomain);
      return {
        ...config,
        authDomain: currentDomain
      };
    }
  }
  
  // For Vercel preview deployments (they often have unique subdomains)
  if (currentDomain.includes('vercel.app')) {
    console.log("Detected Vercel deployment, using current domain:", currentDomain);
    return {
      ...config,
      authDomain: currentDomain
    };
  }
  
  // For production environments, use the current domain
  if (import.meta.env.VITE_APP_ENVIRONMENT === 'production') {
    console.log("Using current domain for production:", currentDomain);
    return {
      ...config,
      authDomain: currentDomain
    };
  }
  
  // Default: return the original config
  return config;
};

// Initialize Firebase with potentially enhanced config
const enhancedConfig = addCurrentDomainToConfig(firebaseConfig);
const app = initializeApp(enhancedConfig);
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