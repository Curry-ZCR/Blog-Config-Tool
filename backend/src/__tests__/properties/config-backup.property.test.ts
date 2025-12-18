import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { ConfigService } from '../../services/ConfigService'
import { SettingsService } from '../../services/SettingsService'
import { settingsService } from '../../services/SettingsService'
import type { BlogConfig } from '../../../../shared/types/config'

/**
 * **Feature: blog-config-tool, Property 7: Configuration Backup Creation**
 * **Validates: Requirements 4.4**
 * 
 * For any configuration save operation, a backup file SHALL be created
 * before the original file is modified.
 */

describe('Configuration Backup Creation', () => {
  let tempDir: string
  let blogDir: string
  let configDir: string
  let backupsDir: string
  let paramsPath: string

  // Sample valid YAML config
  const createSampleYaml = (author: string = 'Test Author') => `# Sample config
author: ${author}
email: test@example.com
description: Test description
menu:
  - name: home
    url: ""
  - name: about
    url: "about"
toc: true
sidebar: left
mainSections:
  - post
`

  beforeEach(async () => {
    // Create temporary directories for testing
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'config-backup-test-'))
    blogDir = path.join(tempDir, 'blog')
    configDir = path.join(blogDir, 'config', '_default')
    backupsDir = path.join(configDir, 'backups')
    paramsPath = path.join(configDir, 'params.yml')

    // Create blog structure
    await fs.promises.mkdir(configDir, { recursive: true })
    await fs.promises.writeFile(paramsPath, createSampleYaml(), 'utf-8')
    await fs.promises.writeFile(path.join(blogDir, 'hugo.toml'), '', 'utf-8')

    // Mock the settings service to return our test blog path
    vi.spyOn(settingsService, 'getBlogPath').mockReturnValue(blogDir)
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    // Clean up temporary directory
    if (tempDir) {
      await fs.promises.rm(tempDir, { recursive: true, force: true })
    }
  })


  /**
   * **Feature: blog-config-tool, Property 7: Configuration Backup Creation**
   * **Validates: Requirements 4.4**
   */
  it('should create backup file before modifying original config', async () => {
    // Generate safe author names that won't be escaped in YAML
    const safeAuthorArbitrary = fc.stringOf(
      fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -_'.split('')),
      { minLength: 1, maxLength: 50 }
    ).filter(s => s.trim().length > 0)

    await fc.assert(
      fc.asyncProperty(safeAuthorArbitrary, async (newAuthor) => {
        const configService = new ConfigService()

        // Read original content before update
        const originalContent = await fs.promises.readFile(paramsPath, 'utf-8')

        // Perform config update
        const result = await configService.updateConfig({ author: newAuthor } as Partial<BlogConfig>)

        // Verify update succeeded
        expect(result.success).toBe(true)
        expect(result.backupPath).toBeDefined()

        // Verify backup file exists
        const backupExists = fs.existsSync(result.backupPath!)
        expect(backupExists).toBe(true)

        // Verify backup content matches original
        const backupContent = await fs.promises.readFile(result.backupPath!, 'utf-8')
        expect(backupContent).toBe(originalContent)

        // Verify original file was modified (different from backup)
        const updatedContent = await fs.promises.readFile(paramsPath, 'utf-8')
        expect(updatedContent).not.toBe(originalContent)

        // Clean up backup for next iteration
        await fs.promises.rm(backupsDir, { recursive: true, force: true })

        // Reset params.yml for next iteration
        await fs.promises.writeFile(paramsPath, createSampleYaml(), 'utf-8')

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: blog-config-tool, Property 7: Configuration Backup Creation**
   * **Validates: Requirements 4.4**
   */
  it('should create backup for each save operation regardless of config content', async () => {
    // Generate safe description values
    const safeDescriptionArbitrary = fc.stringOf(
      fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '.split('')),
      { minLength: 1, maxLength: 100 }
    ).filter(s => s.trim().length > 0)

    await fc.assert(
      fc.asyncProperty(safeDescriptionArbitrary, async (newDescription) => {
        const configService = new ConfigService()

        // Perform config update
        const result = await configService.updateConfig({ description: newDescription } as Partial<BlogConfig>)

        // Verify update succeeded and backup was created
        expect(result.success).toBe(true)
        expect(result.backupPath).toBeDefined()
        
        // Core property: backup file exists after save operation
        expect(fs.existsSync(result.backupPath!)).toBe(true)

        // Verify backup directory contains at least one backup
        const files = await fs.promises.readdir(backupsDir)
        const backupFiles = files.filter(f => f.startsWith('params.yml.backup'))
        expect(backupFiles.length).toBeGreaterThan(0)

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: blog-config-tool, Property 7: Configuration Backup Creation**
   * **Validates: Requirements 4.4**
   */
  it('should create backup directory if it does not exist', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 30 })
          .filter(s => !s.includes('\n') && !s.includes(':') && !s.includes('#')),
        async (newAuthor) => {
          const configService = new ConfigService()

          // Ensure backup directory does not exist
          if (fs.existsSync(backupsDir)) {
            await fs.promises.rm(backupsDir, { recursive: true, force: true })
          }
          expect(fs.existsSync(backupsDir)).toBe(false)

          // Perform config update
          const result = await configService.updateConfig({ author: newAuthor } as Partial<BlogConfig>)

          // Verify update succeeded
          expect(result.success).toBe(true)

          // Verify backup directory was created
          expect(fs.existsSync(backupsDir)).toBe(true)

          // Verify backup file exists in the directory
          expect(result.backupPath).toBeDefined()
          expect(fs.existsSync(result.backupPath!)).toBe(true)

          // Clean up
          await fs.promises.rm(backupsDir, { recursive: true, force: true })
          await fs.promises.writeFile(paramsPath, createSampleYaml(), 'utf-8')

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * **Feature: blog-config-tool, Property 7: Configuration Backup Creation**
   * **Validates: Requirements 4.4**
   */
  it('should preserve backup even if update contains various config fields', async () => {
    // Arbitrary for partial config updates
    const partialConfigArbitrary = fc.record({
      author: fc.option(
        fc.string({ minLength: 1, maxLength: 30 })
          .filter(s => !s.includes('\n') && !s.includes(':') && !s.includes('#')),
        { nil: undefined }
      ),
      description: fc.option(
        fc.string({ minLength: 0, maxLength: 100 })
          .filter(s => !s.includes('\n') && !s.includes(':') && !s.includes('#')),
        { nil: undefined }
      ),
      toc: fc.option(fc.boolean(), { nil: undefined }),
      sidebar: fc.option(fc.constantFrom('left', 'right') as fc.Arbitrary<'left' | 'right'>, { nil: undefined })
    }).filter(obj => Object.values(obj).some(v => v !== undefined))

    await fc.assert(
      fc.asyncProperty(partialConfigArbitrary, async (updates) => {
        const configService = new ConfigService()

        // Read original content
        const originalContent = await fs.promises.readFile(paramsPath, 'utf-8')

        // Perform config update
        const result = await configService.updateConfig(updates as Partial<BlogConfig>)

        // Verify update succeeded
        expect(result.success).toBe(true)
        expect(result.backupPath).toBeDefined()

        // Verify backup content matches original
        const backupContent = await fs.promises.readFile(result.backupPath!, 'utf-8')
        expect(backupContent).toBe(originalContent)

        // Clean up
        await fs.promises.rm(backupsDir, { recursive: true, force: true })
        await fs.promises.writeFile(paramsPath, createSampleYaml(), 'utf-8')

        return true
      }),
      { numRuns: 100 }
    )
  })
})
