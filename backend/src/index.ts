import express from 'express'
import cors from 'cors'
import { settingsRoutes, configRoutes, imagesRoutes, postsRoutes } from './routes'
import { settingsService } from './services/SettingsService'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Settings routes
app.use('/api/settings', settingsRoutes)

// Config routes
app.use('/api/config', configRoutes)

// Images routes
app.use('/api/images', imagesRoutes)

// Posts routes
app.use('/api/posts', postsRoutes)

// Initialize services and start server
async function startServer() {
  try {
    // Initialize settings service to load persisted settings
    await settingsService.initialize()
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer()
}

export default app
export { startServer }
