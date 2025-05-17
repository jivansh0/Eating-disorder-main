
export interface User {
  id: string;
  email: string;
  name?: string;
  goals?: string[];
  disorder?: string;
  registrationDate?: Date;
  onboardingCompleted?: boolean;
  lastActivity?: string;
  moodEntries?: number;
  progressMetrics?: ProgressMetrics;
}

export interface ProgressMetrics {
  completedGoals: number;
  totalGoals: number;
  streakDays: number;
  lastActiveDate: string;
}

export interface MoodEntry {
  id?: string;
  date: string;
  mood: number;
  note: string;
  userId: string;
  timestamp?: string;
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  userId: string;
  createdAt?: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  userId: string;
}

export interface LearningResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'guide';
  description: string;
  url: string;
  category: string;
  duration?: number; // in minutes
}
