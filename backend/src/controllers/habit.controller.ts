import type { Request, Response } from 'express'
import asyncHandler from '../utils/asyncHanlder'
import { ApiError } from '../utils/ApiError'
import { ApiResponse } from '../utils/ApiResponse'
import prisma from '../../prisma/client'

/**
 * Create a new habit
 */
export const createHabit = asyncHandler(async (req: Request, res: Response) => {
  const { name, targetDays, customDays, startDate } = req.body
  const userId = req.user.id

  if (!name) {
    throw new ApiError(400, 'Habit name is required')
  }

  // Validate target days
  const validTargetDays = ['everyday', 'weekdays', 'custom']
  if (targetDays && !validTargetDays.includes(targetDays)) {
    throw new ApiError(400, 'Invalid target days value')
  }

  // If targetDays is custom, customDays should be provided
  if (targetDays === 'custom' && !customDays) {
    throw new ApiError(
      400,
      'Custom days are required when target days is set to custom'
    )
  }

  // Parse custom days if provided
  let parsedCustomDays = null
  if (customDays) {
    try {
      // Validate that customDays is a valid array of day numbers (0-6)
      const daysArray = JSON.parse(customDays)
      if (
        !Array.isArray(daysArray) ||
        !daysArray.every((day) => Number.isInteger(day) && day >= 0 && day <= 6)
      ) {
        throw new ApiError(
          400,
          'Custom days must be an array of day numbers (0-6)'
        )
      }
      parsedCustomDays = customDays
    } catch (error) {
      throw new ApiError(400, 'Invalid custom days format')
    }
  }

  // Parse start date if provided
  const parsedStartDate = startDate ? new Date(startDate) : new Date()
  if (isNaN(parsedStartDate.getTime())) {
    throw new ApiError(400, 'Invalid start date')
  }

  const habit = await prisma.habit.create({
    data: {
      name,
      targetDays: targetDays || 'everyday',
      customDays: parsedCustomDays,
      startDate: parsedStartDate,
      userId,
    },
  })

  res.status(201).json(ApiResponse.success(habit))
})

/**
 * Get all habits for the authenticated user
 */
export const getHabits = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id

  const habits = await prisma.habit.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      habitLogs: {
        orderBy: { date: 'desc' },
        take: 30, // Get recent logs for calculating streaks
      },
    },
  })

  // Enhance habits with streak information
  const enhancedHabits = habits.map((habit) => {
    const { currentStreak, longestStreak } = calculateStreaks(habit)
    return {
      ...habit,
      currentStreak,
      longestStreak,
    }
  })

  res.json(ApiResponse.success(enhancedHabits))
})

/**
 * Get a specific habit by ID
 */
export const getHabitById = asyncHandler(
  async (req: Request, res: Response) => {
    const habitId = req.params.id
    const userId = req.user.id

    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: {
        habitLogs: {
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!habit) {
      throw new ApiError(404, 'Habit not found')
    }

    if (habit.userId !== userId) {
      throw new ApiError(403, 'You do not have permission to access this habit')
    }

    const { currentStreak, longestStreak } = calculateStreaks(habit)

    res.json(
      ApiResponse.success({
        ...habit,
        currentStreak,
        longestStreak,
      })
    )
  }
)

/**
 * Update a habit
 */
export const updateHabit = asyncHandler(async (req: Request, res: Response) => {
  const habitId = req.params.id
  const userId = req.user.id
  const { name, targetDays, customDays, startDate } = req.body

  // Find the habit first
  const existingHabit = await prisma.habit.findUnique({
    where: { id: habitId },
  })

  if (!existingHabit) {
    throw new ApiError(404, 'Habit not found')
  }

  if (existingHabit.userId !== userId) {
    throw new ApiError(403, 'You do not have permission to update this habit')
  }

  // Validate target days if provided
  if (targetDays) {
    const validTargetDays = ['everyday', 'weekdays', 'custom']
    if (!validTargetDays.includes(targetDays)) {
      throw new ApiError(400, 'Invalid target days value')
    }

    // If targetDays is custom, customDays should be provided
    if (targetDays === 'custom' && !customDays && !existingHabit.customDays) {
      throw new ApiError(
        400,
        'Custom days are required when target days is set to custom'
      )
    }
  }

  // Parse custom days if provided
  let parsedCustomDays = undefined
  if (customDays) {
    try {
      // Validate that customDays is a valid array of day numbers (0-6)
      const daysArray = JSON.parse(customDays)
      if (
        !Array.isArray(daysArray) ||
        !daysArray.every((day) => Number.isInteger(day) && day >= 0 && day <= 6)
      ) {
        throw new ApiError(
          400,
          'Custom days must be an array of day numbers (0-6)'
        )
      }
      parsedCustomDays = customDays
    } catch (error) {
      throw new ApiError(400, 'Invalid custom days format')
    }
  }

  // Parse start date if provided
  let parsedStartDate = undefined
  if (startDate) {
    const date = new Date(startDate)
    if (isNaN(date.getTime())) {
      throw new ApiError(400, 'Invalid start date')
    }
    parsedStartDate = date
  }

  const updatedHabit = await prisma.habit.update({
    where: { id: habitId },
    data: {
      name: name !== undefined ? name : undefined,
      targetDays: targetDays !== undefined ? targetDays : undefined,
      customDays: parsedCustomDays,
      startDate: parsedStartDate,
    },
  })

  res.json(ApiResponse.success(updatedHabit))
})

/**
 * Delete a habit
 */
export const deleteHabit = asyncHandler(async (req: Request, res: Response) => {
  const habitId = req.params.id
  const userId = req.user.id

  // Find the habit first
  const existingHabit = await prisma.habit.findUnique({
    where: { id: habitId },
  })

  if (!existingHabit) {
    throw new ApiError(404, 'Habit not found')
  }

  if (existingHabit.userId !== userId) {
    throw new ApiError(403, 'You do not have permission to delete this habit')
  }

  await prisma.habit.delete({
    where: { id: habitId },
  })

  res.json(ApiResponse.success({ message: 'Habit deleted successfully' }))
})

/**
 * Log habit completion status for a specific date
 */
export const logHabitCompletion = asyncHandler(
  async (req: Request, res: Response) => {
    const habitId = req.params.id
    const userId = req.user.id
    const { date, completed } = req.body

    if (typeof completed !== 'boolean') {
      throw new ApiError(400, 'Completion status must be a boolean')
    }

    if (!date) {
      throw new ApiError(400, 'Date is required')
    }

    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      throw new ApiError(400, 'Invalid date format')
    }

    // Format the date to remove time component (store only the date)
    const dateOnly = new Date(parsedDate.toISOString().split('T')[0]!)

    // Find the habit first
    const existingHabit = await prisma.habit.findUnique({
      where: { id: habitId },
    })

    if (!existingHabit) {
      throw new ApiError(404, 'Habit not found')
    }

    if (existingHabit.userId !== userId) {
      throw new ApiError(
        403,
        'You do not have permission to log completion for this habit'
      )
    }

    // Check if there is an existing log for this date
    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId,
        date: {
          equals: dateOnly,
        },
      },
    })

    let habitLog

    if (existingLog) {
      // Update existing log
      habitLog = await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { completed },
      })
    } else {
      // Create new log
      habitLog = await prisma.habitLog.create({
        data: {
          habitId: habitId as string,
          userId,
          date: dateOnly,
          completed,
        },
      })
    }

    res.json(ApiResponse.success(habitLog))
  }
)

/**
 * Get logs for a specific habit
 */
export const getHabitLogs = asyncHandler(
  async (req: Request, res: Response) => {
    const habitId = req.params.id
    const userId = req.user.id
    const { startDate, endDate } = req.query

    // Find the habit first
    const existingHabit = await prisma.habit.findUnique({
      where: { id: habitId },
    })

    if (!existingHabit) {
      throw new ApiError(404, 'Habit not found')
    }

    if (existingHabit.userId !== userId) {
      throw new ApiError(
        403,
        'You do not have permission to access logs for this habit'
      )
    }

    // Parse date range if provided
    let dateFilter: any = {}

    if (startDate) {
      const parsedStartDate = new Date(startDate as string)
      if (isNaN(parsedStartDate.getTime())) {
        throw new ApiError(400, 'Invalid start date format')
      }
      dateFilter.gte = parsedStartDate
    }

    if (endDate) {
      const parsedEndDate = new Date(endDate as string)
      if (isNaN(parsedEndDate.getTime())) {
        throw new ApiError(400, 'Invalid end date format')
      }
      dateFilter.lte = parsedEndDate
    }

    const habitLogs = await prisma.habitLog.findMany({
      where: {
        habitId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      orderBy: { date: 'desc' },
    })

    res.json(ApiResponse.success(habitLogs))
  }
)

/**
 * Get streak information for a habit
 */
export const getHabitStreak = asyncHandler(
  async (req: Request, res: Response) => {
    const habitId = req.params.id
    const userId = req.user.id

    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: {
        habitLogs: {
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!habit) {
      throw new ApiError(404, 'Habit not found')
    }

    if (habit.userId !== userId) {
      throw new ApiError(403, 'You do not have permission to access this habit')
    }

    const { currentStreak, longestStreak } = calculateStreaks(habit)

    res.json(
      ApiResponse.success({
        habitId,
        currentStreak,
        longestStreak,
      })
    )
  }
)

/**
 * Get habits for today
 */
export const getTodayHabits = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id

    // Get today's date and reset time to 00:00:00
    const today = new Date()
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = today.getDay()

    // Find all habits for the user
    const habits = await prisma.habit.findMany({
      where: {
        userId,
        startDate: {
          lte: today, // Only include habits that have already started
        },
      },
      include: {
        habitLogs: {
          where: {
            date: {
              equals: todayStart,
            },
          },
        },
      },
    })

    // Filter habits based on their target days
    const todayHabits = habits.filter((habit) => {
      if (habit.targetDays === 'everyday') {
        return true
      }

      if (habit.targetDays === 'weekdays') {
        // 0 = Sunday, 6 = Saturday
        return dayOfWeek > 0 && dayOfWeek < 6
      }

      if (habit.targetDays === 'custom' && habit.customDays) {
        try {
          const customDays = JSON.parse(habit.customDays)
          return customDays.includes(dayOfWeek)
        } catch (error) {
          console.error(
            `Invalid custom days format for habit ${habit.id}:`,
            error
          )
          return false
        }
      }

      return false
    })

    // Enhance habits with streak information and today's completion status
    const enhancedHabits = todayHabits.map((habit) => {
      const { currentStreak, longestStreak } = calculateStreaks(habit)
      const todayLog = habit.habitLogs[0] || null

      return {
        ...habit,
        currentStreak,
        longestStreak,
        todayCompleted: todayLog ? todayLog.completed : null,
      }
    })

    res.json(ApiResponse.success(enhancedHabits))
  }
)

/**
 * Helper function to calculate current and longest streaks
 */
function calculateStreaks(habit: any): {
  currentStreak: number
  longestStreak: number
} {
  const logs = habit.habitLogs || []
  if (logs.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // Sort logs by date (newest first)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let lastDate: Date | null = null

  // Calculate the current streak (consecutive completed days)
  for (const log of sortedLogs) {
    const logDate = new Date(log.date)
    logDate.setHours(0, 0, 0, 0)

    // If this is the first log we're checking
    if (lastDate === null) {
      // Start the streak if the log is completed
      if (log.completed) {
        currentStreak = 1

        // Check if the log is for today or yesterday
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        // If the log is not for today or yesterday, the current streak is broken
        if (
          logDate.getTime() !== today.getTime() &&
          logDate.getTime() !== yesterday.getTime()
        ) {
          currentStreak = 0
        }
      }
      lastDate = logDate
      continue
    }

    // For subsequent logs, check if they are consecutive days
    const expectedPrevDate = new Date(lastDate)
    expectedPrevDate.setDate(expectedPrevDate.getDate() - 1)

    // If there's a gap or the log is not completed, current streak is broken
    if (logDate.getTime() !== expectedPrevDate.getTime() || !log.completed) {
      break
    }

    // Increment streak
    currentStreak++
    lastDate = logDate
  }

  // Calculate the longest streak
  tempStreak = 0
  lastDate = null

  for (const log of sortedLogs) {
    if (!log.completed) {
      tempStreak = 0
      lastDate = null
      continue
    }

    const logDate = new Date(log.date)
    logDate.setHours(0, 0, 0, 0)

    if (lastDate === null) {
      tempStreak = 1
      lastDate = logDate
      continue
    }

    const expectedPrevDate = new Date(lastDate)
    expectedPrevDate.setDate(expectedPrevDate.getDate() - 1)

    if (logDate.getTime() === expectedPrevDate.getTime()) {
      tempStreak++
    } else {
      // Not consecutive, start a new streak
      tempStreak = 1
    }

    longestStreak = Math.max(longestStreak, tempStreak)
    lastDate = logDate
  }

  // Update longest streak if current streak is longer
  longestStreak = Math.max(longestStreak, currentStreak)

  return { currentStreak, longestStreak }
}
