
import { doc, updateDoc, increment, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../utils/firebase";
import { ProgressMetrics, User } from "@/types/types";

export const updateUserProgress = async (userId: string, metrics: Partial<ProgressMetrics>) => {
  try {
    // Check if we're online first
    if (!navigator.onLine) {
      console.log("Device is offline, storing updates in queue");
      // Store the update in a queue to be processed when back online
      const offlineQueue = JSON.parse(localStorage.getItem('progressUpdateQueue') || '[]');
      offlineQueue.push({ userId, metrics, timestamp: new Date().toISOString() });
      localStorage.setItem('progressUpdateQueue', JSON.stringify(offlineQueue));
      return;
    }
    
    const userRef = doc(db, "users", userId);
    
    try {
      // Try to update first
      await updateDoc(userRef, {
        "progressMetrics.completedGoals": metrics.completedGoals || increment(0),
        "progressMetrics.totalGoals": metrics.totalGoals || increment(0),
        "progressMetrics.streakDays": metrics.streakDays || increment(0),
        "progressMetrics.lastActiveDate": new Date().toISOString(),
      });
    } catch (updateError) {
      console.log("Document may not exist yet, creating it:", updateError);
      
      // If update fails, document might not exist, so create it
      await setDoc(userRef, {
        progressMetrics: {
          completedGoals: metrics.completedGoals || 0,
          totalGoals: metrics.totalGoals || 0,
          streakDays: metrics.streakDays || 0,
          lastActiveDate: new Date().toISOString(),
        },
        lastUpdated: serverTimestamp()
      }, { merge: true });
    }
    
    // Process any updates that were queued while offline
    await processOfflineQueue();
    
  } catch (error) {
    console.error("Error updating user progress:", error);
    
    // If we have a network error, queue the update for later
    if (!navigator.onLine || (error instanceof Error && error.message.includes("offline"))) {
      const offlineQueue = JSON.parse(localStorage.getItem('progressUpdateQueue') || '[]');
      offlineQueue.push({ userId, metrics, timestamp: new Date().toISOString() });
      localStorage.setItem('progressUpdateQueue', JSON.stringify(offlineQueue));
    } else {
      throw error;
    }
  }
};

// Process any queued updates when back online
const processOfflineQueue = async () => {
  if (!navigator.onLine) return;
  
  const queueStr = localStorage.getItem('progressUpdateQueue');
  if (!queueStr) return;
  
  const queue = JSON.parse(queueStr);
  if (queue.length === 0) return;
  
  console.log(`Processing ${queue.length} queued progress updates`);
  
  // Create a new queue for any items that fail to process
  const newQueue = [];
  
  for (const item of queue) {
    try {
      const userRef = doc(db, "users", item.userId);
      await updateDoc(userRef, {
        "progressMetrics.completedGoals": item.metrics.completedGoals || increment(0),
        "progressMetrics.totalGoals": item.metrics.totalGoals || increment(0),
        "progressMetrics.streakDays": item.metrics.streakDays || increment(0),
        "progressMetrics.lastActiveDate": item.metrics.lastActiveDate || new Date().toISOString(),
        "lastUpdated": serverTimestamp()
      });
    } catch (error) {
      console.error("Failed to process queued update:", error);
      newQueue.push(item);
    }
  }
  
  // Save any failed updates back to the queue
  localStorage.setItem('progressUpdateQueue', JSON.stringify(newQueue));
};

// Set up a listener to process the queue when the app comes back online
window.addEventListener('online', () => {
  console.log("App is back online, processing queued updates");
  processOfflineQueue();
});
