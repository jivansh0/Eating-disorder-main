import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Check for essential Firebase configuration variables
const checkRequiredEnvVars = () => {
  const requiredVars = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID'];
  const missing = requiredVars.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    // Add to localStorage for debugging
    localStorage.setItem('firebase_config_error', `Missing env vars: ${missing.join(', ')}`);
  }
};

// Run check (will log warnings but still attempt to initialize)
checkRequiredEnvVars();

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'MISSING_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'recovery-journey-e950b.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'recovery-journey-e950b',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'recovery-journey-e950b.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '312698346068',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:312698346068:web:d35ff0ebefe7597564ebc1',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-CZKZQTV96F',
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

// For debugging
console.log('Firebase config (safe to log):', {
  authDomain: enhancedConfig.authDomain,
  projectId: enhancedConfig.projectId,
  storageBucket: enhancedConfig.storageBucket
});

// Save config info for debugging
localStorage.setItem('firebase_auth_domain', enhancedConfig.authDomain || 'not_set');
localStorage.setItem('firebase_project_id', enhancedConfig.projectId || 'not_set');
localStorage.setItem('current_domain', window.location.hostname);
localStorage.setItem('app_environment', import.meta.env.VITE_APP_ENVIRONMENT || 'not_set');

// Try to initialize Firebase with error handling
let app, auth, db;
try {
  app = initializeApp(enhancedConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  console.log("Firebase initialized successfully");
  localStorage.setItem('firebase_init_status', 'success');
} catch (error) {
  console.error("Error initializing Firebase:", error);
  localStorage.setItem('firebase_init_error', error.message);
  
  // Create fallback objects to prevent further errors
  // This way the app can at least render something instead of showing a blank screen
  app = { name: 'firebase-init-failed' };
  auth = { 
    currentUser: null,
    onAuthStateChanged: (callback) => { callback(null); return () => {}; }
  };
  db = { collection: () => ({ doc: () => ({ get: () => Promise.resolve({ exists: false }) }) }) };
}

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