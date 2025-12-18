import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { pathValidator } from './PathValidator'
import type { ValidationResult } from './PathValidator'

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Settings data structure stored in JSON file
 */
export interface SettingsData {
  blogPath: string | null
  lastUpdated: string | null
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS: SettingsData = {
  blogPath: null,
  lastUpdated: null
}

/**
 * SettingsService manages application settings persistence
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
export class SettingsService {
  private settingsPath: string
  private settings: SettingsData

  constructor(settingsDir?: string) {
    // Default to storing settings in the backend directory
    const baseDir = settingsDir || path.join(__dirname, '..', '..')
    this.settingsPath = path.join(baseDir, 'settings.json')
    this.settings = { ...DEFAULT_SETTINGS }
  }

  /**
   * Initialize the service by loading settings from disk
   */
  async initialize(): Promise<void> {
    await this.loadSettings()
  }

  /**
   * Load settings from the JSON file
   */
  private async loadSettings(): Promise<void> {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const content = await fs.promises.readFile(this.settingsPath, 'utf-8')
        const parsed = JSON.parse(content)
        this.settings = {
          ...DEFAULT_SETTINGS,
          ...parsed
        }
      }
    } catch (error) {
      // If file doesn't exist or is invalid, use defaults
      this.settings = { ...DEFAULT_SETTINGS }
    }
  }

  /**
   * Save settings to the JSON file
   */
  private async saveSettings(): Promise<void> {
    const dir = path.dirname(this.settingsPath)
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true })
    }
    await fs.promises.writeFile(
      this.settingsPath,
      JSON.stringify(this.settings, null, 2),
      'utf-8'
    )
  }

  /**
   * Get the current blog path
   */
  getBlogPath(): string | null {
    return this.settings.blogPath
  }

  /**
   * Set and validate the blog path
   * 
   * @param blogPath - Path to set
   * @returns Validation result
   */
  async setBlogPath(blogPath: string): Promise<ValidationResult> {
    // Validate the path first
    const validation = await pathValidator.validate(blogPath)
    
    if (validation.valid) {
      // Normalize the path before storing
      this.settings.blogPath = path.resolve(blogPath)
      this.settings.lastUpdated = new Date().toISOString()
      await this.saveSettings()
    }
    
    return validation
  }

  /**
   * Clear the blog path
   */
  async clearBlogPath(): Promise<void> {
    this.settings.blogPath = null
    this.settings.lastUpdated = new Date().toISOString()
    await this.saveSettings()
  }

  /**
   * Check if a blog path is currently set
   */
  hasBlogPath(): boolean {
    return this.settings.blogPath !== null
  }

  /**
   * Get the last updated timestamp
   */
  getLastUpdated(): string | null {
    return this.settings.lastUpdated
  }

  /**
   * Get the settings file path (for testing)
   */
  getSettingsFilePath(): string {
    return this.settingsPath
  }
}

// Export singleton instance
export const settingsService = new SettingsService()
