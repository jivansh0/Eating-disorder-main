
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../utils/firebase";
import { MoodEntry, ProgressMetrics } from "@/types/types";

export const saveMoodEntry = async (moodEntry: Omit<MoodEntry, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "moods"), {
      ...moodEntry,
      timestamp: new Date().toISOString()
    });
    
    // Update user's progress metrics
    await updateUserProgressMetrics(moodEntry.userId);
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding mood entry:", error);
    throw error;
  }
};

export const updateMoodEntry = async (id: string, moodEntry: Partial<MoodEntry>): Promise<void> => {
  try {
    const moodRef = doc(db, "moods", id);
    await updateDoc(moodRef, moodEntry);
  } catch (error) {
    console.error("Error updating mood entry:", error);
    throw error;
  }
};

export const deleteMoodEntry = async (id: string): Promise<void> => {
  try {
    const moodRef = doc(db, "moods", id);
    await deleteDoc(moodRef);
  } catch (error) {
    console.error("Error deleting mood entry:", error);
    throw error;
  }
};

export const getUserMoodEntries = async (userId: string): Promise<MoodEntry[]> => {
  try {
    const moodsQuery = query(
      collection(db, "moods"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
    
    const querySnapshot = await getDocs(moodsQuery);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        date: data.date,
        mood: data.mood,
        note: data.note,
        timestamp: data.timestamp
      } as MoodEntry;
    }); 
  } catch (error) {
    console.error("Error getting mood entries:", error);
    throw error;
  }
};

// Get the last 7 days of mood entries for a user
export const getUserRecentMoodEntries = async (userId: string, days = 7): Promise<MoodEntry[]> => {
  try {
    // Calculate date from 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - days);
    const startDate = sevenDaysAgo.toISOString().split('T')[0];
    
    const moodsQuery = query(
      collection(db, "moods"),
      where("userId", "==", userId),
      where("date", ">=", startDate),
      orderBy("date", "asc")
    );
    
    const querySnapshot = await getDocs(moodsQuery);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        date: data.date,
        mood: data.mood,
        note: data.note,
        timestamp: data.timestamp
      } as MoodEntry;
    });
  } catch (error) {
    console.error("Error getting recent mood entries:", error);
    throw error;
  }
};

// Check if a user has recorded a mood today
export const hasRecordedMoodToday = async (userId: string): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const moodsQuery = query(
      collection(db, "moods"),
      where("userId", "==", userId),
      where("date", "==", today)
    );
    
    const querySnapshot = await getDocs(moodsQuery);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking today's mood entry:", error);
    return false;
  }
};

// Update user's progress metrics
export const updateUserProgressMetrics = async (userId: string): Promise<void> => {
  try {
    // Get user's document reference
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error("User document not found");
      return;
    }
    
    // Get user's mood entries
    const moodEntries = await getUserMoodEntries(userId);
    
    // Get user's goals
    const goalsQuery = query(
      collection(db, "goals"),
      where("userId", "==", userId)
    );
    const goalsSnapshot = await getDocs(goalsQuery);
    const goals = goalsSnapshot.docs.map(doc => doc.data());
    const completedGoals = goals.filter(goal => goal.completed).length;
    
    // Calculate streak days
    const sortedEntries = [...moodEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Calculate streak (consecutive days with entries)
    let streakDays = 0;
    if (sortedEntries.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentDate = new Date(sortedEntries[0].date);
      currentDate.setHours(0, 0, 0, 0);
      
      const isToday = currentDate.getTime() === today.getTime();
      if (isToday) {
        streakDays = 1;
        
        // Check for consecutive previous days
        let previousDate = new Date(today);
        
        for (let i = 1; i < sortedEntries.length; i++) {
          previousDate.setDate(previousDate.getDate() - 1);
          const entryDate = new Date(sortedEntries[i].date);
          entryDate.setHours(0, 0, 0, 0);
          
          if (entryDate.getTime() === previousDate.getTime()) {
            streakDays++;
          } else {
            break;
          }
        }
      }
    }
    
    // Create progress metrics
    const progressMetrics: ProgressMetrics = {
      completedGoals,
      totalGoals: goals.length,
      streakDays,
      lastActiveDate: new Date().toISOString()
    };
    
    // Update user document
    await updateDoc(userRef, {
      lastActivity: new Date().toISOString(),
      moodEntries: moodEntries.length,
      progressMetrics
    });
    
  } catch (error) {
    console.error("Error updating user progress metrics:", error);
  }
};

// Fallback to local storage if user is not authenticated or offline
export const getLocalMoodEntries = (): MoodEntry[] => {
  try {
    const storedMoods = localStorage.getItem('moodHistory');
    if (storedMoods) {
      return JSON.parse(storedMoods);
    }
  } catch (error) {
    console.error("Failed to parse mood history from localStorage:", error);
  }
  return [];
};

export const saveLocalMoodEntry = (moodEntry: MoodEntry): void => {
  try {
    const storedMoods = localStorage.getItem('moodHistory');
    let allMoods: MoodEntry[] = [];
    
    if (storedMoods) {
      allMoods = JSON.parse(storedMoods);
      // Remove any entries for this user on the same date
      allMoods = allMoods.filter(entry => 
        !(entry.date === moodEntry.date && entry.userId === moodEntry.userId)
      );
    }
    
    // Add the new entry
    allMoods.push(moodEntry);
    localStorage.setItem('moodHistory', JSON.stringify(allMoods));
  } catch (error) {
    console.error("Error saving local mood entry:", error);
  }
};

// Synchronize local entries with Firebase
export const syncLocalEntriesWithFirebase = async (userId: string): Promise<void> => {
  try {
    const localEntries = getLocalMoodEntries().filter(entry => entry.userId === userId);
    
    if (localEntries.length === 0) return;
    
    // For each local entry, check if it exists in Firestore
    for (const entry of localEntries) {
      const moodsQuery = query(
        collection(db, "moods"),
        where("userId", "==", userId),
        where("date", "==", entry.date)
      );
      
      const querySnapshot = await getDocs(moodsQuery);
      
      // If entry doesn't exist in Firestore, add it
      if (querySnapshot.empty) {
        await saveMoodEntry({
          userId: entry.userId,
          date: entry.date,
          mood: entry.mood,
          note: entry.note
        });
      }
    }
    
    // Update user's progress metrics after sync
    await updateUserProgressMetrics(userId);
    
  } catch (error) {
    console.error("Error syncing local entries with Firebase:", error);
  }
};
