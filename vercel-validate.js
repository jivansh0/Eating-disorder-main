// Pre-deployment validation script 
// Run this during the build process to verify environment variables

const checkEnvVars = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID'
  ];
  
  // Count missing variables
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
      console.warn(`⚠️ WARNING: Missing environment variable: ${varName}`);
    } else {
      console.log(`✅ Found environment variable: ${varName}`);
    }
  });
  
  if (missingVars.length > 0) {
    console.warn('\n⚠️ Some environment variables are missing.');
    console.warn('The application will use fallback values, but this is not recommended.');
    console.warn('Set these variables in your Vercel project settings.\n');
  } else {
    console.log('\n✅ All required environment variables are set.\n');
  }
  
  // Check if we're running on Vercel
  if (process.env.VERCEL) {
    console.log('✅ Running on Vercel');
    
    // Check for authorized domains
    if (process.env.VERCEL_URL && !process.env.VITE_AUTHORIZED_DOMAINS?.includes(process.env.VERCEL_URL)) {
      console.warn(`⚠️ WARNING: Your Vercel URL (${process.env.VERCEL_URL}) is not in VITE_AUTHORIZED_DOMAINS`);
      console.warn('You may need to add it to Firebase Authentication authorized domains.\n');
    }
  }
};

// Run checks
checkEnvVars();
