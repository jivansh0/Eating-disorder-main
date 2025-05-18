import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import AIChatPage from "./pages/AIChatPage";
import MoodTrackerPage from "./pages/MoodTrackerPage";
import EducationalHub from "./pages/EducationalHub";
import CrisisResourcesPage from "./pages/CrisisResourcesPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

// Educational Hub Subpages
import UnderstandingED from "./pages/EducationalHub/UnderstandingED";
import NutritionBasics from "./pages/EducationalHub/NutritionBasics";
import CopingStrategies from "./pages/EducationalHub/CopingStrategies";
import BodyImage from "./pages/EducationalHub/BodyImage";

// Intelligent home route component
const HomeRoute = () => {
  const { currentUser, loading } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // On first render, check if we're coming from a persisted session
  useEffect(() => {
    // Add a short delay to ensure auth state is properly loaded
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // If still in initial loading state, show loading spinner
  if (loading || isInitialLoad) {
    return <div className="flex h-screen w-full items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-healing-300 border-t-healing-600"></div>
    </div>;
  }
  
  // If user is logged in
  if (currentUser) {
    // Check if they've completed onboarding
    if (currentUser.onboardingCompleted) {
      // Redirect to dashboard if onboarding is complete
      return <Navigate to="/dashboard" replace />;
    } else {
      // Redirect to onboarding if not complete
      return <Navigate to="/onboarding" replace />;
    }
  }
  
  // If no user is logged in, show the welcome page
  return <WelcomePage />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <AIChatPage />
              </ProtectedRoute>
            } />
            <Route path="/mood" element={
              <ProtectedRoute>
                <MoodTrackerPage />
              </ProtectedRoute>
            } />
            <Route 
              path="/learn" 
              element={
                <ProtectedRoute>
                  <EducationalHub />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="understanding" replace />} /> 
              <Route path="understanding" element={<UnderstandingED />} />
              <Route path="nutrition" element={<NutritionBasics />} />
              <Route path="coping" element={<CopingStrategies />} />
              <Route path="body-image" element={<BodyImage />} />
            </Route>
            <Route path="/crisis-resources" element={<CrisisResourcesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
