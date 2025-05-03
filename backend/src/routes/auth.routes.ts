import { Router } from 'express'
import {
  signupHandler,
  loginHanlder,
  logoutHandler,
  refreshTokenHandler,
} from '../controllers/auth.controller'

const router = Router()

// @route   POST /api/v1/auth/signup
router.post('/signup', signupHandler)

// @route   POST /api/v1/auth/login
router.post('/login', loginHanlder)

// @route   POST /api/v1/auth/logout
router.post('/logout', logoutHandler)

// @route   POST /api/v1/auth/refresh-token
router.post('/refresh-token', refreshTokenHandler)

export default router
