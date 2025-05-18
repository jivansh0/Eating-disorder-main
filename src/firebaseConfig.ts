import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Function to get environment variables from all possible sources
const getEnvVar = (key: string): string => {
  // Try window.ENV first (from env-inject.js)
  const customWindow = window as Window & { ENV?: Record<string, string> };
  if (customWindow.ENV && customWindow.ENV[key]) {
    return customWindow.ENV[key];
  }
  
  // Then try import.meta.env
  if (import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  
  return '';
};

// Check for essential Firebase configuration variables
const checkRequiredEnvVars = () => {
  const requiredVars = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID'];
  const missing = requiredVars.filter(key => !getEnvVar(key));
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    // Add to localStorage for debugging
    localStorage.setItem('firebase_config_error', `Missing env vars: ${missing.join(', ')}`);
  }
  
  // Log environment variable sources for debugging
  const customWindow = window as Window & { ENV?: Record<string, string> };
  console.log('ENV sources check:', {
    windowENV: customWindow.ENV ? 'Available' : 'Not available',
    importMetaEnv: import.meta.env ? 'Available' : 'Not available'
  });
};

// Run check (will log warnings but still attempt to initialize)
checkRequiredEnvVars();

// Your web app's Firebase configuration
// Try to use the pre-initialized config from env-init.js first
const customWindow = window as Window & { 
  ENV?: Record<string, string>;
  FIREBASE_CONFIG?: Record<string, string>;
};

// Use pre-initialized Firebase config if available (from env-init.js)
const firebaseConfig = customWindow.FIREBASE_CONFIG || {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY') || import.meta.env.VITE_FIREBASE_API_KEY || 'MISSING_API_KEY',
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'recovery-journey-e950b.firebaseapp.com',
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID') || import.meta.env.VITE_FIREBASE_PROJECT_ID || 'recovery-journey-e950b',
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'recovery-journey-e950b.firebasestorage.app',
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '312698346068',
  appId: getEnvVar('VITE_FIREBASE_APP_ID') || import.meta.env.VITE_FIREBASE_APP_ID || '1:312698346068:web:d35ff0ebefe7597564ebc1',
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID') || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-CZKZQTV96F',
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
  
  // HIGH PRIORITY: Check if we've already set this domain in env-init.js
  const customWindow = window as Window & { FIREBASE_CONFIG?: Record<string, string> };
  if (customWindow.FIREBASE_CONFIG && customWindow.FIREBASE_CONFIG.authDomain === currentDomain) {
    console.log("Using domain already set by env-init.js:", currentDomain);
    return {
      ...config,
      authDomain: currentDomain
    };
  }
  
  // Check if we have authorized domains in environment variables
  const authorizedDomains = getEnvVar('VITE_AUTHORIZED_DOMAINS') || import.meta.env.VITE_AUTHORIZED_DOMAINS;
  
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
  
  // ALWAYS use current domain for Vercel deployments (highest priority)
  if (currentDomain.includes('vercel.app')) {
    console.log("Detected Vercel deployment, using current domain:", currentDomain);
    
    // Save this for debugging
    localStorage.setItem('using_vercel_domain', 'true');
    localStorage.setItem('vercel_domain', currentDomain);
    
    return {
      ...config,
      authDomain: currentDomain
    };
  }
  
  // For production environments, use the current domain
  const appEnv = getEnvVar('VITE_APP_ENVIRONMENT') || import.meta.env.VITE_APP_ENVIRONMENT;
  if (appEnv === 'production') {
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

// Function to determine if we're on Vercel
const isVercelDeployment = () => {
  const hostname = window.location.hostname;
  return hostname.includes('vercel.app');
};

// Set a flag for Vercel deployment
const IS_VERCEL = isVercelDeployment();
if (IS_VERCEL) {
  console.log("Detected Vercel deployment environment");
  localStorage.setItem('deployment_platform', 'vercel');
  localStorage.setItem('vercel_domain', window.location.hostname);
}

// Try to initialize Firebase with error handling
let app, auth, db;
try {
  // Attempt initialization
  console.log("Initializing Firebase with config:", {
    authDomain: enhancedConfig.authDomain,
    projectId: enhancedConfig.projectId
  });
  
  app = initializeApp(enhancedConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Test Firebase auth to ensure it's working
  auth.onAuthStateChanged(() => {});
  
  console.log("Firebase initialized successfully");
  localStorage.setItem('firebase_init_status', 'success');
  localStorage.setItem('firebase_init_time', new Date().toISOString());
} catch (error: any) {
  console.error("Error initializing Firebase:", error);
  localStorage.setItem('firebase_init_error', error.message || 'Unknown error');
  localStorage.setItem('firebase_init_error_time', new Date().toISOString());
  
  // Special handling for Vercel deployments
  if (IS_VERCEL) {
    console.warn("Attempting recovery for Vercel deployment");
    try {
      // For Vercel deployments, try again with current domain as authDomain
      const vercelConfig = {
        ...enhancedConfig,
        authDomain: window.location.hostname
      };
      
      app = initializeApp(vercelConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      
      console.log("Firebase recovered on Vercel using current domain");
      localStorage.setItem('firebase_recovery', 'success');
    } catch (recoveryError: any) {
      console.error("Recovery attempt failed:", recoveryError);
      localStorage.setItem('firebase_recovery_error', recoveryError.message || 'Unknown error');
      
      // Create fallback objects to prevent further errors
      app = { name: 'firebase-init-failed' };
      auth = { 
        currentUser: null,
        onAuthStateChanged: (callback: (user: null) => void) => { callback(null); return () => {}; }
      };
      db = { collection: () => ({ doc: () => ({ get: () => Promise.resolve({ exists: false }) }) }) };
    }
  } else {
    // Create fallback objects to prevent further errors
    app = { name: 'firebase-init-failed' };
    auth = { 
      currentUser: null,
      onAuthStateChanged: (callback: (user: null) => void) => { callback(null); return () => {}; }
    };
    db = { collection: () => ({ doc: () => ({ get: () => Promise.resolve({ exists: false }) }) }) };
  }
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
    if (auth && typeof auth.onAuthStateChanged === 'function') {
      // Make sure auth is properly initialized before trying to set persistence
      await setPersistence(auth, browserLocalPersistence);
      console.log("Firebase persistence set to LOCAL");
      
      // Store auth initialization status
      window.localStorage.setItem('firebaseInitialized', 'true');
      window.localStorage.setItem('persistenceTime', new Date().toISOString());
      
      // Check if auth is already initialized with a user
      const currentUser = auth.currentUser;
      if (currentUser) {
        console.log("Found existing Firebase user on initialization:", currentUser.uid);
        // Store this information to help with debugging
        window.localStorage.setItem('firebaseUserDetected', currentUser.uid);
        window.localStorage.setItem('firebaseUserTime', new Date().toISOString());
      }
    } else {
      console.error("Auth not properly initialized, can't set persistence");
      window.localStorage.setItem('persistenceError', 'Auth not properly initialized');
    }
  } catch (error: any) {
    console.error("Error setting persistence:", error);
    window.localStorage.setItem('persistenceError', error?.message || 'Unknown error');
  }
})();

export { app, auth, db, googleProvider };