
// Import Firebase core from the main firebaseConfig file
import { app, auth, db } from "../firebaseConfig";
import { getAnalytics } from "firebase/analytics";
import { enableIndexedDbPersistence, connectFirestoreEmulator } from "firebase/firestore";
import { connectAuthEmulator } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Log that we're using the unified Firebase configuration
console.log("Firebase utils: Using main Firebase configuration");

// Initialize Firebase services
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  // Analytics may not be available in all environments
  console.log("Analytics not initialized:", error);
}

// Initialize storage using the main app instance
const storage = getStorage(app);

// Enable offline persistence for Firestore with better error handling
try {
  console.log("Attempting to enable Firestore offline persistence");
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.log('The current browser does not support all of the features required to enable persistence');
    } else {
      console.error('Error enabling persistence:', err);
    }
  });
} catch (error) {
  console.error("Failed to setup IndexedDB persistence:", error);
}

// Setup network status monitoring
let isOnline = navigator.onLine;
const networkListeners = new Set<(isOnline: boolean) => void>();

const updateNetworkStatus = () => {
  const wasOnline = isOnline;
  isOnline = navigator.onLine;
  
  if (wasOnline !== isOnline) {
    console.log(`Network status changed: ${isOnline ? 'online' : 'offline'}`);
    // Notify all listeners
    networkListeners.forEach(listener => listener(isOnline));
  }
};

// Set up network status listeners
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

// Function to subscribe to network status changes
export const onNetworkStatusChange = (callback) => {
  networkListeners.add(callback);
  // Initial call with current status
  callback(isOnline);
  
  // Return unsubscribe function
  return () => {
    networkListeners.delete(callback);
  };
};

// Get current network status
export const getNetworkStatus = () => isOnline;

// Enable Firebase Auth log debugging in development
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase Auth debugging enabled');
}

export { app, analytics, db, auth, storage };
