const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')
const confessionsRouter = require('./routes/confessions')

dotenv.config()

const app = express()
const port = process.env.PORT || 5000
const isProduction = process.env.NODE_ENV === 'production'
const clientOrigin = process.env.CLIENT_ORIGIN || (!isProduction ? 'http://localhost:5173' : '')

if (isProduction && !process.env.CLIENT_ORIGIN) {
  throw new Error('CLIENT_ORIGIN must be set in production.')
}

app.use(
  cors({
    origin: clientOrigin,
  }),
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/confessions', confessionsRouter)

app.use((err, _req, res, _next) => {
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid confession id.' })
  }

  console.error(err)
  return res.status(500).json({ message: 'Something went wrong.' })
})

const startServer = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI in environment variables.')
  }

  await mongoose.connect(process.env.MONGODB_URI)
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start server:', error.message)
  process.exit(1)
})
