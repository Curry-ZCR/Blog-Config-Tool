import { Router, Request, Response } from 'express'
import { postService } from '../services/PostService'
import type { 
  CreatePostRequest, 
  CreatePostResponse, 
  GetPostsResponse 
} from '../../../shared/types/post'

const router = Router()

/**
 * GET /api/posts
 * List all existing posts
 * 
 * Requirements: 2.1
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await postService.listPosts()

    if (result.success) {
      const response: GetPostsResponse = {
        success: true,
        posts: result.posts
      }
      return res.json(response)
    } else {
      const response: GetPostsResponse = {
        success: false,
        posts: [],
        error: result.error || 'Failed to list posts'
      }
      return res.status(400).json(response)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const response: GetPostsResponse = {
      success: false,
      posts: [],
      error: `Failed to list posts: ${errorMessage}`
    }
    return res.status(500).json(response)
  }
})


/**
 * POST /api/posts
 * Create a new post with Front-matter
 * 
 * Requirements: 2.1, 2.2, 2.4
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const postData = req.body as CreatePostRequest

    // Validate required fields
    if (!postData.title || typeof postData.title !== 'string' || !postData.title.trim()) {
      const response: CreatePostResponse = {
        success: false,
        error: 'Title is required'
      }
      return res.status(400).json(response)
    }

    if (!postData.date || typeof postData.date !== 'string') {
      const response: CreatePostResponse = {
        success: false,
        error: 'Date is required'
      }
      return res.status(400).json(response)
    }

    // Validate date format (ISO 8601)
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)?)?$/
    if (!dateRegex.test(postData.date)) {
      const response: CreatePostResponse = {
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD or ISO 8601 format'
      }
      return res.status(400).json(response)
    }

    const result = await postService.createPost(postData)

    if (result.success) {
      const response: CreatePostResponse = {
        success: true,
        filePath: result.filePath
      }
      return res.status(201).json(response)
    } else {
      const response: CreatePostResponse = {
        success: false,
        error: result.error || 'Failed to create post'
      }
      return res.status(result.error?.includes('already exists') ? 409 : 400).json(response)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const response: CreatePostResponse = {
      success: false,
      error: `Failed to create post: ${errorMessage}`
    }
    return res.status(500).json(response)
  }
})

export default router
