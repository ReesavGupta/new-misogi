import type { Request, Response } from 'express'
import asyncHandler from '../utils/asyncHanlder'
import { ApiResponse } from '../utils/ApiResponse'
import prisma from '../../prisma/client'

/**
 * Get overall statistics
 */
export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id
  const { period } = req.query

  // console.log('asdasdasdasdsdaasdasd')
  // Determine date range based on period
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let startDate: Date

  switch (period) {
    case 'week':
      // Last 7 days
      startDate = new Date(today)
      startDate.setDate(today.getDate() - 6)
      break
    case 'month':
      // Last 30 days
      startDate = new Date(today)
      startDate.setDate(today.getDate() - 29)
      break
    case 'year':
      // Last 365 days
      startDate = new Date(today)
      startDate.setDate(today.getDate() - 364)
      break
    default:
      // Default to last 7 days
      startDate = new Date(today)
      startDate.setDate(today.getDate() - 6)
  }

  // Get all habits for the user
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      habitLogs: {
        where: {
          date: {
            gte: startDate,
            lte: today,
          },
        },
      },
    },
  })

  // Get all habit logs within date range
  const habitLogs = await prisma.habitLog.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: today,
      },
    },
    orderBy: { date: 'asc' },
  })

  // Calculate statistics
  const totalHabits = habits.length
  const totalCompletions = habitLogs.filter((log) => log.completed).length
  const totalMissed = habitLogs.filter((log) => !log.completed).length

  // Group by date for time series data
  const completionsByDate = new Map()
  let currentDate = new Date(startDate)

  // Initialize all dates in range with zero completions
  while (currentDate <= today) {
    const dateKey = currentDate.toISOString().split('T')[0]
    completionsByDate.set(dateKey, {
      date: dateKey,
      completed: 0,
      missed: 0,
      total: 0,
    })

    const nextDate = new Date(currentDate)
    nextDate.setDate(currentDate.getDate() + 1)
    currentDate = nextDate
  }

  // Fill in actual completion data
  habitLogs.forEach((log) => {
    const dateKey = new Date(log.date).toISOString().split('T')[0]
    const dateData = completionsByDate.get(dateKey)

    if (dateData) {
      dateData.total += 1

      if (log.completed) {
        dateData.completed += 1
      } else {
        dateData.missed += 1
      }
    }
  })

  // Convert map to array for response
  const timeSeriesData = Array.from(completionsByDate.values())

  // Get completion rate
  const completionRate =
    totalCompletions + totalMissed > 0
      ? Math.round((totalCompletions / (totalCompletions + totalMissed)) * 100)
      : 0

  // Calculate longest streaks for all habits
  const habitsWithStreaks = habits.map((habit) => {
    // Calculate longest streak for each habit
    let longestStreak = 0
    let currentStreak = 0
    let lastLogDate: Date | null = null

    // Sort logs by date
    const sortedLogs = [...habit.habitLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    sortedLogs.forEach((log) => {
      const logDate = new Date(log.date)

      if (log.completed) {
        if (lastLogDate === null) {
          // First completed log
          currentStreak = 1
        } else {
          // Check if consecutive day
          const expectedDate = new Date(lastLogDate)
          expectedDate.setDate(expectedDate.getDate() + 1)

          console.log(
            'log date: ',
            logDate,
            logDate.getTime(),
            'expected date:',
            expectedDate,
            expectedDate.getTime(),
            lastLogDate
          )

          if (logDate.getTime() === expectedDate.getTime()) {
            currentStreak++
          } else {
            // Not consecutive, start new streak
            currentStreak = 1
          }
        }

        longestStreak = Math.max(longestStreak, currentStreak)
        lastLogDate = logDate
      } else {
        // Reset streak on missed day
        currentStreak = 0
        lastLogDate = null
      }
    })

    return {
      id: habit.id,
      name: habit.name,
      longestStreak,
    }
  })

  // Find top performing habits (by longest streak)
  const topHabits = [...habitsWithStreaks]
    .sort((a, b) => b.longestStreak - a.longestStreak)
    .slice(0, 5)

  res.json(
    ApiResponse.success({
      summary: {
        totalHabits,
        totalCompletions,
        totalMissed,
        completionRate,
      },
      timeSeriesData,
      topHabits,
    })
  )
})

/**
 * Get heatmap data for visualization
 */
export const getHeatmapData = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id
    const { habitId, year, month } = req.query

    // Validate habitId if provided
    if (habitId) {
      const habit = await prisma.habit.findUnique({
        where: { id: habitId as string },
      })

      if (!habit || habit.userId !== userId) {
        res.json(ApiResponse.success({ data: [] }))
        return
      }
    }

    // Parse year and month if provided
    const targetYear = year
      ? parseInt(year as string)
      : new Date().getFullYear()
    const targetMonth = month ? parseInt(month as string) - 1 : null // 0-indexed months

    // Define date range
    let startDate: Date
    let endDate: Date

    if (targetMonth !== null) {
      // For specific month
      startDate = new Date(targetYear, targetMonth, 1)
      endDate = new Date(targetYear, targetMonth + 1, 0) // Last day of month
    } else {
      // For entire year
      startDate = new Date(targetYear, 0, 1)
      endDate = new Date(targetYear, 11, 31)
    }

    // Query logs for the date range
    const logs = await prisma.habitLog.findMany({
      where: {
        userId,
        ...(habitId ? { habitId: habitId as string } : {}),
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        habit: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    })

    // Transform logs into heatmap format
    const heatmapData = logs.map((log) => ({
      date: log.date.toISOString().split('T')[0],
      value: log.completed ? 1 : 0,
      habitId: log.habitId,
      habitName: log.habit.name,
    }))

    res.json(ApiResponse.success(heatmapData))
  }
)
