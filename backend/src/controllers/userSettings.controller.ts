import type { Request, Response } from 'express'
import asyncHandler from '../utils/asyncHanlder'
import { ApiError } from '../utils/ApiError'
import { ApiResponse } from '../utils/ApiResponse'
import prisma from '../../prisma/client'

/**
 * Get user settings
 */
export const getUserSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id

    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    })

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          theme: 'light',
          reminderTime: null,
        },
      })
    }

    res.json(ApiResponse.success(settings))
  }
)

/**
 * Update user settings
 */
export const updateUserSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id
    const { theme, reminderTime } = req.body

    // Validate theme if provided
    if (theme && !['light', 'dark', 'system'].includes(theme)) {
      throw new ApiError(400, 'Invalid theme value')
    }

    // Validate reminderTime format if provided
    if (reminderTime) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
      if (!timeRegex.test(reminderTime)) {
        throw new ApiError(
          400,
          'Invalid reminder time format. Use HH:MM in 24-hour format'
        )
      }
    }

    // Check if settings exist
    const existingSettings = await prisma.userSettings.findUnique({
      where: { userId },
    })

    let settings

    if (existingSettings) {
      // Update existing settings
      settings = await prisma.userSettings.update({
        where: { userId },
        data: {
          theme: theme !== undefined ? theme : undefined,
          reminderTime: reminderTime !== undefined ? reminderTime : undefined,
        },
      })
    } else {
      // Create new settings
      settings = await prisma.userSettings.create({
        data: {
          userId,
          theme: theme || 'light',
          reminderTime: reminderTime || null,
        },
      })
    }

    res.json(ApiResponse.success(settings))
  }
)
