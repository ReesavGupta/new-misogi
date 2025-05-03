
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  reminderTime: string | null;
}

export interface Habit {
  id: string;
  name: string;
  targetDays: 'everyday' | 'weekdays' | 'custom';
  customDays: string | null; // JSON string of day numbers (0-6)
  startDate: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  currentStreak?: number;
  longestStreak?: number;
  todayCompleted?: boolean | null;
  habitLogs?: HabitLog[];
}

export interface HabitLog {
  id: string;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  habitId: string;
  userId: string;
}

export interface HabitStreakInfo {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
}

export interface HeatmapDataPoint {
  date: string;
  value: number;
  habitId: string;
  habitName: string;
}

export interface StatsData {
  summary: {
    totalHabits: number;
    totalCompletions: number;
    totalMissed: number;
    completionRate: number;
  };
  timeSeriesData: {
    date: string;
    completed: number;
    missed: number;
    total: number;
  }[];
  topHabits: {
    id: string;
    name: string;
    longestStreak: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface HabitFormData {
  name: string;
  targetDays: 'everyday' | 'weekdays' | 'custom';
  customDays?: number[];
  startDate?: Date;
}

export interface HabitLogData {
  date: string;
  completed: boolean;
}