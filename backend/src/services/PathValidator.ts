import * as fs from 'fs'
import * as path from 'path'

/**
 * Required files for a valid Hugo blog structure
 */
const REQUIRED_FILES = {
  hugoConfig: 'hugo.toml',
  paramsYml: 'config/_default/params.yml'
} as const

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  missingFiles: string[]
}

/**
 * PathValidator validates Hugo blog directory structure
 * 
 * Requirements: 8.2, 8.3
 */
export class PathValidator {
  /**
   * Validate that a path contains a valid Hugo blog structure
   * 
   * @param blogPath - Path to validate
   * @returns ValidationResult with validity status and any errors
   */
  async validate(blogPath: string): Promise<ValidationResult> {
    const errors: string[] = []
    const missingFiles: string[] = []

    // Check if path exists
    if (!blogPath || blogPath.trim() === '') {
      return {
        valid: false,
        errors: ['Blog path is empty'],
        missingFiles: []
      }
    }

    const normalizedPath = path.resolve(blogPath)

    try {
      const stats = await fs.promises.stat(normalizedPath)
      if (!stats.isDirectory()) {
        return {
          valid: false,
          errors: [`Path is not a directory: ${normalizedPath}`],
          missingFiles: []
        }
      }
    } catch (error) {
      return {
        valid: false,
        errors: [`Path does not exist: ${normalizedPath}`],
        missingFiles: []
      }
    }

    // Check for required files
    for (const [, relativePath] of Object.entries(REQUIRED_FILES)) {
      const fullPath = path.join(normalizedPath, relativePath)
      const exists = await this.fileExists(fullPath)
      
      if (!exists) {
        missingFiles.push(relativePath)
        errors.push(`Missing required file: ${relativePath}`)
      }
    }

    return {
      valid: missingFiles.length === 0,
      errors,
      missingFiles
    }
  }

  /**
   * Quick check if a path is a valid Hugo blog
   * 
   * @param blogPath - Path to check
   * @returns true if valid, false otherwise
   */
  async isValid(blogPath: string): Promise<boolean> {
    const result = await this.validate(blogPath)
    return result.valid
  }

  /**
   * Get detailed error message for invalid path
   * 
   * @param blogPath - Path that was validated
   * @param result - Validation result
   * @returns Human-readable error message
   */
  getErrorMessage(blogPath: string, result: ValidationResult): string {
    if (result.valid) {
      return ''
    }

    if (result.missingFiles.length > 0) {
      const fileList = result.missingFiles.join(', ')
      return `The path "${blogPath}" is not a valid Hugo blog. Missing files: ${fileList}`
    }

    return result.errors.join('. ')
  }

  /**
   * Check if a file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK)
      return true
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const pathValidator = new PathValidator()

// Export required files for testing
export { REQUIRED_FILES }
