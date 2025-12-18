import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import configRoutes from '../../routes/configRoutes'
import { settingsService } from '../../services/SettingsService'
import { yamlService } from '../../services/YamlService'

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create test app
const app = express()
app.use(express.json())
app.use('/api/config', configRoutes)

describe('Config Routes', () => {
  const testDir = path.join(__dirname, 'test-blog-config')
  const configDir = path.join(testDir, 'config', '_default')
  const paramsPath = path.join(configDir, 'params.yml')
  const backupsDir = path.join(configDir, 'backups')

  const sampleYaml = `# Sample config
author: Test Author
email: test@example.com
description: Test description
menu:
  - name: home
    url: ""
  - name: about
    url: "about"
toc: true
sidebar: left
`

  beforeEach(async () => {
    // Create test directory structure
    await fs.promises.mkdir(configDir, { recursive: true })
    await fs.promises.writeFile(paramsPath, sampleYaml, 'utf-8')
    
    // Create hugo.toml for path validation
    await fs.promises.writeFile(path.join(testDir, 'hugo.toml'), '', 'utf-8')

    // Set the blog path
    vi.spyOn(settingsService, 'getBlogPath').mockReturnValue(testDir)
    
    // Reset yaml service state
    yamlService.reset()
  })

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.promises.rm(testDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
    vi.restoreAllMocks()
  })

  describe('GET /api/config', () => {
    it('should return the current configuration', async () => {
      const response = await request(app)
        .get('/api/config')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(response.body.data.author).toBe('Test Author')
      expect(response.body.data.email).toBe('test@example.com')
      expect(response.body.data.toc).toBe(true)
    })

    it('should return error when blog path is not configured', async () => {
      vi.spyOn(settingsService, 'getBlogPath').mockReturnValue(null)

      const response = await request(app)
        .get('/api/config')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Blog path not configured')
    })

    it('should return error when params.yml does not exist', async () => {
      await fs.promises.unlink(paramsPath)

      const response = await request(app)
        .get('/api/config')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('params.yml not found')
    })
  })

  describe('PUT /api/config', () => {
    it('should update configuration and create backup', async () => {
      const updates = {
        config: {
          author: 'Updated Author',
          description: 'Updated description'
        }
      }

      const response = await request(app)
        .put('/api/config')
        .send(updates)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.backupPath).toBeDefined()
      expect(response.body.backupPath).toContain('params.yml.backup')

      // Verify backup was created
      const backupFiles = await fs.promises.readdir(backupsDir)
      expect(backupFiles.length).toBeGreaterThan(0)

      // Verify config was updated
      const updatedContent = await fs.promises.readFile(paramsPath, 'utf-8')
      expect(updatedContent).toContain('Updated Author')
    })

    it('should return error when config object is missing', async () => {
      const response = await request(app)
        .put('/api/config')
        .send({})
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Configuration object is required')
    })

    it('should return error when blog path is not configured', async () => {
      vi.spyOn(settingsService, 'getBlogPath').mockReturnValue(null)

      const response = await request(app)
        .put('/api/config')
        .send({ config: { author: 'Test' } })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Blog path not configured')
    })

    it('should preserve existing values when updating partial config', async () => {
      const updates = {
        config: {
          author: 'New Author'
        }
      }

      await request(app)
        .put('/api/config')
        .send(updates)
        .expect(200)

      // Read the updated config
      yamlService.reset()
      const response = await request(app)
        .get('/api/config')
        .expect(200)

      // Original values should be preserved
      expect(response.body.data.email).toBe('test@example.com')
      expect(response.body.data.toc).toBe(true)
      // Updated value should be changed
      expect(response.body.data.author).toBe('New Author')
    })
  })
})
