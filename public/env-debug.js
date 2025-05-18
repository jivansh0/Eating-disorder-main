// This file helps debug environment variables in the deployed environment
// It's accessible at /env-check.html

const debugDiv = document.getElementById('debug-info');
const envDiv = document.getElementById('env-vars');
const domainDiv = document.getElementById('domain-info');

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

// Check environment variables
const checkEnvVars = () => {
  const importMetaEnv = window.ENV || {};
  
  const envVarNames = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_APP_ENVIRONMENT',
    'VITE_AUTHORIZED_DOMAINS'
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
window.ENV = {};
try {
  // This will only work during build time with Vite
  // In production, these values should be replaced with actual values
  window.ENV = {
    VITE_FIREBASE_API_KEY: '***' + (import.meta?.env?.VITE_FIREBASE_API_KEY || '').substring(3),
    VITE_FIREBASE_AUTH_DOMAIN: import.meta?.env?.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: import.meta?.env?.VITE_FIREBASE_PROJECT_ID,
    VITE_APP_ENVIRONMENT: import.meta?.env?.VITE_APP_ENVIRONMENT,
    VITE_AUTHORIZED_DOMAINS: import.meta?.env?.VITE_AUTHORIZED_DOMAINS
  };
} catch (e) {
  console.log('Error accessing import.meta.env:', e);
}

checkEnvVars();

document.getElementById('refresh-btn').addEventListener('click', () => {
  location.reload();
});

document.getElementById('clear-storage-btn').addEventListener('click', () => {
  localStorage.clear();
  alert('LocalStorage cleared! Refresh to see changes.');
});
