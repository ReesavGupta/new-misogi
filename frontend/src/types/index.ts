// API Response Types
export interface ApiResponse {
  status: string
  data: any
  accessToken: string
  success: string
  user: User
}

// User Types
export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export interface RefreshToken {
  id: string
  token: string
  userId: string
  expiresAt: string
  createdAt: string
  revoked: boolean
}

// Habit Types
export interface Habit {
  id: string
  name: string
  targetDays: string // "everyday", "weekdays", "custom"
  customDays: string | null // JSON string for custom days e.g. "[0,2,4]" for Sun, Tue, Thu
  startDate: string
  createdAt: string
  updatedAt: string
  userId: string
  habitLogs?: HabitLog[]
  currentStreak: number
  longestStreak: number
  todayCompleted?: boolean
}

export interface HabitLog {
  id: string
  habitId: string
  userId: string
  date: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

// Settings Types
export interface UserSettings {
  id: string
  userId: string
  theme: string
  reminderTime: string | null
}

// Dashboard Types
export interface DashboardStats {
  summary: {
    totalHabits: number
    totalCompletions: number
    totalMissed: number
    completionRate: number
  }
  timeSeriesData: TimeSeriesData[]
  topHabits: {
    id: string
    name: string
    longestStreak: number
  }[]
}

export interface TimeSeriesData {
  date: string
  completed: number
  missed: number
  total: number
}

export interface HeatmapData {
  date: string
  value: number // 1 for completed, 0 for missed
  habitId?: string
  habitName?: string
}
