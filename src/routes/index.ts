import { Router } from 'express'

const router = Router()

import authRouter from '../routes/auth.routes'

router.use('/auth', authRouter)

export default router
