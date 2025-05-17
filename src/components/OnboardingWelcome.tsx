
import React from 'react';
import { Heart } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { Button } from '@/components/ui/button';

interface OnboardingWelcomeProps {
  onContinue: () => void;
}

const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onContinue }) => {
  return (
    <div className="welcome-container">
      <ScrollReveal>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="logo-pulse">
              <Heart className="relative h-12 w-12 sm:h-16 sm:w-16 text-healing-600" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="welcome-heading">Welcome to Recovery Journey</h1>
          <p className="welcome-subheading">Let's personalize your experience to better support your recovery</p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <div className="welcome-card">
          <div className="space-y-4">
            <p className="text-gray-700">
              We're here to support you every step of the way. The next few screens will help us understand your needs 
              and create a personalized experience just for you.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              {[
                {
                  title: "Private & Secure",
                  description: "Your information remains confidential and protected"
                },
                {
                  title: "Personalized Support",
                  description: "Tailored resources based on your specific needs"
                },
                {
                  title: "Always Available",
                  description: "Access help and resources whenever you need them"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="rounded-lg bg-healing-50 p-4 text-center transform transition-all duration-500"
                  style={{ '--index': index } as React.CSSProperties}
                >
                  <h3 className="font-medium text-healing-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              This process takes less than 5 minutes. Your responses help us provide the most relevant 
              support for your recovery journey.
            </p>

            <div className="flex justify-center">
              <Button 
                onClick={onContinue}
                className="bg-healing-600 hover:bg-healing-700 transition-all duration-300 transform hover:scale-105 px-8 py-2"
                size="lg"
              >
                Let's Begin
              </Button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={400} direction="up">
        <div className="text-center text-xs sm:text-sm text-gray-500 mt-6">
          <p>
            Remember: This application is designed as a supportive tool and is not a
            replacement for professional medical or therapeutic treatment.
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default OnboardingWelcome;
