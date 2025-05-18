// This file is used to check for necessary environment variables
// before building the app

// Check Firebase config
console.log("\n🔍 Checking Firebase configuration...\n");

const requiredVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID"
];

let missingVars = [];
let warningVars = [];

// Check all required variables
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  } else {
    console.log(`✅ Found ${varName}`);
  }
});

// Check optional but important variables
const optionalVars = [
  "VITE_AUTHORIZED_DOMAINS",
  "VITE_APP_ENVIRONMENT",
  "VITE_GEMINI_API_KEY"
];

optionalVars.forEach(varName => {
  if (!process.env[varName]) {
    warningVars.push(varName);
  } else {
    console.log(`✅ Found ${varName}`);
  }
});

// Check .env.production file for Vercel domains
try {
  const fs = require('fs');
  const path = require('path');
  
  // Check if .env.production exists
  const envFile = path.join(process.cwd(), '.env.production');
  if (fs.existsSync(envFile)) {
    console.log("\n✅ Found .env.production file");
    
    // Read file contents
    const envContent = fs.readFileSync(envFile, 'utf8');
    
    // Check if the file has authorized domains
    if (envContent.includes('VITE_AUTHORIZED_DOMAINS')) {
      console.log("✅ Found VITE_AUTHORIZED_DOMAINS in .env.production");
      
      // Check if it includes vercel.app
      if (envContent.includes('vercel.app')) {
        console.log("✅ Vercel domains included in VITE_AUTHORIZED_DOMAINS");
      } else {
        console.log("⚠️  Warning: No vercel.app domains found in VITE_AUTHORIZED_DOMAINS");
        console.log("   Consider adding your Vercel domain to the authorized domains list.");
      }
    } else {
      console.log("⚠️  Warning: VITE_AUTHORIZED_DOMAINS not found in .env.production");
    }
  } else {
    console.log("\n⚠️  Warning: No .env.production file found");
  }
} catch (error) {
  console.error("Error checking .env.production:", error);
}

// Display summary
console.log("\n📊 Environment Check Summary:");
if (missingVars.length > 0) {
  console.log(`❌ Missing required variables: ${missingVars.join(', ')}`);
  console.log("You should set these variables in your Vercel project settings.");
} else {
  console.log("✅ All required variables are set");
}

if (warningVars.length > 0) {
  console.log(`⚠️  Missing optional variables: ${warningVars.join(', ')}`);
  console.log("Consider setting these for better functionality.");
}

console.log("\nContinuing with build...\n");

// Exit with success even if there are missing variables
// We'll let the app handle fallbacks
process.exit(0);
