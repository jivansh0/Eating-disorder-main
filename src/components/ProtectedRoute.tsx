import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CloudOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading, isOnline } = useAuth();
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const location = useLocation();

  // Check for authentication immediately on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log("Auth check timed out after 8 seconds");
        setLocalLoading(false);
        setAuthChecked(true);
      }, 8000);
      
      // Check if we have a current Firebase user immediately
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        console.log("ProtectedRoute auth direct check:", user?.uid);
        setAuthChecked(true);
        
        if (user) {
          // If Firebase has a user, check if we have cached onboarding status
          const cachedOnboarding = localStorage.getItem(`onboarding_${user.uid}`);
          
          if (cachedOnboarding) {
            setOnboardingCompleted(cachedOnboarding === 'true');
          }
          
          // Also check userOnboardingComplete which might be set by other components
          const alternateCache = localStorage.getItem('userOnboardingComplete');
          if (alternateCache === 'true' && !cachedOnboarding) {
            setOnboardingCompleted(true);
            // Save it in the standard format too
            localStorage.setItem(`onboarding_${user.uid}`, 'true');
          }
          
          // If we're online, fetch the actual onboarding status from Firestore
          if (isOnline) {
            try {
              const userDoc = await getDoc(doc(db, "users", user.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                const completed = userData.onboardingCompleted === true;
                setOnboardingCompleted(completed);
                
                // Cache this result
                localStorage.setItem(`onboarding_${user.uid}`, completed ? 'true' : 'false');
                localStorage.setItem('userOnboardingComplete', completed ? 'true' : 'false');
                
                console.log("Fetched onboarding status from Firestore:", completed);
              } else {
                console.log("User document doesn't exist in Firestore");
              }
            } catch (err) {
              console.error("Error fetching onboarding status:", err);
            }
          }
        } else {
          console.log("No Firebase user found");
        }
        
        clearTimeout(timeoutId);
        setLocalLoading(false);
      });
      
      return () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
    };
    
    checkAuth();
  }, [isOnline]);

  // Show toast when network status changes
  useEffect(() => {
    if (!isOnline) {
      toast({
        title: "You are offline",
        description: "Limited functionality available. Some features require internet connection.",
        variant: "destructive"
      });
    }
  }, [isOnline, toast]);

  const handleRetry = () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    // Simulate checking connection
    setTimeout(() => {
      setIsRetrying(false);
      // Force reload if we're online but still having issues
      if (navigator.onLine) {
        window.location.reload();
      }
    }, 2000);
  };

  console.log("ProtectedRoute rendering with:", { 
    currentUser: currentUser ? {
      id: currentUser.id,
      onboardingCompleted: currentUser.onboardingCompleted
    } : null, 
    loading,
    localLoading,
    authChecked,
    onboardingCompleted,
    isOnline,
    path: location.pathname,
    isDashboard: location.pathname === '/dashboard'
  });

  // Show loading spinner during initial authentication or onboarding check
  if ((loading && !authChecked) || localLoading) {
    return <div className="flex h-screen w-full items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-healing-300 border-t-healing-600"></div>
    </div>;
  }
  
  // Check if Firebase auth has a user but our context doesn't yet
  if (!currentUser && auth.currentUser && authChecked) {
    console.log("Firebase has user but context doesn't yet, showing loading");
    // Don't show loading indefinitely - if after auth check there's still an issue,
    // redirect to login page after a brief delay
    setTimeout(() => {
      if (!currentUser && window.location.pathname !== '/login') {
        console.log("Still no user context after timeout, redirecting to login");
        window.location.href = '/login';
      }
    }, 3000);
    
    return <div className="flex h-screen w-full items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-healing-300 border-t-healing-600"></div>
    </div>;
  }

  // Offline error screen
  if (!isOnline && location.pathname !== '/onboarding') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <CloudOff className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-800">You're offline</h1>
        <p className="mb-6 max-w-md text-center text-gray-600">
          Unable to connect to our servers. Please check your internet connection and try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleRetry}
            className="rounded-md bg-healing-600 px-4 py-2 text-white hover:bg-healing-700 flex items-center gap-2"
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Checking connection...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Retry connection</span>
              </>
            )}
          </Button>
          
          {location.pathname !== '/onboarding' && currentUser && (
            <Button
              onClick={() => window.location.href = '/onboarding'}
              variant="outline"
              className="rounded-md px-4 py-2"
            >
              Continue to onboarding
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Special handling for onboarding page when offline
  if (!isOnline && location.pathname === '/onboarding') {
    // Allow users to continue to onboarding even when offline
    console.log("User is offline but trying to access onboarding, allowing access");
    // We'll show offline warning in the onboarding component, but allow access
  }

  // If we're on the welcome page, login page, or register page, or crisis resources page just render it
  if (["/", "/login", "/register", "/crisis-resources"].includes(location.pathname)) {
    console.log("On public page, allowing access");
    return <>{children}</>;
  }

  // Only redirect to login if we've confirmed there's no Firebase user and no context user
  if (!currentUser && !auth.currentUser && authChecked) {
    console.log("No user found in both Firebase and context, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For the dashboard specifically, don't redirect to onboarding on refresh if we're still checking
  if (location.pathname === '/dashboard' && auth.currentUser && onboardingCompleted === null) {
    console.log("On dashboard with authenticated user, allowing access while checking onboarding status");
    return <>{children}</>;
  }

  // Special case for onboarding page - don't redirect back to onboarding if we're already there
  if (location.pathname === '/onboarding') {
    console.log("Already on onboarding page, rendering it");
    return <>{children}</>;
  }
  
  // Check if the user has explicitly exited onboarding using the back button
  const hasExitedOnboarding = localStorage.getItem('onboarding_exited') === 'true';
  
  // If user has explicitly exited onboarding and is trying to go to the welcome page,
  // allow them to do so without redirecting back to onboarding
  if (hasExitedOnboarding && location.pathname === '/') {
    console.log("User explicitly exited onboarding to welcome page, allowing access");
    // Clear the flag after it's used
    localStorage.removeItem('onboarding_exited');
    return <>{children}</>;
  }

  // Check if user has completed onboarding
  // First use direct onboardingCompleted state if we have it
  // Fall back to currentUser.onboardingCompleted if available
  const hasCompletedOnboarding = onboardingCompleted !== null 
    ? onboardingCompleted 
    : currentUser?.onboardingCompleted;
  
  console.log("Checking onboarding completion:", {
    onboardingCompletedState: onboardingCompleted,
    currentUserOnboardingCompleted: currentUser?.onboardingCompleted,
    finalDecision: hasCompletedOnboarding
  });
  
  // Special handling for accessing ANY app features: always allow authenticated users to access them
  // This ensures users can access all parts of the application if they're logged in
  if (currentUser) {
    console.log("Allowing authenticated user to access all app features without checking onboarding status");
    return <>{children}</>;
  }
  
  // Only redirect to onboarding if we KNOW the user hasn't completed it
  // and we're not already on the onboarding page
  if (hasCompletedOnboarding === false && location.pathname !== "/onboarding") {
    console.log("User has not completed onboarding, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  console.log("User authenticated, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
