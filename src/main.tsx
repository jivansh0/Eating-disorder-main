
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

// Create a recovery mechanism for white screen issues
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // If error occurs in first 5 seconds of load, show a simple error message
  if (document.body && document.getElementById('root')) {
    const rootElement = document.getElementById('root');
    if (rootElement && rootElement.children.length === 0) {
      rootElement.innerHTML = `
        <div style="font-family: sans-serif; padding: 20px; text-align: center;">
          <h1>Application Error</h1>
          <p>The application failed to initialize properly.</p>
          <p>Error: ${event.error?.message || 'Unknown error'}</p>
          <button onclick="window.location.reload()">Refresh Page</button>
          <p style="margin-top: 20px; font-size: 12px;">
            If the problem persists, please check the browser console for more details.
          </p>
        </div>
      `;
    }
  }
});

// Import Firebase initialization after environment variable checks
import './utils/firebase';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
