import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateUserProgress } from "../services/progressService";
import AppLayout from "../components/AppLayout";
import GoalsDialog from "../components/GoalsDialog";
import MoodTrendWidget from "../components/dashboard/MoodTrendWidget";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageCircle,
  BarChart,
  BookOpen,
  AlertTriangle,
  Heart,
  Star,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Firestore imports
import { db } from "../utils/firebase";
import { getDoc, doc, updateDoc, setDoc } from "firebase/firestore";

const quotes = [
  "Recovery is not a race; it's a journey that we take one day at a time.",
  "Your body is an instrument, not an ornament.",
  "You are worthy of recovery and capable of change.",
  "Every step forward is a step worth celebrating.",
  "Healing happens when you feel heard, not when you're called broken.",
  "The most powerful relationship you will ever have is the relationship with yourself.",
  "Your worth is not measured by your weight or appearance.",
  "Nourish your body, mind, and soul with kindness and compassion.",
  "You are stronger than you think.",
  "Take it one step at a time.",
  "Every day is a second chance.",
  "Your feelings are valid.",
  "Believe in yourself.",
];

const Dashboard = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [quote, setQuote] = useState("");
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [isGoalsDialogOpen, setIsGoalsDialogOpen] = useState(false);
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch data on mount
  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);

    const fetchUserData = async () => {
      const today = new Date().toISOString().split('T')[0];

      // Load mood from localStorage or Firestore
      const storedMoods = localStorage.getItem('moodHistory');
      if (storedMoods) {
        try {
          const moodHistory = JSON.parse(storedMoods);
          const todayEntry = moodHistory.find((entry: any) => entry.date === today);
          if (todayEntry) {
            setTodayMood(todayEntry.mood);
          }
        } catch (error) {
          console.error("Failed to parse mood history:", error);
        }
      }

      // Load goals from currentUser or localStorage
      if (currentUser?.goals) {
        setUserGoals(currentUser.goals);
      } else {
        const storedGoals = localStorage.getItem('userGoals');
        if (storedGoals) {
          try {
            setUserGoals(JSON.parse(storedGoals));
          } catch (error) {
            console.error("Failed to parse goals:", error);
          }
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Update daily streak progress
  useEffect(() => {
    const updateDailyProgress = async () => {
      if (!currentUser?.id) return;

      const today = new Date().toISOString().split('T')[0];
      const userRef = doc(db, "users", currentUser.id);

      try {
        const userSnap = await getDoc(userRef);
        const data = userSnap.data();
        const lastActive = data?.progressMetrics?.lastActiveDate?.split('T')[0];

        if (lastActive !== today) {
          const newStreak = (data?.progressMetrics?.streakDays || 0) + 1;

          await updateDoc(userRef, {
            "progressMetrics.streakDays": newStreak,
            "progressMetrics.lastActiveDate": today
          });

          toast({
            title: "Progress Updated",
            description: "Your daily streak has been updated!",
          });
        }
      } catch (err) {
        console.error("Error updating streak:", err);
      }
    };

    updateDailyProgress();
  }, [currentUser]);

  const handleSaveGoals = async (goals: string[]) => {
    console.log("Saving goals from dialog:", goals); // Debug log
    
    // Update local state first for immediate UI feedback
    setUserGoals([...goals]);
    
    // Make sure we're saving an array to localStorage
    localStorage.setItem('userGoals', JSON.stringify(goals));

    if (currentUser?.id) {
      try {
        const userRef = doc(db, "users", currentUser.id);
        await updateDoc(userRef, {
          goals: goals, // Ensure we're passing the array directly
          "progressMetrics.totalGoals": goals.length,
        });

        // Update the AuthContext to reflect the new goals
        await updateUserProfile({
          goals: goals, // Ensure we're passing the array directly
          progressMetrics: {
            ...currentUser.progressMetrics,
            totalGoals: goals.length,
          }
        });

        toast({
          title: "Goals Updated",
          description: `${goals.length} ${goals.length === 1 ? 'goal has' : 'goals have'} been saved successfully.`,
        });
      } catch (error) {
        console.error("Failed to save goals:", error);
        toast({
          title: "Error",
          description: "Could not update goals. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // For non-authenticated users, just store in localStorage
      toast({
        title: "Goals Saved Locally",
        description: "Goals saved to your device. Create an account to sync across devices.",
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-healing-900">
              Welcome{currentUser?.name ? `, ${currentUser.name}` : ""}
            </h2>
            <p className="mt-1 text-muted-foreground">
              Your recovery journey dashboard - what would you like to focus on today?
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-healing-600" />
            <span className="text-sm font-medium text-healing-800">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <Card className="border-healing-200 bg-healing-50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-4 mt-1 rounded-full bg-healing-100 p-2">
                <Heart className="h-6 w-6 text-healing-600" />
              </div>
              <div>
                <p className="text-lg italic text-healing-800">"{quote}"</p>
                <p className="mt-2 text-sm text-healing-600">Daily Inspiration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-hover border-healing-200 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-healing-800">
                <MessageCircle className="mr-2 h-5 w-5 text-healing-600" />
                AI Support Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <p className="text-sm text-gray-600 mb-auto">
                Get empathetic support and guidance from your AI companion.
              </p>
              <Button asChild className="mt-4 w-full bg-healing-500 hover:bg-healing-600 text-white">
                <Link to="/chat">Start Chatting</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover border-healing-200 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-healing-800">
                <BarChart className="mr-2 h-5 w-5 text-healing-600" />
                Mood Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <p className="text-sm text-gray-600 mb-auto">
                {todayMood
                  ? `Today's mood: ${todayMood}/5`
                  : "You haven't logged your mood today."}
              </p>
              <Button asChild className="mt-4 w-full bg-healing-500 hover:bg-healing-600 text-white">
                <Link to="/mood">Log Your Mood</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover border-healing-200 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-healing-800">
                <BookOpen className="mr-2 h-5 w-5 text-healing-600" />
                Educational Content
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <p className="text-sm text-gray-600 mb-auto">
                Explore articles, videos, and resources about recovery.
              </p>
              <Button asChild className="mt-4 w-full bg-healing-500 hover:bg-healing-600 text-white">
                <Link to="/learn">Explore</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover border-healing-200 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-healing-800">
                <AlertTriangle className="mr-2 h-5 w-5 text-healing-600" />
                Crisis Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <p className="text-sm text-gray-600 mb-auto">
                Access immediate support if you're experiencing a crisis.
              </p>
              <Button asChild className="mt-4 w-full bg-healing-500 hover:bg-healing-600 text-white">
                <Link to="/crisis-resources">View Resources</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-healing-200">
            <CardHeader>
              <CardTitle className="flex items-center text-healing-800">
                <Star className="mr-2 h-5 w-5 text-healing-600" />
                Your Goals
              </CardTitle>
              <CardDescription>Track your progress on recovery goals</CardDescription>
            </CardHeader>
            <CardContent>
              {userGoals.length > 0 ? (
                <ul className="space-y-3">
                  {userGoals.slice(0, 3).map((goal, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-3 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-healing-300 text-xs">
                        {index + 1}
                      </div>
                      <span className="text-sm">{goal}</span>
                    </li>
                  ))}
                  <li className="text-sm text-healing-600 hover:text-healing-800">
                    <Button
                      variant="ghost"
                      className="p-0 h-auto flex items-center text-healing-600 hover:text-healing-800"
                      onClick={() => setIsGoalsDialogOpen(true)}
                    >
                      View all goals <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </li>
                </ul>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-2">You haven't set any goals yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-healing-300 text-healing-700"
                    onClick={() => setIsGoalsDialogOpen(true)}
                  >
                    Add a Goal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Replace mock data with the MoodTrendWidget component */}
          <MoodTrendWidget />
        </div>
      </div>

      <GoalsDialog
        open={isGoalsDialogOpen}
        onOpenChange={setIsGoalsDialogOpen}
        goals={userGoals}
        onSaveGoals={handleSaveGoals}
      />
    </AppLayout>
  );
};

export default Dashboard;
