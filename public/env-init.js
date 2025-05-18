// This script handles the initialization of environment variables
// and provides fallbacks if needed
// It is injected very early in the page load process

(function setupEnvironment() {
  // Create ENV object if it doesn't exist
  window.ENV = window.ENV || {};
  
  // Try to parse VITE_VERCEL_ENV_VARS (injected at build time)
  try {
    if (typeof VITE_VERCEL_ENV_VARS !== 'undefined') {
      const vercelEnv = JSON.parse(VITE_VERCEL_ENV_VARS);
      for (const key in vercelEnv) {
        if (key.startsWith('VITE_')) {
          window.ENV[key] = vercelEnv[key];
        }
      }
      console.log('✅ Loaded environment variables from VITE_VERCEL_ENV_VARS');
    }
  } catch (e) {
    console.error('❌ Error parsing VITE_VERCEL_ENV_VARS:', e);
  }
    // Essential firebase config with fallback values if needed
  const FIREBASE_CONFIG = {
    apiKey: window.ENV.VITE_FIREBASE_API_KEY || 'AIzaSyAF1Swurg_GF5n6HKbvySocD7nNogrWDQ8',
    authDomain: window.ENV.VITE_FIREBASE_AUTH_DOMAIN || 'recovery-journey-e950b.firebaseapp.com',
    projectId: window.ENV.VITE_FIREBASE_PROJECT_ID || 'recovery-journey-e950b',
    storageBucket: window.ENV.VITE_FIREBASE_STORAGE_BUCKET || 'recovery-journey-e950b.firebasestorage.app',
    messagingSenderId: window.ENV.VITE_FIREBASE_MESSAGING_SENDER_ID || '312698346068',
    appId: window.ENV.VITE_FIREBASE_APP_ID || '1:312698346068:web:d35ff0ebefe7597564ebc1',
    measurementId: window.ENV.VITE_FIREBASE_MEASUREMENT_ID || 'G-CZKZQTV96F'
  };
  
  // Modify authentication domain for Vercel deployments
  const currentDomain = window.location.hostname;
  const isVercel = currentDomain.includes('vercel.app');
  if (isVercel) {
    console.log('[ENV] Detected Vercel deployment, setting authDomain to current domain:', currentDomain);
    FIREBASE_CONFIG.authDomain = currentDomain;
    
    // Store this information for debugging
    localStorage.setItem('using_vercel_domain', 'true');
    localStorage.setItem('vercel_domain', currentDomain);
  }
  
  // Store in localStorage for debugging
  localStorage.setItem('firebase_config_debug', JSON.stringify({
    apiKeyAvailable: !!FIREBASE_CONFIG.apiKey,
    authDomainAvailable: !!FIREBASE_CONFIG.authDomain,
    projectIdAvailable: !!FIREBASE_CONFIG.projectId
  }));
  
  // Store the Firebase config for direct access
  window.FIREBASE_CONFIG = FIREBASE_CONFIG;
  
  // Flag environment as initialized
  window.ENV_INITIALIZED = true;
  
  console.log('✅ Environment initialization complete');
})();
