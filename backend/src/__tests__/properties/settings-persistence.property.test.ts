import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { SettingsService } from '../../services/SettingsService'
import { REQUIRED_FILES } from '../../services/PathValidator'

/**
 * **Feature: blog-config-tool, Property 12: Path Persistence**
 * **Validates: Requirements 8.4**
 * 
 * For any valid Blog_Root_Path that is saved, subsequent application loads
 * SHALL retrieve the same path from storage.
 */

describe('Path Persistence', () => {
  let tempDir: string
  let settingsDir: string

  beforeEach(async () => {
    // Create temporary directories for testing
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'path-persistence-test-'))
    settingsDir = path.join(tempDir, 'settings')
    await fs.promises.mkdir(settingsDir, { recursive: true })
  })

  afterEach(async () => {
    // Clean up temporary directory
    if (tempDir) {
      await fs.promises.rm(tempDir, { recursive: true, force: true })
    }
  })

  /**
   * Helper function to create a valid Hugo blog structure
   */
  async function createValidHugoBlog(blogPath: string): Promise<void> {
    await fs.promises.mkdir(blogPath, { recursive: true })
    
    for (const relativePath of Object.values(REQUIRED_FILES)) {
      const fullPath = path.join(blogPath, relativePath)
      const dir = path.dirname(fullPath)
      await fs.promises.mkdir(dir, { recursive: true })
      await fs.promises.writeFile(fullPath, '# Test file\n')
    }
  }

  /**
   * **Feature: blog-config-tool, Property 12: Path Persistence**
   * **Validates: Requirements 8.4**
   */
  it('should persist valid blog paths across service instances', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid directory names (alphanumeric with hyphens)
        fc.stringOf(
          fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
          { minLength: 3, maxLength: 20 }
        ).filter(s => !s.startsWith('-') && !s.endsWith('-') && !s.includes('--')),
        async (blogDirName) => {
          // Create a valid Hugo blog structure
          const blogPath = path.join(tempDir, 'blogs', blogDirName)
          await createValidHugoBlog(blogPath)

          // Create first service instance and set the path
          const service1 = new SettingsService(settingsDir)
          await service1.initialize()
          
          const result = await service1.setBlogPath(blogPath)
          expect(result.valid).toBe(true)
          
          const savedPath = service1.getBlogPath()
          expect(savedPath).not.toBeNull()

          // Create a new service instance (simulating app restart)
          const service2 = new SettingsService(settingsDir)
          await service2.initialize()

          // The path should be retrieved from storage
          const retrievedPath = service2.getBlogPath()
          expect(retrievedPath).toBe(savedPath)

          // Clean up the blog directory for next iteration
          await fs.promises.rm(blogPath, { recursive: true, force: true })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: blog-config-tool, Property 12: Path Persistence**
   * **Validates: Requirements 8.4**
   */
  it('should persist paths with various valid characters', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate path segments with valid filesystem characters
        fc.array(
          fc.stringOf(
            fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-'.split('')),
            { minLength: 1, maxLength: 15 }
          ),
          { minLength: 1, maxLength: 3 }
        ),
        async (pathSegments) => {
          // Create a valid Hugo blog structure with nested path
          const blogPath = path.join(tempDir, 'nested', ...pathSegments)
          await createValidHugoBlog(blogPath)

          // Set and persist the path
          const service1 = new SettingsService(settingsDir)
          await service1.initialize()
          
          const result = await service1.setBlogPath(blogPath)
          expect(result.valid).toBe(true)

          const savedPath = service1.getBlogPath()

          // Verify persistence in new instance
          const service2 = new SettingsService(settingsDir)
          await service2.initialize()

          expect(service2.getBlogPath()).toBe(savedPath)

          // Clean up
          await fs.promises.rm(path.join(tempDir, 'nested'), { recursive: true, force: true })

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * **Feature: blog-config-tool, Property 12: Path Persistence**
   * **Validates: Requirements 8.4**
   */
  it('should persist the most recent path when multiple paths are set', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate multiple unique directory names
        fc.array(
          fc.stringOf(
            fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')),
            { minLength: 5, maxLength: 15 }
          ),
          { minLength: 2, maxLength: 5 }
        ).map(arr => [...new Set(arr)]).filter(arr => arr.length >= 2),
        async (blogDirNames) => {
          // Create valid Hugo blogs for each name
          const blogPaths: string[] = []
          for (const name of blogDirNames) {
            const blogPath = path.join(tempDir, 'multi', name)
            await createValidHugoBlog(blogPath)
            blogPaths.push(blogPath)
          }

          // Set each path in sequence
          const service1 = new SettingsService(settingsDir)
          await service1.initialize()

          for (const blogPath of blogPaths) {
            const result = await service1.setBlogPath(blogPath)
            expect(result.valid).toBe(true)
          }

          // The last path should be the one that's saved
          const lastPath = service1.getBlogPath()
          expect(lastPath).toBe(path.resolve(blogPaths[blogPaths.length - 1]))

          // Verify in new instance
          const service2 = new SettingsService(settingsDir)
          await service2.initialize()

          expect(service2.getBlogPath()).toBe(lastPath)

          // Clean up
          await fs.promises.rm(path.join(tempDir, 'multi'), { recursive: true, force: true })

          return true
        }
      ),
      { numRuns: 30 }
    )
  })

  /**
   * Additional test: Verify that cleared paths persist as null
   */
  it('should persist cleared path state across instances', async () => {
    // Create a valid Hugo blog
    const blogPath = path.join(tempDir, 'clear-test-blog')
    await createValidHugoBlog(blogPath)

    // Set the path
    const service1 = new SettingsService(settingsDir)
    await service1.initialize()
    await service1.setBlogPath(blogPath)
    expect(service1.getBlogPath()).not.toBeNull()

    // Clear the path
    await service1.clearBlogPath()
    expect(service1.getBlogPath()).toBeNull()

    // Verify in new instance
    const service2 = new SettingsService(settingsDir)
    await service2.initialize()
    expect(service2.getBlogPath()).toBeNull()
  })

  /**
   * Additional test: Verify lastUpdated timestamp is persisted
   */
  it('should persist lastUpdated timestamp across instances', async () => {
    // Create a valid Hugo blog
    const blogPath = path.join(tempDir, 'timestamp-test-blog')
    await createValidHugoBlog(blogPath)

    // Set the path
    const service1 = new SettingsService(settingsDir)
    await service1.initialize()
    await service1.setBlogPath(blogPath)
    
    const lastUpdated = service1.getLastUpdated()
    expect(lastUpdated).not.toBeNull()

    // Verify in new instance
    const service2 = new SettingsService(settingsDir)
    await service2.initialize()
    expect(service2.getLastUpdated()).toBe(lastUpdated)
  })
})
