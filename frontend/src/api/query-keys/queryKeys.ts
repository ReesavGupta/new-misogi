// src/api/query-keys/queryKeys.ts
// Define consistent query keys for React Query

export const queryKeys = {
  habits: {
    // Base key for all habit-related queries
    all: ['habits'] as const,

    // Keys for specific habit queries
    detail: (id: string) => [...queryKeys.habits.all, 'detail', id] as const,

    // Today's habits
    today: () => [...queryKeys.habits.all, 'today'] as const,

    // Habit logs
    logs: (id: string, startDate?: string, endDate?: string) =>
      [...queryKeys.habits.all, 'logs', id, startDate, endDate] as const,

    // Streaks
    streak: (id: string) => [...queryKeys.habits.all, 'streak', id] as const,

    // Heatmap data for a habit
    heatmap: (id?: string, year?: number, month?: number) =>
      [...queryKeys.habits.all, 'heatmap', id, year, month] as const,
  },

  stats: {
    // Base key for all stats-related queries
    all: ['stats'] as const,

    // Stats by period (week, month, year)
    byPeriod: (period: 'week' | 'month' | 'year') =>
      [...queryKeys.stats.all, 'period', period] as const,

    // Heatmap data for dashboard
    heatmap: (year?: number, month?: number) =>
      [...queryKeys.stats.all, 'heatmap', year, month] as const,
  },

  settings: {
    // User settings
    all: ['settings'] as const,
  },
}
