import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import request from 'supertest'
import express from 'express'
import imagesRoutes from '../../routes/imagesRoutes'
import { settingsService, SettingsService } from '../../services/SettingsService'
import { fileService } from '../../services/FileService'

describe('Images API Routes', () => {
  let app: express.Application
  let tempDir: string
  let mockBlogPath: string
  let testSettingsService: SettingsService

  beforeEach(async () => {
    // Create a temporary directory for test
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'images-test-'))
    
    // Create mock blog structure with static directory
    mockBlogPath = path.join(tempDir, 'mock-blog')
    await fs.promises.mkdir(mockBlogPath, { recursive: true })
    await fs.promises.mkdir(path.join(mockBlogPath, 'config', '_default'), { recursive: true })
    await fs.promises.mkdir(path.join(mockBlogPath, 'static', 'images'), { recursive: true })
    await fs.promises.mkdir(path.join(mockBlogPath, 'static', 'avatar'), { recursive: true })
    await fs.promises.writeFile(path.join(mockBlogPath, 'hugo.toml'), '')
    await fs.promises.writeFile(path.join(mockBlogPath, 'config', '_default', 'params.yml'), '')
    
    // Create test settings service
    testSettingsService = new SettingsService(tempDir)
    await testSettingsService.initialize()
    
    // Set up express app with routes
    app = express()
    app.use(express.json())
    app.use('/api/images', imagesRoutes)
  })

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
    // Clear settings
    await settingsService.clearBlogPath()
  })

  describe('GET /api/images', () => {
    it('should return error when blog path is not configured', async () => {
      const response = await request(app).get('/api/images')
      
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Blog path not configured')
    })

    it('should return empty array when no images exist', async () => {
      // Set blog path
      await settingsService.setBlogPath(mockBlogPath)
      
      const response = await request(app).get('/api/images')
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.images).toEqual([])
    })

    it('should return images with correct metadata', async () => {
      // Set blog path
      await settingsService.setBlogPath(mockBlogPath)
      
      // Create a simple PNG file (1x1 pixel)
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
        0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, // width: 1
        0x00, 0x00, 0x00, 0x01, // height: 1
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, // rest of IHDR
        0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
        0x08, 0xd7, 0x63, 0xf8, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x05,
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82 // IEND
      ])
      
      await fs.promises.writeFile(
        path.join(mockBlogPath, 'static', 'images', 'test.png'),
        pngBuffer
      )
      
      const response = await request(app).get('/api/images')
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.images).toHaveLength(1)
      
      const image = response.body.images[0]
      expect(image.name).toBe('test.png')
      expect(image.folder).toBe('images')
      expect(image.path).toBe('images/test.png')
      expect(image.size).toBeGreaterThan(0)
      expect(image.dimensions).toEqual({ width: 1, height: 1 })
    })

    it('should return images organized by folder', async () => {
      // Set blog path
      await settingsService.setBlogPath(mockBlogPath)
      
      // Create test images in different folders
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde,
        0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54,
        0x08, 0xd7, 0x63, 0xf8, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x05,
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
      ])
      
      await fs.promises.writeFile(
        path.join(mockBlogPath, 'static', 'images', 'banner.png'),
        pngBuffer
      )
      await fs.promises.writeFile(
        path.join(mockBlogPath, 'static', 'avatar', 'profile.png'),
        pngBuffer
      )
      
      const response = await request(app).get('/api/images')
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.images).toHaveLength(2)
      
      // Images should be sorted by folder then name
      const folders = response.body.images.map((img: { folder: string }) => img.folder)
      expect(folders).toEqual(['avatar', 'images'])
    })
  })
})
