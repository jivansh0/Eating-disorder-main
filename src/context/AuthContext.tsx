import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebaseConfig";

// Helper function to check if running in Vercel environment
const isVercelDeployment = (): boolean => {
  return window.location.hostname.includes('vercel.app');
};

// Use a simpler approach to network status
const getNetworkStatus = () => navigator.onLine;
const onNetworkStatusChange = (callback: (isOnline: boolean) => void) => {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
  return () => {
    window.removeEventListener('online', () => callback(true));
    window.removeEventListener('offline', () => callback(false));
  };
};
import { syncLocalEntriesWithFirebase } from "../services/moodService";
import { User as AppUser } from "@/types/types";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: AppUser | null;
  loading: boolean;
  error: Error | null;
  isOnline: boolean;
  login: (email: string, password: string) => Promise<AppUser | null>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<AppUser | null>;
  logout: () => void;
  updateUserProfile: (data: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Helper function to convert Firebase user to our User type
const formatUser = async (firebaseUser: FirebaseUser): Promise<AppUser> => {
  try {
    // Check if we're online before trying to fetch from Firestore
    if (!getNetworkStatus()) {
      // If offline, check localStorage for onboarding status first
      const onboardingCompleted = localStorage.getItem('userOnboardingComplete') === 'true';
      
      // If offline, return basic user info from Firebase Auth
      console.log("Offline: Using basic user info from Firebase Auth with onboarding status:", onboardingCompleted);
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || "",
        onboardingCompleted: onboardingCompleted, // Use cached value instead of default false
        registrationDate: new Date(),
        lastActivity: new Date().toISOString(),
        moodEntries: 0,
        progressMetrics: {
          completedGoals: 0,
          totalGoals: 0,
          streakDays: 0,
          lastActiveDate: new Date().toISOString()
        }
      };
    }
    
    // If online, try to get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("User data from Firestore:", userData);
      
      // Store onboarding status in localStorage for offline use
      if (userData.onboardingCompleted) {
        localStorage.setItem('userOnboardingComplete', 'true');
      }
      
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || userData.name,
        disorder: userData.disorder,
        goals: userData.goals || [],
        onboardingCompleted: userData.onboardingCompleted === true, // Ensure boolean type
        registrationDate: userData.createdAt ? new Date(userData.createdAt) : new Date(),
        lastActivity: userData.lastActivity || new Date().toISOString(),
        moodEntries: userData.moodEntries || 0,
        progressMetrics: userData.progressMetrics || {
          completedGoals: 0,
          totalGoals: 0,
          streakDays: 0,
          lastActiveDate: new Date().toISOString()
        }
      };
    }
    
    // First time user or document doesn't exist yet
    console.log("No user document exists yet, returning basic user with onboarding needed");
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: firebaseUser.displayName || "",
      onboardingCompleted: false,
      registrationDate: new Date(),
      lastActivity: new Date().toISOString(),
      moodEntries: 0,
      progressMetrics: {
        completedGoals: 0,
        totalGoals: 0,
        streakDays: 0,
        lastActiveDate: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("Error formatting user:", error);
    // Return a basic user object if there's an error
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: firebaseUser.displayName || "",
      onboardingCompleted: false,
      registrationDate: new Date(),
      lastActivity: new Date().toISOString(),
      moodEntries: 0,
      progressMetrics: {
        completedGoals: 0,
        totalGoals: 0,
        streakDays: 0,
        lastActiveDate: new Date().toISOString()
      }
    };
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOnline, setIsOnline] = useState(getNetworkStatus());
  const [authInitialized, setAuthInitialized] = useState(false);
  const { toast } = useToast();

  // Subscribe to network status changes
  useEffect(() => {
    const unsubscribe = onNetworkStatusChange((online) => {
      setIsOnline(online);
      if (online) {
        toast({
          title: "You're back online",
          description: "Connected to our servers"
        });
      } else {
        toast({
          title: "You're offline",
          description: "Some features may be limited",
          variant: "destructive"
        });
      }
    });
    
    return unsubscribe;
  }, [toast]);

  useEffect(() => {
    console.log("Setting up auth state listener");
    let authStateTimeout: NodeJS.Timeout;
    let initialAuthCheck = true;
    
    // Check for Vercel environment which might need special handling
    const isVercel = isVercelDeployment();
    if (isVercel) {
      console.log("Auth provider detected Vercel environment:", window.location.hostname);
      localStorage.setItem('authProviderVercelDetection', 'true');
      localStorage.setItem('authProviderVercelDomain', window.location.hostname);
      
      // For Vercel, ensure we set proper persistence to handle auth properly
      try {
        setPersistence(auth, browserLocalPersistence)
          .then(() => {
            console.log("Firebase persistence set for Vercel deployment");
            localStorage.setItem('vercel_auth_persistence_set', 'true');
          })
          .catch(error => {
            console.error("Error setting persistence for Vercel:", error);
            localStorage.setItem('vercel_auth_persistence_error', String(error instanceof Error ? error.message : error));
          });
      } catch (persistError) {
        console.error("Failed to set persistence directly:", persistError);
      }
    }
    
    // First, check if we already have a user in localStorage to prevent flickering
    const cachedAuthUser = localStorage.getItem('authUser');
    if (cachedAuthUser) {
      try {
        const userData = JSON.parse(cachedAuthUser);
        console.log("Using cached auth user data for immediate UI:", userData.id);
        if (userData && userData.id) {
          setCurrentUser(userData);
        }
      } catch (e) {
        console.error("Error parsing cached auth user:", e);
      }
    }
    
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      
      // Set a shorter timeout to prevent long loading states
      clearTimeout(authStateTimeout);
      authStateTimeout = setTimeout(() => {
        console.log("Auth state listener timed out, forcing loading to false");
        setLoading(false);
        setAuthInitialized(true); // Mark auth as initialized even if it timed out
      }, 5000); // 5 second safety timeout
      
      try {
        if (firebaseUser) {
          console.log("User is signed in:", firebaseUser.uid);
          setAuthInitialized(true); // User signed in, auth is initialized
          
          // On initial page load or refresh, check localStorage first for faster response
          let formattedUser: AppUser | null = null;
          const cachedUser = localStorage.getItem(`user_${firebaseUser.uid}`);
          
          if (cachedUser && (initialAuthCheck || !isOnline)) {
            try {
              // Use cached user data for immediate UI response
              formattedUser = JSON.parse(cachedUser) as AppUser;
              console.log("Using cached user data for immediate UI:", formattedUser);
              
              // IMPORTANT FIX: Check if the cached onboardingCompleted is explicitly set
              // This prevents redirecting to onboarding every time due to implicit false values
              const hasExplicitOnboardingValue = 
                cachedUser.includes('"onboardingCompleted":true') || 
                cachedUser.includes('"onboardingCompleted":false');
                
              if (hasExplicitOnboardingValue) {
                setCurrentUser(formattedUser);
              } else {
                // If no explicit value, we need to fetch it from Firestore
                console.log("No explicit onboarding status in cached user, will fetch from Firestore");
              }
              
              // If this is initial auth check, still fetch fresh data in background
              if (!isOnline) {
                clearTimeout(authStateTimeout);
                setLoading(false);
                return;
              }
            } catch (e) {
              console.error("Error parsing cached user:", e);
            }
          }
          
          // Always get fresh user data from Firestore when online
          if (isOnline) {
            formattedUser = await formatUser(firebaseUser);
            console.log("Got fresh user data from Firestore:", formattedUser);
            
            // IMPORTANT: Log the onboarding status explicitly to help with debugging
            console.log(`User onboarding status from Firestore: ${formattedUser.onboardingCompleted}`);
            
            setCurrentUser(formattedUser);
            
            // Cache the fresh user data for future use
            localStorage.setItem(`user_${firebaseUser.uid}`, JSON.stringify(formattedUser));
            localStorage.setItem('authUser', JSON.stringify(formattedUser));
            
            // Also save onboarding status separately for easier access
            localStorage.setItem('userOnboardingComplete', formattedUser.onboardingCompleted ? 'true' : 'false');
            localStorage.setItem(`onboarding_${firebaseUser.uid}`, formattedUser.onboardingCompleted ? 'true' : 'false');
            
            // Remove automatic redirects from auth listener to prevent unexpected redirects
            // Let the router handle redirects instead based on current path and user state
          }
        } else {
          console.log("User is signed out");
          setCurrentUser(null);
          setAuthInitialized(true); // User signed out, auth is initialized
          
          // Clear cached user data on sign out
          const keysToRemove = [];
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.startsWith('user_') || key.startsWith('onboarding_') || key === 'userOnboardingComplete')) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));        } catch (err) {
          console.error("Error clearing local storage:", err instanceof Error ? err.message : err);
        }
      }
    } catch (err) {
        console.error("Auth state change error:", err);
        setCurrentUser(null);
        setError(err);
        setAuthInitialized(true); // Error occurred, but auth is still initialized
      } finally {
        clearTimeout(authStateTimeout);
        setLoading(false);
        initialAuthCheck = false;
      }
    });

    // Cleanup subscription and timeout
    return () => {
      unsubscribe();
      clearTimeout(authStateTimeout);
    };
  }, [isOnline]);

  // Add a token refresh mechanism to keep the session alive
  useEffect(() => {
    if (!currentUser) return;
    
    console.log("Setting up token refresh interval");
    
    // Refresh token every 50 minutes (Firebase tokens typically expire after 1 hour)
    const refreshInterval = setInterval(async () => {
      try {
        if (auth.currentUser) {
          // Force token refresh
          await auth.currentUser.getIdToken(true);
          console.log("Auth token refreshed successfully");
        }
      } catch (err) {
        console.error("Failed to refresh authentication token:", err);
      }
    }, 50 * 60 * 1000); // 50 minutes
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [currentUser]);

  // Firebase login
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!isOnline) {
        throw new Error("You're offline. Please check your internet connection and try again.");
      }
      
      console.log("Attempting login for:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Optimize login by doing minimal operations needed
      // Set a basic user immediately to reduce perceived loading time
      const basicUser = {
        id: userCredential.user.uid,
        email: userCredential.user.email || "",
        name: userCredential.user.displayName || "",
        onboardingCompleted: false,
        registrationDate: new Date(),
        lastActivity: new Date().toISOString(),
        moodEntries: 0,
        progressMetrics: {
          completedGoals: 0,
          totalGoals: 0,
          streakDays: 0,
          lastActiveDate: new Date().toISOString()
        }
      };
      
      // Show something immediately to the user
      setCurrentUser(basicUser);
      
      // Store auth user for session restoration
      localStorage.setItem('authUser', JSON.stringify(basicUser));
      
      // Now get complete data in the background
      const formattedUser = await formatUser(userCredential.user);
      
      // Cache user data for fast loading on page refresh
      localStorage.setItem(`user_${userCredential.user.uid}`, JSON.stringify(formattedUser));
      localStorage.setItem('authUser', JSON.stringify(formattedUser));
      
      // Set both loading states explicitly to false
      setLoading(false);
      setCurrentUser(formattedUser);
      
      console.log("Login successful for:", email);
      return formattedUser;
    } catch (err: Error | unknown) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Firebase register
  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!isOnline) {
        throw new Error("You're offline. Please check your internet connection and try again.");
      }
      
      console.log("Attempting to create user:", email);
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("User created, updating profile for:", user.uid);
      // Update the user's display name
      await updateProfile(user, { displayName: name });
      
      console.log("Creating Firestore document for user:", user.uid);
      // Create a user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email,
        name,
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        moodEntries: 0,
        progressMetrics: {
          completedGoals: 0,
          totalGoals: 0,
          streakDays: 0,
          lastActiveDate: new Date().toISOString()
        }
      });
      
      const formattedUser = await formatUser(user);
      setCurrentUser(formattedUser);
      console.log("Registration successful for:", email);
      
      // Set loading to false before redirect to prevent infinite loading
      setLoading(false);
      
      // New users always need to complete onboarding
      window.location.href = "/onboarding";
      return;
    } catch (err: Error | unknown) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Google authentication
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!isOnline) {
        throw new Error("You're offline. Please check your internet connection and try again.");
      }
      
      console.log("Attempting Google login");
      
      // Use try-catch specifically for the popup operation
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Check if this is a new user (first time sign-in)
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
          // Create a new user document in Firestore for Google sign-in
          console.log("Creating Firestore document for new Google user:", user.uid);
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            name: user.displayName,
            onboardingCompleted: false,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            moodEntries: 0,
            progressMetrics: {
              completedGoals: 0,
              totalGoals: 0,
              streakDays: 0,
              lastActiveDate: new Date().toISOString()
            }
          });
        }
        
        // Get complete user data
        const formattedUser = await formatUser(user);
        
        // Cache user data for fast loading on page refresh
        localStorage.setItem(`user_${user.uid}`, JSON.stringify(formattedUser));
        
        // Set current user state
        setCurrentUser(formattedUser);
        console.log("Google login successful for:", user.email);
        
        setLoading(false);
        return formattedUser;
      } catch (popupError: unknown) {
        // Handle popup-specific errors
        console.error("Google popup error:", popupError);
        
        // Firebase errors often have a 'code' property but TypeScript doesn't know this
        // So we need to check and cast appropriately
        interface FirebaseAuthError extends Error {
          code?: string;
        }
        
        const authError = popupError as FirebaseAuthError;
        
        if (authError.code === "auth/popup-closed-by-user") {
          throw new Error("Login popup was closed. Please try again.");
        } else if (authError.code === "auth/popup-blocked") {
          throw new Error("Login popup was blocked by your browser. Please enable popups and try again.");
        } else if (authError.code === "auth/operation-not-allowed") {
          throw new Error("Google sign-in is not enabled for this app. Please contact the administrator.");
        } else if (authError.code === "auth/cancelled-popup-request") {
          throw new Error("Multiple popups detected. Please try again.");
        } else if (authError.code === "auth/account-exists-with-different-credential") {
          throw new Error("An account already exists with the same email but different sign-in credentials.");
        } else {
          throw popupError instanceof Error ? popupError : new Error(String(popupError)); // Re-throw other errors
        }
      }
    } catch (err: unknown) {
      console.error("Google login error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to login with Google";
      const errorObject = err instanceof Error ? err : new Error(errorMessage);
      setError(errorObject);
      throw errorObject;
    } finally {
      setLoading(false);
    }
  };

  // Firebase logout
  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      setCurrentUser(null);
      console.log("User signed out successfully");
    } catch (err: unknown) {
      console.error("Logout error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // Update user profile in both Firebase Auth and Firestore
  const updateUserProfile = async (data: Partial<AppUser>) => {
    if (!currentUser) {
      console.error("Cannot update profile: No current user");
      throw new Error("No authenticated user found");
    }
    
    setError(null);
    
    // Store the update locally regardless of online status
    setCurrentUser(prev => {
      if (!prev) return null;
      return { ...prev, ...data };
    });
    
    // If offline, store the update to be applied later
    if (!isOnline) {
      console.log("Offline: Storing profile update for later sync", data);
      
      try {
        // Save to localStorage for later sync
        const pendingUpdates = JSON.parse(localStorage.getItem('pendingProfileUpdates') || '[]');
        pendingUpdates.push({
          userId: currentUser.id,
          data,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('pendingProfileUpdates', JSON.stringify(pendingUpdates));
        
        // Also store critical onboarding data separately
        if (data.onboardingCompleted) {
          localStorage.setItem('userOnboardingComplete', 'true');
        }
        if (data.disorder) {
          localStorage.setItem('userDisorder', data.disorder);
        }
        if (data.goals) {
          localStorage.setItem('userGoals', JSON.stringify(data.goals));
        }
        
        return;
      } catch (err) {
        console.error("Error storing offline profile update:", err);
        // Continue with the function, it might still work online
      }
    }
    
    try {
      console.log("Updating user profile with data:", data);
      
      // Update display name in Firebase Auth if provided
      if (data.name && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.name });
      }
      
      // Update Firestore document
      const userRef = doc(db, "users", currentUser.id);
      
      // Check if document exists first
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        console.log("Document exists, updating with:", data);
        await updateDoc(userRef, { ...data });
        console.log("User document updated successfully");
      } else {
        // Create the document if it doesn't exist
        console.log("Document doesn't exist, creating new document with:", {
          email: currentUser.email,
          name: currentUser.name,
          ...data
        });
        
        await setDoc(userRef, {
          email: currentUser.email,
          name: currentUser.name,
          ...data,
          createdAt: currentUser.registrationDate?.toISOString() || new Date().toISOString(),
          lastActivity: new Date().toISOString()
        });
        console.log("User document created successfully");
      }
      
      console.log("User state updated successfully");
    } catch (err: unknown) {
      console.error("Error updating user profile:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      // Don't throw here - we've already updated the local state
      // Just notify the user with toast
      toast({
        title: "Offline mode",
        description: "Your changes are saved locally and will sync when you're back online.",
        variant: "default"
      });
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    isOnline,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
