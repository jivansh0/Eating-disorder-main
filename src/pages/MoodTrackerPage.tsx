import { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Smile,
  Frown,
  Meh,
  Calendar,
  BarChart2,
  Check,
  CalendarDays,
} from "lucide-react";
import { MoodEntry } from "@/types/types";

// Mood definitions
const moodDefinitions = [
  { value: 1, label: "Very Low", icon: Frown, color: "text-red-500", bg: "bg-red-100" },
  { value: 2, label: "Low", icon: Frown, color: "text-orange-500", bg: "bg-orange-100" },
  { value: 3, label: "Neutral", icon: Meh, color: "text-yellow-500", bg: "bg-yellow-100" },
  { value: 4, label: "Good", icon: Smile, color: "text-green-500", bg: "bg-green-100" },
  { value: 5, label: "Great", icon: Smile, color: "text-emerald-500", bg: "bg-emerald-100" },
];

const MoodTrackerPage = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Load mood history from local storage on mount
  useEffect(() => {
    const storedMoods = localStorage.getItem('moodHistory');
    if (storedMoods) {
      try {
        const parsedMoods = JSON.parse(storedMoods);
        // Filter moods for current user if logged in
        const userMoods = currentUser?.id 
          ? parsedMoods.filter((mood: MoodEntry) => mood.userId === currentUser.id)
          : parsedMoods;
        setMoodHistory(userMoods);
      } catch (error) {
        console.error("Failed to parse mood history from localStorage:", error);
        // If parsing fails, start with empty array
        setMoodHistory([]);
      }
    }
  }, [currentUser]);

  const handleSubmit = () => {
    if (selectedMood === null) {
      toast({
        title: "Please select a mood",
        description: "You need to select how you're feeling today",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const today = new Date().toISOString().split("T")[0];
    
    // Check if we already have an entry for today
    const existingEntryIndex = moodHistory.findIndex(entry => 
      entry.date === today && entry.userId === (currentUser?.id || 'anonymous')
    );

    // Add new mood entry to history
    const newEntry: MoodEntry = {
      date: today,
      mood: selectedMood,
      note: note,
      userId: currentUser?.id || 'anonymous',
    };

    let updatedHistory: MoodEntry[];
    
    if (existingEntryIndex >= 0) {
      // Update existing entry
      updatedHistory = [...moodHistory];
      updatedHistory[existingEntryIndex] = newEntry;
    } else {
      // Add new entry
      updatedHistory = [newEntry, ...moodHistory];
    }

    // Simulate API call with setTimeout
    setTimeout(() => {
      setMoodHistory(updatedHistory);
      
      // Store all moods in localStorage
      const allStoredMoods = localStorage.getItem('moodHistory');
      let allMoods: MoodEntry[] = [];
      
      try {
        if (allStoredMoods) {
          allMoods = JSON.parse(allStoredMoods);
          // Remove any entries for this user on the same date
          allMoods = allMoods.filter(entry => 
            !(entry.date === today && entry.userId === (currentUser?.id || 'anonymous'))
          );
        }
      } catch (error) {
        console.error("Error parsing stored moods:", error);
      }
      
      // Add the new entry
      allMoods.push(newEntry);
      localStorage.setItem('moodHistory', JSON.stringify(allMoods));
      
      setSelectedMood(null);
      setNote("");
      setIsSubmitting(false);
      
      toast({
        title: "Mood logged successfully",
        description: "Your mood has been recorded for today",
      });
    }, 1000);
  };

  // Get mood details based on value
  const getMoodDetails = (value: number) => {
    return moodDefinitions.find(mood => mood.value === value) || moodDefinitions[2]; // Default to neutral
  };

  // Get the last 7 days of mood data for the chart
  const getChartData = () => {
    // Create an array of the last 7 days for the chart
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    // Map the dates to mood entries or use a default value
    return last7Days.map(date => {
      const entry = moodHistory.find(entry => entry.date === date);
      return entry || { date, mood: 0, note: "", userId: currentUser?.id || 'anonymous' };
    });
  };

  // Get chart data for visualization
  const chartData = getChartData();

  // Calculate height percentage based on mood value with improved scaling
  const getMoodHeight = (moodValue: number) => {
    if (moodValue === 0) return '0%'; // No height for no entry
    
    // Scale moods from 1-5 to appropriate percentages that won't overlap with headers
    const maxBarHeight = 70; // Maximum percentage height for a bar
    const scale = maxBarHeight / 5; // Scale factor
    
    return `${moodValue * scale}%`;
  };

  // Get baseline position for the chart (middle)
  const getBaselinePosition = () => {
    return '50%';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-healing-900">Mood Tracker</h2>
          <p className="text-muted-foreground">
            Track your emotional well-being and identify patterns in your recovery journey
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Log Mood Card */}
          <Card className="border-healing-200">
            <CardHeader>
              <CardTitle className="flex items-center text-healing-800">
                <Calendar className="mr-2 h-5 w-5 text-healing-600" />
                Log Today's Mood
              </CardTitle>
              <CardDescription>How are you feeling today?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mood Selection */}
              <div className="grid grid-cols-5 gap-2">
                {moodDefinitions.map((mood) => {
                  const MoodIcon = mood.icon;
                  return (
                    <Button
                      key={mood.value}
                      variant="outline"
                      className={`flex flex-col h-auto py-3 border-healing-200 ${
                        selectedMood === mood.value
                          ? "border-healing-500 bg-healing-50 ring-1 ring-healing-500"
                          : ""
                      }`}
                      onClick={() => setSelectedMood(mood.value)}
                    >
                      <MoodIcon className={`h-6 w-6 mb-1 ${mood.color}`} />
                      <span className="text-xs font-normal">{mood.label}</span>
                    </Button>
                  );
                })}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes (optional)
                </label>
                <Textarea
                  id="notes"
                  placeholder="How would you describe your feelings or experiences today?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="h-24 resize-none border-healing-200"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSubmit}
                className="w-full bg-healing-500 hover:bg-healing-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    <span>Save Mood Entry</span>
                  </div>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Mood Chart */}
          <Card className="border-healing-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-healing-800">
                <BarChart2 className="mr-2 h-5 w-5 text-healing-600" />
                Mood Trends
              </CardTitle>
              <CardDescription>Your mood patterns over time</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[200px] relative" style={{ marginTop: '10px' }}>
                {/* Baseline (neutral line) */}
                <div 
                  className="absolute w-full h-px bg-gray-300" 
                  style={{ top: getBaselinePosition() }}
                ></div>
                
                <div className="flex h-full w-full items-end justify-between">
                  {chartData.map((entry, i) => {
                    // Only show bars for entries with moods
                    const moodDetail = entry.mood ? getMoodDetails(entry.mood) : null;
                    const dayName = new Date(entry.date).toLocaleDateString("en-US", { weekday: "short" });
                    
                    return (
                      <div key={i} className="flex flex-col items-center relative h-full">
                        {entry.mood > 0 && (
                          <div
                            className={`w-8 rounded-sm transition-all hover:opacity-80 ${
                              moodDetail ? moodDetail.bg : "bg-gray-100"
                            }`}
                            style={{ 
                              height: getMoodHeight(entry.mood),
                              position: 'absolute',
                              bottom: entry.mood <= 3 ? 'auto' : getBaselinePosition(),
                              top: entry.mood <= 3 ? getBaselinePosition() : 'auto',
                              maxHeight: `calc(${getBaselinePosition()} - 10px)`, // Prevent overlap with header
                            }}
                            title={`${moodDetail?.label || 'No mood'}: ${entry.note || "No notes for this day"}`}
                          ></div>
                        )}
                        <span className="absolute bottom-0 text-xs">{dayName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-8 text-center text-sm text-gray-500">
                Viewing the last 7 days
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mood History */}
        <Card className="border-healing-200">
          <CardHeader>
            <CardTitle className="flex items-center text-healing-800">
              <CalendarDays className="mr-2 h-5 w-5 text-healing-600" />
              Mood History
            </CardTitle>
            <CardDescription>Review your past mood entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moodHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-6">You haven't logged any moods yet. Start tracking your moods to see your history here.</p>
              ) : (
                moodHistory.map((entry, index) => {
                  const moodDetail = getMoodDetails(entry.mood);
                  const MoodIcon = moodDetail.icon;
                  return (
                    <div key={index} className="flex border-b border-healing-100 pb-4 last:border-0 last:pb-0">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full mr-4 ${moodDetail.bg}`}>
                        <MoodIcon className={`h-5 w-5 ${moodDetail.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">{moodDetail.label}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.date).toLocaleDateString("en-US", { 
                              year: "numeric", 
                              month: "short", 
                              day: "numeric" 
                            })}
                          </span>
                        </div>
                        {entry.note && <p className="mt-1 text-sm text-gray-600">{entry.note}</p>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default MoodTrackerPage;
