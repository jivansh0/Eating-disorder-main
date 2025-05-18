// This script injects Vercel environment variables into window.ENV
// This helps with debugging and accessing environment variables in the browser
(function() {
  // Create a safe environment variables object
  window.ENV = window.ENV || {};
  
  // Function to safely expose environment variables (without exposing sensitive values)
  function safelyExposeEnvVars() {
    // Check for Vercel environment variables (they will be injected at build time)
    if (typeof VITE_VERCEL_ENV_VARS !== 'undefined' && VITE_VERCEL_ENV_VARS) {
      try {
        const envVars = JSON.parse(VITE_VERCEL_ENV_VARS);
        for (const key in envVars) {
          if (key.startsWith('VITE_')) {
            // For security, we don't log the actual values of API keys
            const isApiKey = key.includes('API_KEY');
            window.ENV[key] = envVars[key];
            console.log(`[ENV] Found ${key}: ${isApiKey ? '[REDACTED]' : '✓'}`);
          }
        }
      } catch (e) {
        console.error('[ENV] Error parsing Vercel environment variables:', e);
      }
    }
  }

  // Run on page load
  safelyExposeEnvVars();
  
  // Add status to window for diagnostics
  window.ENV_LOADED = true;
  
  // Log status to console
  console.log('[ENV] Environment variables loaded:', !!window.ENV_LOADED);
})();
