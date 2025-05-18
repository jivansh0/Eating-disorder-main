# Vercel Deployment Fixes

This document outlines the changes made to fix the white screen issue in the Eating Disorder Recovery app when deployed on Vercel.

## Overview of Fixes

### 1. Environment Variable Handling

- Created an early initializer script (`env-init.js`) that runs before any other JavaScript
- Added fallback values for critical Firebase configuration values
- Implemented multiple layers of environment variable retrieval:
  - First from `window.ENV` (populated by `env-init.js`)
  - Then from `import.meta.env` (Vite standard)
  - Finally from hardcoded fallbacks as last resort

### 2. Improved Error Handling

- Enhanced the ErrorBoundary component with better diagnostic information
- Added diagnostic data collection in localStorage
- Created comprehensive debug tools (`env-check.html` and `env-debug.js`)
- Added error recovery mechanisms and user-friendly error messages

### 3. Vercel-Specific Adjustments

- Added detection for Vercel deployments
- Modified the Firebase authDomain to use the Vercel URL automatically
- Ensured environment variables are properly serialized for client-side use

## Deployment Instructions

1. Make sure all required environment variables are set in Vercel:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `VITE_GEMINI_API_KEY`
   - `VITE_APP_ENVIRONMENT` (set to "production")
   - `VITE_AUTHORIZED_DOMAINS` (comma-separated list, include your Vercel domain)

2. Update Firebase Authentication:
   - Go to Firebase Console > Authentication > Settings > Authorized domains
   - Add your Vercel domain (e.g., `your-app.vercel.app`)

3. After deployment, check for issues using:
   - The diagnostic page at `/env-check.html`
   - Browser console logs for initialization errors

## Troubleshooting

If you still encounter issues:

1. Check the browser console for specific error messages
2. Visit `/env-check.html` to verify environment variables are properly loaded
3. Verify that Firebase Authentication accepts your Vercel domain
4. Check localStorage for error data using browser developer tools

## Technical Implementation

The fixes work by:

1. Initializing environment variables as early as possible
2. Providing multiple fallback mechanisms for configuration
3. Detecting the deployment environment and adjusting Firebase accordingly
4. Adding detailed error reporting and diagnostic tools
