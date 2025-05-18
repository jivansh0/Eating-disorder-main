
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

// Check for required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID'
];

// Log environment variables to help debug deployment issues
console.log('Environment variables check:');
requiredEnvVars.forEach(key => {
  const value = import.meta.env[key];
  console.log(`${key}: ${value ? '✓ Available' : '✗ Missing'}`);
});

// Special handling for Vercel deployments
function detectVercelEnvironment() {
  const isVercel = window.location.hostname.includes('vercel.app');
  if (isVercel) {
    console.log('Vercel deployment detected:', window.location.hostname);
    
    // Store this information for debugging
    localStorage.setItem('isVercel', 'true');
    localStorage.setItem('vercelDomain', window.location.hostname);
    
    // Set verification point
    localStorage.setItem('mainVercelDetection', 'true');
    
    // For Vercel domains, we'll add this domain to Firebase Auth automatically
    // The app will load this on startup and be available to ErrorBoundary
    window.VERCEL_DOMAIN = window.location.hostname;
  }
}

// Call immediately
detectVercelEnvironment();

// Create a recovery mechanism for white screen issues
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // Log the error to localStorage for diagnostics
  try {
    const errors = JSON.parse(localStorage.getItem('appErrors') || '[]');
    errors.push({
      message: event.error?.message || 'Unknown error',
      stack: event.error?.stack,
      time: new Date().toISOString()
    });
    localStorage.setItem('appErrors', JSON.stringify(errors));
  } catch (e) {
    console.error('Error logging to localStorage:', e);
  }
  
  // If error occurs in first 5 seconds of load, show a simple error message
  if (document.body && document.getElementById('root')) {
    const rootElement = document.getElementById('root');
    if (rootElement && rootElement.children.length === 0) {
      rootElement.innerHTML = `
        <div style="font-family: sans-serif; padding: 20px; text-align: center;">
          <h1>Application Error</h1>
          <p>The application failed to initialize properly.</p>
          <p>Error: ${event.error?.message || 'Unknown error'}</p>
          <div style="margin: 20px 0;">
            <button onclick="window.location.reload()" style="background-color: #6667ab; color: white; border: none; padding: 10px 15px; margin-right: 10px; border-radius: 4px; cursor: pointer;">
              Refresh Page
            </button>
            <a href="/env-check.html" style="background-color: #4a5568; color: white; text-decoration: none; padding: 10px 15px; border-radius: 4px;">
              Diagnostics
            </a>
          </div>
          <p style="margin-top: 20px; font-size: 12px;">
            If the problem persists, please check the diagnostics or browser console for more details.
          </p>
        </div>
      `;
    }
  }
});

// Import Firebase initialization after environment variable checks
// Make sure we're using the correct Firebase config
import { app, auth, db } from './firebaseConfig';

// Display Firebase initialization status
console.log('Firebase initialization status:', {
  appInitialized: !!app,
  authInitialized: !!auth,
  dbInitialized: !!db
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
