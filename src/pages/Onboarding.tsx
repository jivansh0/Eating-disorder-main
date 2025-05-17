import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { AlertTriangle, WifiOff, RefreshCw, ArrowLeft } from 'lucide-react';
import OnboardingWelcome from '@/components/OnboardingWelcome';
import OnboardingSteps from '@/components/OnboardingSteps';
import OnboardingDisorderSelect from '@/components/OnboardingDisorderSelect';
import OnboardingGoals from '@/components/OnboardingGoals';
import OnboardingAcknowledge from '@/components/OnboardingAcknowledge';
import ScrollReveal from '@/components/ScrollReveal';
import { useToast } from '@/hooks/use-toast';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animateOut, setAnimateOut] = useState(false);
  const navigate = useNavigate();
  const { updateUserProfile, currentUser, isOnline, logout } = useAuth();
  const { toast } = useToast();
  // Add ref for tracking initial load state
  const hasInitiallyLoaded = useRef<boolean>(false);

  // Add state variables for the onboarding process
  const [selectedDisorder, setSelectedDisorder] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Handle retry
  const handleRetryConnection = () => {
    setIsRetrying(true);
    setError(null);
    
    // Simulate checking connection
    setTimeout(() => {
      setIsRetrying(false);
      // Force reload if we're online now
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setError("Still offline. You can continue with limited functionality.");
      }
    }, 2000);
  };

  // Check if user has already completed onboarding
  useEffect(() => {
    console.log("Onboarding component mounted, currentUser:", currentUser);
    
    // If no user is present after a reasonable time, they're likely not logged in
    const authCheckTimeout = setTimeout(() => {
      if (!currentUser) {
        console.log("No user found after timeout, redirecting to login");
        navigate('/login');
      }
    }, 5000); // 5 second timeout for authentication check
    
    // If we have user data
    if (currentUser) {
      // Clear the timeout since we have a user
      clearTimeout(authCheckTimeout);
      console.log("User found, onboardingCompleted:", currentUser.onboardingCompleted);
      
      // Mark that we've loaded the user data
      hasInitiallyLoaded.current = true;
      
      // If user has already completed onboarding, redirect to dashboard
      if (currentUser.onboardingCompleted === true) {
        console.log("User already completed onboarding, redirecting to dashboard");
        navigate('/dashboard', { replace: true });
      }
    }
    
    return () => {
      clearTimeout(authCheckTimeout);
    };
  }, [currentUser, navigate]);

  // Handle transition between steps with animation
  const handleStepChange = (nextStep: number) => {
    setAnimateOut(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setAnimateOut(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  };

  const handleCompleteOnboarding = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      console.log("Attempting to complete onboarding with data:", {
        disorder: selectedDisorder,
        goals,
        onboardingCompleted: true,
        userId: currentUser.id,
        isOnline
      });
      
      // Save the onboarding information
      await updateUserProfile({ 
        disorder: selectedDisorder,
        goals: goals,
        onboardingCompleted: true
      });
      
      // Store onboarding data in localStorage as backup
      localStorage.setItem('userOnboardingComplete', 'true');
      localStorage.setItem('userDisorder', selectedDisorder || '');
      localStorage.setItem('userGoals', JSON.stringify(goals));
      
      toast({
        title: isOnline ? "Onboarding complete!" : "Onboarding saved locally",
        description: isOnline 
          ? "Your profile has been updated successfully" 
          : "Your preferences will sync when you're back online"
      });
      
      console.log("Onboarding completed successfully, navigating to dashboard");
      
      // Don't use setTimeout for navigation as it can cause timing issues
      // Use direct navigation instead
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error("Failed to complete onboarding:", error);
      
      let errorMessage = "An error occurred. ";
      
      if (!isOnline) {
        errorMessage = "You're offline. Your preferences will be saved locally and synced when you're back online.";
      } else if (error.message.includes("offline") || error.message.includes("network")) {
        errorMessage = "Failed to connect to our servers. Please check your internet connection.";
      } else {
        errorMessage += error.message || "Please try again.";
      }
      
      setError(errorMessage);
      
      toast({
        title: "Warning",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    handleStepChange(currentStep + 1);
  };

  const handleBack = () => {
    handleStepChange(currentStep - 1);
  };

  const toggleGoal = (goalId: string) => {
    setGoals(prev => 
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  // Determine if the next button should be disabled
  const isNextDisabled = () => {
    if (currentStep === 1 && !selectedDisorder) return true;
    if (currentStep === 2 && goals.length === 0) return true;
    if (currentStep === 3 && !acknowledged) return true;
    return false;
  };

  const handleNavigateBack = () => {
    // If we're logged in, we need a more complete solution
    if (currentUser) {
      // Show loading toast
      toast({
        title: "Going back...",
        description: "You'll be redirected to the welcome page."
      });
      
      // Set the exit flag that we'll check in ProtectedRoute
      localStorage.setItem('onboarding_exited', 'true');
      
      // Use the Auth context's logout function if it exists
      if (typeof logout === 'function') {
        logout().then(() => {
          // After logout, navigate to the welcome page
          navigate('/', { replace: true });
        }).catch(error => {
          console.error("Error during logout:", error);
          // If logout fails, still navigate 
          navigate('/', { replace: true });
        });
      } else {
        // If logout function isn't available (shouldn't happen), just navigate
        navigate('/', { replace: true });
      }
    } else {
      // If not logged in, just navigate to the welcome page
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-healing-100 to-healing-200">
      <div className="container mx-auto px-4 py-8">
        {/* Back button at the top left */}
        <Button 
          variant="ghost" 
          onClick={handleNavigateBack} 
          className="absolute left-4 top-4 flex items-center text-healing-700 hover:text-healing-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          <span>Back</span>
        </Button>
      
        {!isOnline && (
          <div className="mb-6 rounded-lg bg-amber-50 p-4 text-amber-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <WifiOff className="mr-3 h-5 w-5 text-amber-600" />
                <p className="font-medium">You are currently offline</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetryConnection}
                disabled={isRetrying}
                className="text-amber-800 border-amber-300 hover:bg-amber-100"
              >
                {isRetrying ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Retry"
                )}
              </Button>
            </div>
            <p className="mt-1 text-sm">
              You can complete onboarding offline. Your preferences will be saved locally and synced when you're back online.
            </p>
          </div>
        )}
        
        {currentStep === 0 ? (
          <div className={`transition-opacity duration-300 ${animateOut ? 'opacity-0' : 'opacity-100'}`}>
            <OnboardingWelcome onContinue={handleContinue} />
          </div>
        ) : (
          <div className={`transition-all duration-300 ${animateOut ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
            <ScrollReveal>
              <OnboardingSteps currentStep={currentStep} totalSteps={3} />
            </ScrollReveal>

            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
              {currentStep === 1 && (
                <OnboardingDisorderSelect 
                  selectedDisorder={selectedDisorder} 
                  onSelectDisorder={setSelectedDisorder} 
                />
              )}

              {currentStep === 2 && (
                <OnboardingGoals 
                  selectedGoals={goals} 
                  onToggleGoal={toggleGoal} 
                />
              )}

              {currentStep === 3 && (
                <OnboardingAcknowledge 
                  acknowledged={acknowledged} 
                  onAcknowledge={setAcknowledged} 
                />
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              <ScrollReveal delay={400}>
                <div className="flex flex-col sm:flex-row justify-between mt-8 space-y-4 sm:space-y-0 sm:space-x-4">
                  {currentStep > 1 && (
                    <Button 
                      variant="outline" 
                      onClick={handleBack}
                      className="order-2 sm:order-1"
                    >
                      Back
                    </Button>
                  )}
                  
                  <div className="flex-1 order-1 sm:order-2">
                    {isNextDisabled() && currentStep > 0 && (
                      <div className="flex items-center justify-center sm:justify-end text-amber-600 mb-4 text-sm">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        <span>Please complete this step before continuing</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={currentStep === 3 ? handleCompleteOnboarding : handleContinue}
                    disabled={isNextDisabled() || isSubmitting}
                    className="bg-healing-600 hover:bg-healing-700 transition-all duration-300 order-3 sm:order-3"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>Processing...</span>
                      </div>
                    ) : currentStep === 3 ? 'Complete & Continue' : 'Continue'}
                  </Button>
                </div>
              </ScrollReveal>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
