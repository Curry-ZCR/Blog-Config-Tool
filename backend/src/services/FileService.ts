import * as fs from 'fs'
import * as path from 'path'
import type { ImageInfo } from '../../../shared/types/api'

/**
 * Supported image file extensions
 */
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.bmp']

/**
 * FileService provides file system operations for the blog config tool
 * 
 * Requirements: 3.1, 3.2, 3.4
 */
export class FileService {
  private blogPath: string | null = null

  /**
   * Set the blog root path
   */
  setBlogPath(blogPath: string): void {
    this.blogPath = blogPath
  }

  /**
   * Get the current blog path
   */
  getBlogPath(): string | null {
    return this.blogPath
  }

  /**
   * Get the static directory path
   */
  getStaticPath(): string {
    if (!this.blogPath) {
      throw new Error('Blog path not set')
    }
    return path.join(this.blogPath, 'static')
  }

  /**
   * Check if a file is an image based on its extension
   */
  isImageFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase()
    return IMAGE_EXTENSIONS.includes(ext)
  }

  /**
   * List all images in the static directory recursively
   * 
   * @param subPath - Optional subdirectory within static to scan
   * @returns Array of ImageInfo objects
   */
  async listImages(subPath: string = ''): Promise<ImageInfo[]> {
    const staticPath = this.getStaticPath()
    const targetPath = subPath ? path.join(staticPath, subPath) : staticPath
    
    if (!fs.existsSync(targetPath)) {
      return []
    }

    const images: ImageInfo[] = []
    await this.scanDirectory(targetPath, staticPath, images)
    return images
  }

  /**
   * Recursively scan a directory for image files
   */
  private async scanDirectory(
    currentPath: string,
    basePath: string,
    images: ImageInfo[]
  ): Promise<void> {
    const entries = await fs.promises.readdir(currentPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name)
      
      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue
        }
        await this.scanDirectory(fullPath, basePath, images)
      } else if (entry.isFile() && this.isImageFile(entry.name)) {
        const relativePath = path.relative(basePath, fullPath).replace(/\\/g, '/')
        const folder = path.dirname(relativePath)
        
        const stats = await fs.promises.stat(fullPath)
        
        const imageInfo: ImageInfo = {
          path: relativePath,
          name: entry.name,
          folder: folder === '.' ? '' : folder,
          size: stats.size
        }

        // Try to get image dimensions for common formats
        const dimensions = await this.getImageDimensions(fullPath)
        if (dimensions) {
          imageInfo.dimensions = dimensions
        }

        images.push(imageInfo)
      }
    }
  }

  /**
   * Get image dimensions from file
   * Returns null if dimensions cannot be determined
   */
  private async getImageDimensions(
    filePath: string
  ): Promise<{ width: number; height: number } | null> {
    try {
      const ext = path.extname(filePath).toLowerCase()
      const buffer = await fs.promises.readFile(filePath)

      // PNG: dimensions at bytes 16-24
      if (ext === '.png') {
        if (buffer.length >= 24 && buffer.toString('hex', 0, 8) === '89504e470d0a1a0a') {
          const width = buffer.readUInt32BE(16)
          const height = buffer.readUInt32BE(20)
          return { width, height }
        }
      }

      // JPEG: search for SOF0 marker
      if (ext === '.jpg' || ext === '.jpeg') {
        let offset = 2
        while (offset < buffer.length) {
          if (buffer[offset] !== 0xff) break
          const marker = buffer[offset + 1]
          
          // SOF0, SOF1, SOF2 markers contain dimensions
          if (marker >= 0xc0 && marker <= 0xc2) {
            const height = buffer.readUInt16BE(offset + 5)
            const width = buffer.readUInt16BE(offset + 7)
            return { width, height }
          }
          
          // Skip to next marker
          const length = buffer.readUInt16BE(offset + 2)
          offset += 2 + length
        }
      }

      // GIF: dimensions at bytes 6-10
      if (ext === '.gif') {
        if (buffer.length >= 10 && buffer.toString('ascii', 0, 3) === 'GIF') {
          const width = buffer.readUInt16LE(6)
          const height = buffer.readUInt16LE(8)
          return { width, height }
        }
      }

      // WebP: dimensions in VP8 chunk
      if (ext === '.webp') {
        if (buffer.length >= 30 && buffer.toString('ascii', 0, 4) === 'RIFF') {
          // Simple WebP (VP8)
          if (buffer.toString('ascii', 12, 16) === 'VP8 ') {
            const width = buffer.readUInt16LE(26) & 0x3fff
            const height = buffer.readUInt16LE(28) & 0x3fff
            return { width, height }
          }
          // Lossless WebP (VP8L)
          if (buffer.toString('ascii', 12, 16) === 'VP8L') {
            const bits = buffer.readUInt32LE(21)
            const width = (bits & 0x3fff) + 1
            const height = ((bits >> 14) & 0x3fff) + 1
            return { width, height }
          }
          // Extended WebP (VP8X)
          if (buffer.toString('ascii', 12, 16) === 'VP8X') {
            const width = (buffer.readUIntLE(24, 3) & 0xffffff) + 1
            const height = (buffer.readUIntLE(27, 3) & 0xffffff) + 1
            return { width, height }
          }
        }
      }

      return null
    } catch {
      return null
    }
  }

  /**
   * Check if a path exists
   */
  async pathExists(targetPath: string): Promise<boolean> {
    try {
      await fs.promises.access(targetPath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Read file contents
   */
  async readFile(filePath: string): Promise<string> {
    return fs.promises.readFile(filePath, 'utf-8')
  }

  /**
   * Write file contents
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    await fs.promises.writeFile(filePath, content, 'utf-8')
  }

  /**
   * Create a backup of a file
   */
  async createBackup(filePath: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const ext = path.extname(filePath)
    const baseName = path.basename(filePath, ext)
    const dir = path.dirname(filePath)
    const backupPath = path.join(dir, `${baseName}.backup.${timestamp}${ext}`)
    
    await fs.promises.copyFile(filePath, backupPath)
    return backupPath
  }

  /**
   * List directories in a path
   */
  async listDirectories(targetPath: string): Promise<string[]> {
    if (!await this.pathExists(targetPath)) {
      return []
    }

    const entries = await fs.promises.readdir(targetPath, { withFileTypes: true })
    return entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name)
  }
}

// Export singleton instance
export const fileService = new FileService()

// Export image extensions for testing
export { IMAGE_EXTENSIONS }
