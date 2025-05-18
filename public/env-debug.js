// This file helps debug environment variables in the deployed environment
// It's accessible at /env-check.html

const debugDiv = document.getElementById('debug-info');
const envDiv = document.getElementById('env-vars');
const domainDiv = document.getElementById('domain-info');
const vercelDiv = document.getElementById('vercel-info');

// Show domain information
domainDiv.innerHTML = `
  <h3>Domain Information</h3>
  <p><strong>Current domain:</strong> ${window.location.hostname}</p>
  <p><strong>Full URL:</strong> ${window.location.href}</p>
`;

// Attempt to load firebase config
try {
  const firebaseConfigFromStorage = {
    authDomain: localStorage.getItem('firebase_auth_domain') || 'Not found',
    projectId: localStorage.getItem('firebase_project_id') || 'Not found',
    currentDomain: localStorage.getItem('current_domain') || 'Not found',
    appEnvironment: localStorage.getItem('app_environment') || 'Not found',
    initStatus: localStorage.getItem('firebase_init_status') || 'Not found',
    initError: localStorage.getItem('firebase_init_error') || 'None'
  };
  
  debugDiv.innerHTML = `
    <h3>Firebase Config From LocalStorage</h3>
    <p><strong>Auth Domain:</strong> ${firebaseConfigFromStorage.authDomain}</p>
    <p><strong>Project ID:</strong> ${firebaseConfigFromStorage.projectId}</p>
    <p><strong>Current Domain:</strong> ${firebaseConfigFromStorage.currentDomain}</p>
    <p><strong>App Environment:</strong> ${firebaseConfigFromStorage.appEnvironment}</p>
    <p><strong>Init Status:</strong> ${firebaseConfigFromStorage.initStatus}</p>
    <p><strong>Init Error:</strong> ${firebaseConfigFromStorage.initError}</p>
  `;
} catch (e) {
  debugDiv.innerHTML = `<p>Error reading local storage: ${e.message}</p>`;
}

// Check for Vercel-specific environment
const checkVercelEnvironment = () => {
  // Check if we're on Vercel
  const isVercel = window.location.hostname.includes('vercel.app');
  
  let html = '<h3>Vercel Deployment Information</h3>';
  
  if (isVercel) {
    html += `
      <p><strong>Vercel Environment:</strong> Detected ✅</p>
      <p><strong>Deployment URL:</strong> ${window.location.origin}</p>
    `;
    
    // Check if VITE_VERCEL_ENV_VARS exists
    if (typeof window.VITE_VERCEL_ENV_VARS !== 'undefined') {
      html += `<p><strong>Vercel ENV Variables:</strong> Available ✅</p>`;
      try {
        const parsedVars = JSON.parse(window.VITE_VERCEL_ENV_VARS);
        const varCount = Object.keys(parsedVars).length;
        html += `<p><strong>Environment Variables Count:</strong> ${varCount}</p>`;
      } catch (e) {
        html += `<p><strong>Error parsing Vercel ENV:</strong> ${e.message}</p>`;
      }
    } else {
      html += `<p><strong>Vercel ENV Variables:</strong> <span style="color:red">Missing ❌</span></p>`;
    }
  } else {
    html += `<p>Not running on Vercel deployment</p>`;
  }
  
  vercelDiv.innerHTML = html;
};

// Check environment variables
const checkEnvVars = () => {
  const importMetaEnv = window.ENV || {};
  
  const envVarNames = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_APP_ENVIRONMENT',
    'VITE_AUTHORIZED_DOMAINS',
    'VITE_GEMINI_API_KEY'
  ];
  
  let html = '<h3>Environment Variables</h3><ul>';
  
  envVarNames.forEach(name => {
    const value = importMetaEnv[name];
    const status = value ? '✅ Available' : '❌ Missing';
    const displayValue = value ? 
      (name.includes('KEY') ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : value) : 
      'Not set';
      
    html += `<li><strong>${name}:</strong> ${status} (${displayValue})</li>`;
  });
  
  html += '</ul>';
  envDiv.innerHTML = html;
};

// Expose env vars for testing (sanitized)
window.ENV = window.ENV || {};

// Check for VITE_VERCEL_ENV_VARS global variable from vite.config.ts
try {
  if (typeof window.VITE_VERCEL_ENV_VARS !== 'undefined') {
    console.log('Found VITE_VERCEL_ENV_VARS, parsing...');
    const parsedVars = JSON.parse(window.VITE_VERCEL_ENV_VARS);
    
    // Copy all variables to window.ENV
    for (const key in parsedVars) {
      if (key.startsWith('VITE_')) {
        window.ENV[key] = parsedVars[key];
      }
    }
  } else {
    console.log('VITE_VERCEL_ENV_VARS not found.');
  }
} catch (e) {
  console.error('Error parsing VITE_VERCEL_ENV_VARS:', e);
}

// Run all checks
checkEnvVars();
checkVercelEnvironment();

document.getElementById('refresh-btn').addEventListener('click', () => {
  location.reload();
});

document.getElementById('clear-storage-btn').addEventListener('click', () => {
  localStorage.clear();
  alert('LocalStorage cleared! Refresh to see changes.');
});
