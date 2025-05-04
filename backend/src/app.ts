import express, { urlencoded } from 'express'
import cors from 'cors'
import cookie from 'cookie-parser'
import apiRoutes from './routes/index'

const app = express()

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://new-misogi.vercel.app'],
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookie())

app.use('/api/v1', apiRoutes)

export { app }
