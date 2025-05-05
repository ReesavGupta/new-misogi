import client from '../prisma/client'
import { app } from './app'
import dotenv from 'dotenv'

dotenv.config()
const port = process.env.PORT || 8080

process.on('SIGINT', async () => {
  await client.$disconnect()
  process.exit(0)
})

app.listen(port, () => {
  console.log(`listening on port : ${port}`)
})
