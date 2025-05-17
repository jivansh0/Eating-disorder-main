
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import ScrollReveal from './ScrollReveal';

interface DisorderOption {
  id: string;
  title: string;
  description: string;
}

interface OnboardingDisorderSelectProps {
  selectedDisorder: string | null;
  onSelectDisorder: (disorderId: string) => void;
}

const OnboardingDisorderSelect: React.FC<OnboardingDisorderSelectProps> = ({
  selectedDisorder,
  onSelectDisorder,
}) => {
  const disorders: DisorderOption[] = [
    {
      id: 'anorexia',
      title: 'Anorexia Nervosa',
      description: 'Characterized by weight loss, difficulties maintaining appropriate weight, and distorted body image.',
    },
    {
      id: 'bulimia',
      title: 'Bulimia Nervosa',
      description: 'Characterized by cycles of bingeing and compensatory behaviors such as self-induced vomiting.',
    },
    {
      id: 'binge',
      title: 'Binge Eating Disorder',
      description: 'Characterized by recurring episodes of eating significantly more food in a short period of time than most people would eat under similar circumstances.',
    },
    {
      id: 'arfid',
      title: 'Avoidant/Restrictive Food Intake Disorder',
      description: 'Characterized by highly selective eating habits, restricted intake, or both.',
    },
    {
      id: 'osfed',
      title: 'Other Specified Feeding or Eating Disorder',
      description: 'Eating disorders that cause significant distress but don\'t meet the full criteria for other disorders.',
    },
    {
      id: 'body-image',
      title: 'Body Image Concerns',
      description: 'Persistent concerns about appearance that cause distress but may not meet full criteria for an eating disorder.',
    },
    {
      id: 'emotional',
      title: 'Emotional Eating',
      description: 'Using food to cope with emotional states rather than physical hunger.',
    },
  ];

  return (
    <div className="space-y-6">
      <ScrollReveal>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-healing-800 mb-2">What are you seeking support with?</h2>
          <p className="text-gray-600">
            Select the option that best represents your primary concern. This helps us personalize your experience.
          </p>
        </div>
      </ScrollReveal>

      <RadioGroup value={selectedDisorder || ''} onValueChange={onSelectDisorder} className="space-y-4">
        {disorders.map((disorder, index) => (
          <ScrollReveal key={disorder.id} delay={index * 100} direction="left">
            <Card className={`border hover:border-healing-400 transition-colors cursor-pointer ${selectedDisorder === disorder.id ? 'border-healing-500 bg-healing-50' : ''}`} onClick={() => onSelectDisorder(disorder.id)}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  <RadioGroupItem value={disorder.id} id={disorder.id} className="mt-1" />
                  <div>
                    <Label htmlFor={disorder.id} className="text-base sm:text-lg font-medium text-healing-800 cursor-pointer">
                      {disorder.title}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{disorder.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </RadioGroup>
    </div>
  );
};

export default OnboardingDisorderSelect;
