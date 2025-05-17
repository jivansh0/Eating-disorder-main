
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAF1Swurg_GF5n6HKbvySocD7nNogrWDQ8",
  authDomain: "recovery-journey-e950b.firebaseapp.com",
  projectId: "recovery-journey-e950b",
  storageBucket: "recovery-journey-e950b.firebasestorage.app",
  messagingSenderId: "312698346068",
  appId: "1:312698346068:web:d35ff0ebefe7597564ebc1",
  measurementId: "G-CZKZQTV96F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  // Analytics may not be available in all environments
  console.log("Analytics not initialized:", error);
}

const db = getFirestore(app);
const auth = getAuth(app);
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
