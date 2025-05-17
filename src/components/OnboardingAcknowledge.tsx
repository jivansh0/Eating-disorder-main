
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import ScrollReveal from './ScrollReveal';

interface OnboardingAcknowledgeProps {
  acknowledged: boolean;
  onAcknowledge: (value: boolean) => void;
}

const OnboardingAcknowledge: React.FC<OnboardingAcknowledgeProps> = ({
  acknowledged,
  onAcknowledge,
}) => {
  return (
    <div className="space-y-6">
      <ScrollReveal>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-healing-800 mb-2">Important Information</h2>
          <p className="text-gray-600">
            Please acknowledge the following before continuing.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <Card className="border shadow-md">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-healing-800 mb-2">This app is not a substitute for professional care</h3>
                <p className="text-sm text-gray-600">
                  Recovery Journey is designed to be a supportive tool alongside professional treatment, not a replacement for it. 
                  If you're experiencing severe symptoms or are in crisis, please seek professional help immediately.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-healing-800 mb-2">Recovery is a personalized journey</h3>
                <p className="text-sm text-gray-600">
                  What works for one person may not work for another. This app offers general guidance that should be 
                  adapted to your unique circumstances, preferably with input from your healthcare provider.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-healing-800 mb-2">Privacy and data security</h3>
                <p className="text-sm text-gray-600">
                  Your information is protected according to our privacy policy. We take measures to secure your data, 
                  but no digital system is completely secure. Please be mindful of the personal information you share.
                </p>
              </div>

              <div className="flex items-start space-x-3 pt-4 border-t">
                <Checkbox 
                  id="acknowledge" 
                  checked={acknowledged}
                  onCheckedChange={(checked) => onAcknowledge(checked as boolean)}
                  className="mt-1" 
                />
                <div>
                  <Label htmlFor="acknowledge" className="text-sm font-medium cursor-pointer">
                    I acknowledge that I have read and understand the above information. I understand that this app is a 
                    supportive tool and not a replacement for professional treatment.
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
};

export default OnboardingAcknowledge;
