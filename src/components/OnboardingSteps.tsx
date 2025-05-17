
import React from 'react';
import { Check } from 'lucide-react';

interface StepProps {
  currentStep: number;
  totalSteps: number;
}

const OnboardingSteps: React.FC<StepProps> = ({ currentStep, totalSteps }) => {
  const steps = [
    { number: 1, label: 'Identify' },
    { number: 2, label: 'Set Goals' },
    { number: 3, label: 'Acknowledge' },
  ];

  return (
    <div className="mb-8 md:mb-12">
      <div className="flex justify-between items-center w-full max-w-2xl mx-auto px-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step Circle */}
            <div className="flex flex-col items-center relative">
              <div
                className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-colors duration-300 ${
                  currentStep >= step.number
                    ? 'bg-healing-600 border-healing-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm md:text-base font-medium">{step.number}</span>
                )}
              </div>
              <span 
                className={`text-xs md:text-sm font-medium mt-2 text-center ${
                  currentStep >= step.number ? 'text-healing-700' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line (not for the last item) */}
            {index < steps.length - 1 && (
              <div 
                className={`flex-1 h-1 max-w-20 mx-2 md:mx-4 rounded transition-colors duration-300 ${
                  currentStep > index + 1 ? 'bg-healing-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default OnboardingSteps;
