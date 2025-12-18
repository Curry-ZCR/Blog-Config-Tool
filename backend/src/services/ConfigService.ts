import * as fs from 'fs'
import * as path from 'path'
import { yamlService } from './YamlService'
import { settingsService } from './SettingsService'
import type { BlogConfig } from '../../../shared/types/config'

/**
 * Result of a config save operation
 */
export interface SaveConfigResult {
  success: boolean
  backupPath?: string
  error?: string
}

/**
 * Result of a config read operation
 */
export interface ReadConfigResult {
  success: boolean
  config?: BlogConfig
  error?: string
}

/**
 * ConfigService manages reading and writing params.yml configuration
 * 
 * Requirements: 1.1, 1.2, 4.4, 7.1, 7.2, 7.3, 7.4
 */
export class ConfigService {
  /**
   * Get the path to params.yml based on the configured blog path
   */
  private getParamsPath(): string | null {
    const blogPath = settingsService.getBlogPath()
    if (!blogPath) {
      return null
    }
    return path.join(blogPath, 'config', '_default', 'params.yml')
  }

  /**
   * Get the backup directory path
   */
  private getBackupDir(): string | null {
    const blogPath = settingsService.getBlogPath()
    if (!blogPath) {
      return null
    }
    return path.join(blogPath, 'config', '_default', 'backups')
  }

  /**
   * Generate a backup filename with timestamp
   */
  private generateBackupFilename(): string {
    const now = new Date()
    const timestamp = now.toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, 19)
    return `params.yml.backup.${timestamp}`
  }

  /**
   * Create a backup of the current params.yml file
   * 
   * Requirement 4.4: Create backup before overwriting
   */
  async createBackup(): Promise<{ success: boolean; backupPath?: string; error?: string }> {
    const paramsPath = this.getParamsPath()
    const backupDir = this.getBackupDir()

    if (!paramsPath || !backupDir) {
      return { success: false, error: 'Blog path not configured' }
    }

    try {
      // Check if params.yml exists
      if (!fs.existsSync(paramsPath)) {
        return { success: false, error: 'params.yml not found' }
      }

      // Create backup directory if it doesn't exist
      if (!fs.existsSync(backupDir)) {
        await fs.promises.mkdir(backupDir, { recursive: true })
      }

      // Generate backup filename and path
      const backupFilename = this.generateBackupFilename()
      const backupPath = path.join(backupDir, backupFilename)

      // Copy the file
      await fs.promises.copyFile(paramsPath, backupPath)

      return { success: true, backupPath }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: `Failed to create backup: ${errorMessage}` }
    }
  }

  /**
   * Read and parse the params.yml configuration
   * 
   * Requirements: 1.1, 7.1, 7.4
   */
  async readConfig(): Promise<ReadConfigResult> {
    const paramsPath = this.getParamsPath()

    if (!paramsPath) {
      return { success: false, error: 'Blog path not configured' }
    }

    try {
      // Check if file exists
      if (!fs.existsSync(paramsPath)) {
        return { success: false, error: 'params.yml not found' }
      }

      // Read file content
      const content = await fs.promises.readFile(paramsPath, 'utf-8')

      // Parse YAML with comment preservation
      const config = yamlService.parse(content)

      return { success: true, config }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: `Failed to read config: ${errorMessage}` }
    }
  }

  /**
   * Update the params.yml configuration with backup
   * 
   * Requirements: 1.2, 4.4, 7.2, 7.3
   */
  async updateConfig(updates: Partial<BlogConfig>): Promise<SaveConfigResult> {
    const paramsPath = this.getParamsPath()

    if (!paramsPath) {
      return { success: false, error: 'Blog path not configured' }
    }

    try {
      // First, create a backup (Requirement 4.4)
      const backupResult = await this.createBackup()
      if (!backupResult.success) {
        return { success: false, error: backupResult.error }
      }

      // Read current config
      const readResult = await this.readConfig()
      if (!readResult.success || !readResult.config) {
        return { success: false, error: readResult.error || 'Failed to read current config' }
      }

      // Merge updates with current config
      const updatedConfig = this.mergeConfig(readResult.config, updates)

      // Serialize back to YAML (preserving comments via YamlService)
      const yamlContent = yamlService.serialize(updatedConfig)

      // Write to file
      await fs.promises.writeFile(paramsPath, yamlContent, 'utf-8')

      return { success: true, backupPath: backupResult.backupPath }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: `Failed to update config: ${errorMessage}` }
    }
  }

  /**
   * Deep merge configuration updates into existing config
   */
  private mergeConfig(current: BlogConfig, updates: Partial<BlogConfig>): BlogConfig {
    const result = { ...current }

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === undefined) {
        continue
      }

      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        // Deep merge objects
        const currentValue = result[key]
        if (typeof currentValue === 'object' && !Array.isArray(currentValue) && currentValue !== null) {
          result[key] = { ...currentValue, ...value }
        } else {
          result[key] = value
        }
      } else {
        // Direct assignment for primitives and arrays
        result[key] = value
      }
    }

    return result
  }

  /**
   * Check if the config file exists
   */
  configExists(): boolean {
    const paramsPath = this.getParamsPath()
    if (!paramsPath) {
      return false
    }
    return fs.existsSync(paramsPath)
  }
}

// Export singleton instance
export const configService = new ConfigService()
