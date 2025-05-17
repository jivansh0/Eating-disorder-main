
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { Heart, Shield, Brain } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const WelcomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Trigger initial animation
    setLoaded(true);

    // Redirect to dashboard if user is already logged in
    if (currentUser) {
      if (!currentUser.onboardingCompleted) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    }
  }, [currentUser, navigate]);

  return (
    <div className="app-container">
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className={`mb-8 text-healing-800 transition-all duration-1000 transform ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 animate-pulse-gentle rounded-full bg-healing-300 blur-md"></div>
              <Heart className="relative h-16 w-16 sm:h-20 sm:w-20 text-healing-600" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="mb-2 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-healing-900">
            Recovery Journey
          </h1>
          <p className="text-lg sm:text-xl text-healing-700">Your AI companion for healing and growth</p>
        </div>

        <ScrollReveal className="mb-12 w-full max-w-2xl">
          <div className="rounded-xl bg-white p-6 shadow-lg md:p-8">
            <p className="mb-6 text-base sm:text-lg text-gray-700">
              Welcome to a supportive space designed to help you navigate your recovery from eating
              disorders. Empathetic, private, and always available when you need support.
            </p>

            <div className="mb-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
              {[
                {
                  icon: Shield,
                  title: "Safe & Private",
                  description: "Your data is secure and your journey is confidential"
                },
                {
                  icon: Brain,
                  title: "AI Support",
                  description: "Personalized guidance based on clinical expertise" 
                },
                {
                  icon: Heart,
                  title: "Recovery Focused",
                  description: "Evidence-based tools for your healing journey"
                }
              ].map((feature, index) => (
                <div 
                  key={feature.title}
                  className="rounded-lg bg-healing-50 p-4 text-center transform transition-all duration-500"
                  style={{ '--index': index } as React.CSSProperties}
                >
                  <div className="mb-3 flex justify-center">
                    <feature.icon className="h-8 w-8 text-healing-600" />
                  </div>
                  <h3 className="mb-1 font-medium text-healing-800">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Button className="bg-healing-600 hover:bg-healing-700 transition-all duration-300 transform hover:scale-105" asChild size="lg">
                <Link to="/register">Get Started</Link>
              </Button>
              <Button variant="outline" className="border-healing-300 text-healing-800 transition-all duration-300 transform hover:scale-105" asChild size="lg">
                <Link to="/login">Log In</Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-8 text-center text-sm text-gray-500" delay={200}>
          <p className="mb-2">
            <strong>Important:</strong> This application is designed as a supportive tool and is not a
            replacement for professional medical or therapeutic treatment.
          </p>
          <Link to="/crisis-resources" className="text-healing-600 hover:underline flex items-center justify-center">
            Access Crisis Resources 
            <svg className="ml-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default WelcomePage;
