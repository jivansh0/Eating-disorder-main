import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';

// This hook helps fix login issues by checking the authentication state
// and redirecting the user appropriately
export const useLoginFix = (allowedPaths: string[] = []) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get the current path
    const currentPath = window.location.pathname;
    
    // If we're on an allowed path (like login or register), don't do any checks
    if (allowedPaths.includes(currentPath)) {
      return;
    }
    
    // Check for authentication state directly from Firebase
    const unsubscribe = auth.onAuthStateChanged((user) => {
      // Clear login attempt markers once we're sure the auth state is stable
      if (user) {
        console.log('LoginFix: Firebase user confirmed, user is authenticated');
        localStorage.setItem('authConfirmed', 'true');
        
        // If we're on the login or register page but we have a user, redirect to dashboard
        if (currentPath === '/login' || currentPath === '/register') {
          console.log('LoginFix: User already logged in, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        }
      } else {
        console.log('LoginFix: No Firebase user found');
        localStorage.removeItem('authConfirmed');
        
        // If we're NOT on the login page and there's no user, redirect to login
        if (currentPath !== '/login' && currentPath !== '/register' && 
            currentPath !== '/' && currentPath !== '/crisis-resources') {
          console.log('LoginFix: Not authenticated, redirecting to login');
          navigate('/login', { replace: true });
        }
      }
    });
    
    // Check for recent login attempts that might be stuck
    const loginAttemptCheck = () => {
      const recentLoginAttempt = localStorage.getItem('loginSuccess') || localStorage.getItem('googleLoginSuccess');
      if (recentLoginAttempt) {
        const loginAttemptTime = parseInt(recentLoginAttempt);
        const timeElapsed = Date.now() - loginAttemptTime;
        
        // If there was a login attempt more than 10 seconds ago but we're still on the login page,
        // it might be stuck - force a reload
        if (timeElapsed > 10000 && (currentPath === '/login' || currentPath === '/register')) {
          console.log('LoginFix: Detected stale login attempt, attempting recovery');
          window.location.href = '/dashboard';
        }
      }
    };
    
    // Run the check once on mount
    loginAttemptCheck();
    
    // Clean up the listener on unmount
    return () => unsubscribe();
  }, [navigate, allowedPaths]);
  
  return null;
};
