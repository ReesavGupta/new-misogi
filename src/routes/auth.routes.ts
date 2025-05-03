import type { Request, Response } from 'express'
import asyncHandler from '../utils/asyncHanlder'

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
        user_id: user.id,
        token: refreshToken,
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
