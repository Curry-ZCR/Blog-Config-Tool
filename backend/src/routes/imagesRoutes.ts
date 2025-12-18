import { Router, Request, Response } from 'express'
import { fileService } from '../services/FileService'
import { settingsService } from '../services/SettingsService'
import type { GetImagesResponse, ImageInfo } from '../../../shared/types/api'

const router = Router()

/**
 * GET /api/images
 * List all images in the static directory with metadata
 * Returns images organized by folder structure
 * 
 * Requirements: 1.3, 3.1, 3.2, 3.4
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const blogPath = settingsService.getBlogPath()
    
    if (!blogPath) {
      const response: GetImagesResponse = {
        success: false,
        images: [],
        error: 'Blog path not configured. Please set the blog path first.'
      }
      return res.status(400).json(response)
    }

    // Set the blog path in file service
    fileService.setBlogPath(blogPath)
    
    // Get all images from static directory
    const images: ImageInfo[] = await fileService.listImages()
    
    // Sort images by folder then by name for consistent ordering
    images.sort((a, b) => {
      if (a.folder !== b.folder) {
        return a.folder.localeCompare(b.folder)
      }
      return a.name.localeCompare(b.name)
    })

    const response: GetImagesResponse = {
      success: true,
      images
    }
    
    return res.json(response)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const response: GetImagesResponse = {
      success: false,
      images: [],
      error: `Failed to list images: ${errorMessage}`
    }
    return res.status(500).json(response)
  }
})

export default router
