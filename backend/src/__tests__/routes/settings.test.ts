import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { SettingsService } from '../../services/SettingsService'

describe('SettingsService', () => {
  let tempDir: string
  let settingsService: SettingsService

  beforeEach(async () => {
    // Create a temporary directory for test settings
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'settings-test-'))
    settingsService = new SettingsService(tempDir)
    await settingsService.initialize()
  })

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  describe('getBlogPath', () => {
    it('should return null when no path is set', () => {
      expect(settingsService.getBlogPath()).toBeNull()
    })
  })

  describe('setBlogPath', () => {
    it('should reject empty path', async () => {
      const result = await settingsService.setBlogPath('')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Blog path is empty')
    })

    it('should reject non-existent path', async () => {
      const result = await settingsService.setBlogPath('/non/existent/path')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should accept valid Hugo blog path', async () => {
      // Create a mock Hugo blog structure
      const mockBlogPath = path.join(tempDir, 'mock-blog')
      await fs.promises.mkdir(mockBlogPath, { recursive: true })
      await fs.promises.mkdir(path.join(mockBlogPath, 'config', '_default'), { recursive: true })
      await fs.promises.writeFile(path.join(mockBlogPath, 'hugo.toml'), '')
      await fs.promises.writeFile(path.join(mockBlogPath, 'config', '_default', 'params.yml'), '')

      const result = await settingsService.setBlogPath(mockBlogPath)
      expect(result.valid).toBe(true)
      expect(settingsService.getBlogPath()).toBe(path.resolve(mockBlogPath))
    })
  })

  describe('persistence', () => {
    it('should persist blog path across service instances', async () => {
      // Create a mock Hugo blog structure
      const mockBlogPath = path.join(tempDir, 'mock-blog')
      await fs.promises.mkdir(mockBlogPath, { recursive: true })
      await fs.promises.mkdir(path.join(mockBlogPath, 'config', '_default'), { recursive: true })
      await fs.promises.writeFile(path.join(mockBlogPath, 'hugo.toml'), '')
      await fs.promises.writeFile(path.join(mockBlogPath, 'config', '_default', 'params.yml'), '')

      // Set path in first instance
      await settingsService.setBlogPath(mockBlogPath)
      const savedPath = settingsService.getBlogPath()

      // Create new instance and verify path is loaded
      const newService = new SettingsService(tempDir)
      await newService.initialize()
      expect(newService.getBlogPath()).toBe(savedPath)
    })
  })

  describe('clearBlogPath', () => {
    it('should clear the blog path', async () => {
      // Create a mock Hugo blog structure
      const mockBlogPath = path.join(tempDir, 'mock-blog')
      await fs.promises.mkdir(mockBlogPath, { recursive: true })
      await fs.promises.mkdir(path.join(mockBlogPath, 'config', '_default'), { recursive: true })
      await fs.promises.writeFile(path.join(mockBlogPath, 'hugo.toml'), '')
      await fs.promises.writeFile(path.join(mockBlogPath, 'config', '_default', 'params.yml'), '')

      await settingsService.setBlogPath(mockBlogPath)
      expect(settingsService.getBlogPath()).not.toBeNull()

      await settingsService.clearBlogPath()
      expect(settingsService.getBlogPath()).toBeNull()
    })
  })
})
