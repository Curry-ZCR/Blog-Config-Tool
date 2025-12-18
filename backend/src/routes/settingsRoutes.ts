import { Router, Request, Response } from 'express'
import { settingsService } from '../services/SettingsService'
import { pathValidator } from '../services/PathValidator'
import type { SetBlogPathRequest, SetBlogPathResponse, ApiResponse, ValidatePathResponse } from '../../../shared/types/api'

const router = Router()

/**
 * GET /api/settings/blog-path
 * Get the current blog path
 * 
 * Requirements: 8.1, 8.4
 */
router.get('/blog-path', async (_req: Request, res: Response) => {
  try {
    const blogPath = settingsService.getBlogPath()
    const lastUpdated = settingsService.getLastUpdated()
    
    const response: ApiResponse<{ path: string | null; lastUpdated: string | null }> = {
      success: true,
      data: {
        path: blogPath,
        lastUpdated
      }
    }
    
    res.json(response)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const response: ApiResponse = {
      success: false,
      error: `Failed to get blog path: ${errorMessage}`
    }
    res.status(500).json(response)
  }
})

/**
 * POST /api/settings/blog-path
 * Set and validate the blog path
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
router.post('/blog-path', async (req: Request, res: Response) => {
  try {
    const { path: blogPath } = req.body as SetBlogPathRequest
    
    if (!blogPath || typeof blogPath !== 'string') {
      const response: SetBlogPathResponse = {
        success: false,
        error: 'Blog path is required'
      }
      return res.status(400).json(response)
    }

    const validation = await settingsService.setBlogPath(blogPath)
    
    if (validation.valid) {
      const response: SetBlogPathResponse = {
        success: true
      }
      return res.json(response)
    } else {
      const response: SetBlogPathResponse = {
        success: false,
        error: validation.errors.join('. ')
      }
      return res.status(400).json(response)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const response: SetBlogPathResponse = {
      success: false,
      error: `Failed to set blog path: ${errorMessage}`
    }
    return res.status(500).json(response)
  }
})

/**
 * POST /api/settings/validate-path
 * Validate a blog path without saving it
 * 
 * Requirements: 8.2, 8.3
 */
router.post('/validate-path', async (req: Request, res: Response) => {
  try {
    const { blogPath } = req.body as { blogPath: string }
    
    if (!blogPath || typeof blogPath !== 'string') {
      const response: ValidatePathResponse = {
        valid: false,
        errors: ['Blog path is required']
      }
      return res.status(400).json(response)
    }

    const validation = await pathValidator.validate(blogPath)
    
    const response: ValidatePathResponse = {
      valid: validation.valid,
      errors: validation.errors,
      missingFiles: validation.missingFiles
    }
    
    return res.json(response)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const response: ValidatePathResponse = {
      valid: false,
      errors: [`Failed to validate path: ${errorMessage}`]
    }
    return res.status(500).json(response)
  }
})

/**
 * DELETE /api/settings/blog-path
 * Clear the blog path
 */
router.delete('/blog-path', async (_req: Request, res: Response) => {
  try {
    await settingsService.clearBlogPath()
    
    const response: ApiResponse = {
      success: true
    }
    res.json(response)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const response: ApiResponse = {
      success: false,
      error: `Failed to clear blog path: ${errorMessage}`
    }
    res.status(500).json(response)
  }
})

export default router
