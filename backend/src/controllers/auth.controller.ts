import type { Request, Response } from 'express'
import asyncHandler from '../utils/asyncHanlder'
import { ApiError } from '../utils/ApiError'
import {
  comparePasswords,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  verifyRefreshToken,
} from '../utils/auth'
import prisma from '../../prisma/client'
import { ApiResponse } from '../utils/ApiResponse'

export const signupHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      throw new ApiError(400, 'Email, name and password are required')
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) throw new ApiError(400, 'Email already exists')

    const password_hash = await hashPassword(password)

    const user = await prisma.user.create({
      data: { email, name, password_hash },
    })

    const payload = { userId: user.id }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(201)
      .json(
        ApiResponse.success({
          accessToken,
          user: { id: user.id, name: user.name, email: user.email },
        })
      )
  }
)

export const loginHanlder = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required')
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) throw new ApiError(401, 'Invalid credentials')

    const isMatch = await comparePasswords(password, user.password_hash)
    if (!isMatch) throw new ApiError(401, 'Invalid credentials')

    const payload = { userId: user.id }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(
        ApiResponse.success({
          accessToken,
          user: { id: user.id, name: user.name, email: user.email },
        })
      )
  }
)
export const logoutHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken

    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
      })
    }

    res
      .clearCookie('refreshToken')
      .json(ApiResponse.success({ message: 'Logged out successfully' }))
  }
)

export const refreshTokenHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken

    if (!token) throw new ApiError(401, 'Refresh token missing')

    let payload: any
    try {
      payload = verifyRefreshToken(token)
    } catch (err) {
      throw new ApiError(403, 'Invalid refresh token')
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    })

    if (
      !storedToken ||
      storedToken.revoked ||
      storedToken.expiresAt < new Date()
    ) {
      throw new ApiError(403, 'Refresh token is invalid or expired')
    }

    const newAccessToken = generateAccessToken({ userId: payload.userId })
    const newRefreshToken = generateRefreshToken({ userId: payload.userId })

    await prisma.refreshToken.update({
      where: { token },
      data: {
        revoked: true,
      },
    })

    await prisma.refreshToken.create({
      data: {
        userId: payload.userId,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    res
      .cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(ApiResponse.success({ accessToken: newAccessToken }))
  }
)
