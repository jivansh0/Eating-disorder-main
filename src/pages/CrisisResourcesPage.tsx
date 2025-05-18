
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  Phone,
  MessageSquare,
  ExternalLink,
  Heart,
  Users,
  Home,
  Info,
  BookOpen,
  ArrowLeft,
} from "lucide-react";

const CrisisResourcesPage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="app-container min-h-screen bg-gradient-to-b from-healing-100 to-healing-200">
      <div className="container mx-auto max-w-5xl py-8 px-4">
        {/* Header with back link */}
        <div className="mb-8">
          {currentUser ? (
            <Link to="/dashboard" className="flex items-center text-healing-700 hover:text-healing-900 mb-4">
              <ArrowLeft className="mr-1 h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          ) : (
            <Link to="/" className="flex items-center text-healing-700 hover:text-healing-900 mb-4">
              <ArrowLeft className="mr-1 h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          )}

          <div className="flex items-start space-x-4">
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-healing-900">Crisis Resources</h1>
              <p className="text-gray-600 mt-1">
                If you're experiencing thoughts of self-harm, suicidal ideation, or a mental health emergency, 
                please use these resources to get immediate help.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency disclaimer */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-6 w-6 shrink-0 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">In Immediate Danger?</h3>
                <p className="text-red-700 mt-1">
                  If you're in immediate danger or experiencing a life-threatening emergency, 
                  please call emergency services (911 in the US) or go to your nearest emergency room right away.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crisis Hotlines */}
        <Card className="mb-6 border-healing-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-healing-800">
              <Phone className="mr-2 h-5 w-5 text-healing-600" />
              Crisis Hotlines
            </CardTitle>
            <CardDescription>
              Free, confidential support available 24/7
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-healing-100 p-4">
              <h3 className="font-medium text-healing-800">National Suicide Prevention Lifeline</h3>
              <p className="text-sm text-gray-600 mt-1">
                24/7 support for people in distress, prevention and crisis resources for you or loved ones.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="default" className="bg-healing-600 hover:bg-healing-700">
                  <Phone className="mr-2 h-4 w-4" />
                  Call 988 or 1-800-273-8255
                </Button>
                <Button variant="outline" className="border-healing-300">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Website
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-healing-100 p-4">
              <h3 className="font-medium text-healing-800">Crisis Text Line</h3>
              <p className="text-sm text-gray-600 mt-1">
                Text-based crisis intervention, emotional support, and resources.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="default" className="bg-healing-600 hover:bg-healing-700">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Text HOME to 741741
                </Button>
                <Button variant="outline" className="border-healing-300">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Website
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-healing-100 p-4">
              <h3 className="font-medium text-healing-800">National Eating Disorders Association Helpline</h3>
              <p className="text-sm text-gray-600 mt-1">
                Support, resources, and treatment options for eating disorders.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="default" className="bg-healing-600 hover:bg-healing-700">
                  <Phone className="mr-2 h-4 w-4" />
                  Call 1-800-931-2237
                </Button>
                <Button variant="outline" className="border-healing-300">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Website
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <Card className="mb-8 border-healing-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-healing-800">
              <BookOpen className="mr-2 h-5 w-5 text-healing-600" />
              Additional Resources
            </CardTitle>
            <CardDescription>
              Support organizations and helpful information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-healing-100 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-healing-600" />
                  <h3 className="font-medium text-healing-800">Support Groups</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Find local and online eating disorder support groups through organizations like ANAD.
                </p>
                <Button variant="link" className="px-0 mt-2 text-healing-600">
                  <ExternalLink className="mr-1 h-3.5 w-3.5" />
                  Alliance for Eating Disorders Awareness
                </Button>
              </div>

              <div className="rounded-lg border border-healing-100 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Home className="h-5 w-5 text-healing-600" />
                  <h3 className="font-medium text-healing-800">Treatment Locator</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Find specialized eating disorder treatment centers and providers near you.
                </p>
                <Button variant="link" className="px-0 mt-2 text-healing-600">
                  <ExternalLink className="mr-1 h-3.5 w-3.5" />
                  NEDA Treatment Finder
                </Button>
              </div>

              <div className="rounded-lg border border-healing-100 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="h-5 w-5 text-healing-600" />
                  <h3 className="font-medium text-healing-800">Caregiver Support</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Resources for family members and caregivers supporting someone with an eating disorder.
                </p>
                <Button variant="link" className="px-0 mt-2 text-healing-600">
                  <ExternalLink className="mr-1 h-3.5 w-3.5" />
                  F.E.A.S.T. for Families
                </Button>
              </div>

              <div className="rounded-lg border border-healing-100 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="h-5 w-5 text-healing-600" />
                  <h3 className="font-medium text-healing-800">Educational Materials</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Evidence-based information about eating disorders, symptoms, and recovery.
                </p>
                <Button variant="link" className="px-0 mt-2 text-healing-600">
                  <ExternalLink className="mr-1 h-3.5 w-3.5" />
                  Centre for Clinical Interventions Resources
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important note */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-healing-100">
          <h3 className="text-lg font-medium text-healing-800 mb-3">A Note About This App</h3>
          <p className="text-gray-700 mb-4">
            Recovery Journey is designed to be a supportive tool on your healing path, but it is not a replacement for professional care. 
            We strongly encourage you to work with healthcare providers specialized in eating disorders alongside using this application.
          </p>
          <p className="text-gray-700">
            If you're experiencing a crisis or worsening symptoms, please reach out to a professional or use the 
            crisis resources provided above. Your wellbeing is the highest priority.
          </p>
          
          {!currentUser && (
            <div className="mt-6">
              <Button asChild className="bg-healing-600 hover:bg-healing-700">
                <Link to="/">Return to Home</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrisisResourcesPage;
