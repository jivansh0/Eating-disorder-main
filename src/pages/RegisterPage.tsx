import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserPlus, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [animateForm, setAnimateForm] = useState(false);
  
  const { register, loginWithGoogle, error, currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => {
      setAnimateForm(true);
    }, 100);
    
    // If user is already logged in, redirect appropriately
    if (currentUser) {
      // For existing users, direct them to the dashboard
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const validatePassword = () => {
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      await register(email, password, name);
      toast({
        title: "Account created",
        description: "Your account has been successfully created",
      });
      
      console.log("Registration successful, redirecting to onboarding...");
      
      // For new registrations, always redirect to onboarding
      navigate("/onboarding", { replace: true });
    } catch (err: any) {
      console.error("Registration error:", err);
      
      // Display more specific error messages based on Firebase error codes
      let errorMessage = "Failed to create account. Please try again.";
      
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use. Please try another email or log in.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address. Please check and try again.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (err.code === "auth/configuration-not-found") {
        errorMessage = "Authentication service is unavailable. Please try again later.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsSubmitting(true);
      const user = await loginWithGoogle();
      
      toast({
        title: "Account created",
        description: "Your account has been successfully created with Google",
      });
      
      console.log("Google signup successful, redirecting to onboarding...");
      
      // For new Google sign-ups, always redirect to onboarding
      // We consider this a new registration since they're coming through the registration page
      navigate("/onboarding", { replace: true });
      
    } catch (err: any) {
      console.error("Google signup error in component:", err);
      
      // Get a user-friendly error message
      const errorMessage = err.message || "Failed to sign up with Google. Please try again.";
      
      toast({
        title: "Sign Up Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container flex min-h-screen flex-col items-center justify-center p-4">
      <Link to="/" className="absolute left-4 top-4 flex items-center text-healing-700 hover:text-healing-900">
        <ArrowLeft className="mr-1 h-4 w-4" />
        <span>Back</span>
      </Link>

      <div className={`w-full max-w-md transition-all duration-500 transform ${animateForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <Card className="border-healing-100 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl text-healing-800">Create an Account</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600 flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>An unexpected error occurred. Please try again later.</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-focus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-focus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-focus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="input-focus"
                />
                {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
              </div>
              <div className="text-xs text-gray-600">
                <p>By creating an account, you agree to our <Link to="#" className="text-healing-600 hover:underline">Terms of Service</Link> and <Link to="#" className="text-healing-600 hover:underline">Privacy Policy</Link>.</p>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-healing-600 hover:bg-healing-700 transition-all duration-300 transform hover:scale-105" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Sign Up</span>
                  </div>
                )}
              </Button>
              
              <div className="relative flex items-center py-2">
                <Separator className="flex-1" />
                <span className="mx-2 text-xs text-gray-500">OR</span>
                <Separator className="flex-1" />
              </div>
              
              <Button 
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center border-gray-300 hover:bg-gray-50"
                onClick={handleGoogleSignup}
                disabled={isSubmitting}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Sign up with Google
              </Button>
              
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-healing-600 hover:text-healing-800">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
