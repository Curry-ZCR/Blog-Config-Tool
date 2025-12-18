import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { PathValidator, REQUIRED_FILES } from '../../services/PathValidator'

/**
 * **Feature: blog-config-tool, Property 9: Blog Path Validation Accuracy**
 * **Validates: Requirements 8.2, 8.3**
 * 
 * For any file system path, the validation SHALL return valid=true only if the path
 * contains both hugo.toml and config/_default/params.yml files.
 */

describe('Blog Path Validation Accuracy', () => {
  let pathValidator: PathValidator
  let tempDir: string

  beforeEach(async () => {
    pathValidator = new PathValidator()
    // Create a temporary directory for testing
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'blog-path-test-'))
  })

  afterEach(async () => {
    // Clean up temporary directory
    if (tempDir) {
      await fs.promises.rm(tempDir, { recursive: true, force: true })
    }
  })

  /**
   * **Feature: blog-config-tool, Property 9: Blog Path Validation Accuracy**
   * **Validates: Requirements 8.2, 8.3**
   */
  it('should return valid=true only when all required files exist', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a subset of required files to create
        fc.subarray(Object.values(REQUIRED_FILES), { minLength: 0 }),
        async (filesToCreate) => {
          // Clean the temp directory
          const entries = await fs.promises.readdir(tempDir)
          for (const entry of entries) {
            await fs.promises.rm(path.join(tempDir, entry), { recursive: true, force: true })
          }

          // Create the specified files
          for (const relativePath of filesToCreate) {
            const fullPath = path.join(tempDir, relativePath)
            const dir = path.dirname(fullPath)
            await fs.promises.mkdir(dir, { recursive: true })
            await fs.promises.writeFile(fullPath, '# Test file\n')
          }

          // Validate the path
          const result = await pathValidator.validate(tempDir)

          // The path should be valid only if ALL required files were created
          const allFilesCreated = Object.values(REQUIRED_FILES).every(
            file => filesToCreate.includes(file)
          )

          expect(result.valid).toBe(allFilesCreated)

          // If not valid, should report missing files
          if (!allFilesCreated) {
            const missingFiles = Object.values(REQUIRED_FILES).filter(
              file => !filesToCreate.includes(file)
            )
            expect(result.missingFiles.length).toBe(missingFiles.length)
            for (const missing of missingFiles) {
              expect(result.missingFiles).toContain(missing)
            }
          }

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should return valid=false for non-existent paths', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringOf(
          fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')),
          { minLength: 10, maxLength: 30 }
        ),
        async (randomName) => {
          const nonExistentPath = path.join(os.tmpdir(), `non-existent-${randomName}`)
          
          // Ensure it doesn't exist
          try {
            await fs.promises.rm(nonExistentPath, { recursive: true, force: true })
          } catch {
            // Ignore if doesn't exist
          }

          const result = await pathValidator.validate(nonExistentPath)
          
          expect(result.valid).toBe(false)
          expect(result.errors.length).toBeGreaterThan(0)
          expect(result.errors[0]).toContain('does not exist')
          
          return true
        }
      ),
      { numRuns: 20 }
    )
  })

  it('should return valid=false for empty paths', async () => {
    const emptyPaths = ['', '   ', '\t', '\n']
    
    for (const emptyPath of emptyPaths) {
      const result = await pathValidator.validate(emptyPath)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Blog path is empty')
    }
  })

  it('should return valid=false when path is a file, not a directory', async () => {
    const filePath = path.join(tempDir, 'not-a-directory.txt')
    await fs.promises.writeFile(filePath, 'test content')

    const result = await pathValidator.validate(filePath)
    
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('not a directory')
  })

  it('should provide detailed error messages for missing files', async () => {
    // Create only hugo.toml, missing params.yml
    await fs.promises.writeFile(
      path.join(tempDir, REQUIRED_FILES.hugoConfig),
      '# Hugo config\n'
    )

    const result = await pathValidator.validate(tempDir)

    expect(result.valid).toBe(false)
    expect(result.missingFiles).toContain(REQUIRED_FILES.paramsYml)
    expect(result.errors.some(e => e.includes(REQUIRED_FILES.paramsYml))).toBe(true)
  })

  it('should validate a complete Hugo blog structure', async () => {
    // Create all required files
    for (const relativePath of Object.values(REQUIRED_FILES)) {
      const fullPath = path.join(tempDir, relativePath)
      const dir = path.dirname(fullPath)
      await fs.promises.mkdir(dir, { recursive: true })
      await fs.promises.writeFile(fullPath, '# Test file\n')
    }

    const result = await pathValidator.validate(tempDir)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.missingFiles).toHaveLength(0)
  })

  it('should use isValid as a shorthand for validation', async () => {
    // Create all required files
    for (const relativePath of Object.values(REQUIRED_FILES)) {
      const fullPath = path.join(tempDir, relativePath)
      const dir = path.dirname(fullPath)
      await fs.promises.mkdir(dir, { recursive: true })
      await fs.promises.writeFile(fullPath, '# Test file\n')
    }

    const isValid = await pathValidator.isValid(tempDir)
    expect(isValid).toBe(true)

    // Remove one file
    await fs.promises.rm(path.join(tempDir, REQUIRED_FILES.hugoConfig))
    
    const isValidAfterRemoval = await pathValidator.isValid(tempDir)
    expect(isValidAfterRemoval).toBe(false)
  })

  it('should generate helpful error messages', async () => {
    const result = await pathValidator.validate(tempDir)
    const errorMessage = pathValidator.getErrorMessage(tempDir, result)

    expect(errorMessage).toContain('not a valid Hugo blog')
    expect(errorMessage).toContain('Missing files')
    expect(errorMessage).toContain(REQUIRED_FILES.hugoConfig)
    expect(errorMessage).toContain(REQUIRED_FILES.paramsYml)
  })
})
