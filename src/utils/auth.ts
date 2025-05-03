import bcrypt, { hash } from 'bcryptjs'
import jwt from 'jsonwebtoken'

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!

export const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10)
  return hashedPassword
}

export const comparePasswords = async (plain: string, hash: string) => {
  const isMatch = await bcrypt.compare(plain, hash)
  return isMatch
}

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET)
}
