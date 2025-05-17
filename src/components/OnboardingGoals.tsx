
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import ScrollReveal from './ScrollReveal';

interface GoalOption {
  id: string;
  title: string;
  description: string;
}

interface OnboardingGoalsProps {
  selectedGoals: string[];
  onToggleGoal: (goalId: string) => void;
}

const OnboardingGoals: React.FC<OnboardingGoalsProps> = ({
  selectedGoals,
  onToggleGoal,
}) => {
  const goals: GoalOption[] = [
    {
      id: 'understand',
      title: 'Understand my condition better',
      description: 'Learn about the underlying mechanisms and patterns of my eating disorder.',
    },
    {
      id: 'coping',
      title: 'Develop better coping mechanisms',
      description: 'Find healthier ways to deal with emotions and stressors.',
    },
    {
      id: 'relationships',
      title: 'Improve relationships with food',
      description: 'Build a healthier and more balanced approach to eating.',
    },
    {
      id: 'body-image',
      title: 'Improve body image',
      description: 'Develop a more positive relationship with my body.',
    },
    {
      id: 'support',
      title: 'Find support resources',
      description: 'Connect with professional help and support communities.',
    },
    {
      id: 'track',
      title: 'Track my progress',
      description: 'Monitor recovery milestones and challenges.',
    },
  ];

  return (
    <div className="space-y-6">
      <ScrollReveal>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-healing-800 mb-2">What are your goals?</h2>
          <p className="text-gray-600">
            Select all that apply. This helps us tailor content and tools to your specific needs.
          </p>
        </div>
      </ScrollReveal>

      <div className="space-y-4">
        {goals.map((goal, index) => (
          <ScrollReveal key={goal.id} delay={index * 100} direction="right">
            <Card 
              className={`border hover:border-healing-400 transition-colors cursor-pointer ${selectedGoals.includes(goal.id) ? 'border-healing-500 bg-healing-50' : ''}`}
              onClick={() => onToggleGoal(goal.id)}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  <Checkbox 
                    id={goal.id} 
                    checked={selectedGoals.includes(goal.id)}
                    onCheckedChange={() => onToggleGoal(goal.id)}
                    className="mt-1" 
                  />
                  <div>
                    <Label htmlFor={goal.id} className="text-base sm:text-lg font-medium text-healing-800 cursor-pointer">
                      {goal.title}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};

export default OnboardingGoals;
