import axios, { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiResponse,
  GetConfigResponse,
  UpdateConfigRequest,
  UpdateConfigResponse,
  GetImagesResponse,
  SetBlogPathRequest,
  SetBlogPathResponse,
  ValidatePathResponse,
  BlogConfig,
  CreatePostRequest,
  CreatePostResponse,
  GetPostsResponse,
} from '../../../shared/types'

// API base URL - configurable via environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Error handler to extract meaningful error messages
function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response?.data?.error) {
      return error.response.data.error
    }
    if (error.response?.status === 404) {
      return 'Resource not found'
    }
    if (error.response?.status === 500) {
      return 'Server error occurred'
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      return 'Unable to connect to server'
    }
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unknown error occurred'
}

// ============================================
// Settings API
// ============================================

/**
 * Get the current blog path
 */
export async function getBlogPath(): Promise<ApiResponse<string>> {
  try {
    const response = await apiClient.get<{ success: boolean; path: string }>('/settings/blog-path')
    return {
      success: true,
      data: response.data.path,
    }
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error),
    }
  }
}

/**
 * Set the blog path
 */
export async function setBlogPath(path: string): Promise<SetBlogPathResponse> {
  try {
    const request: SetBlogPathRequest = { path }
    const response = await apiClient.post<SetBlogPathResponse>('/settings/blog-path', request)
    return response.data
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error),
    }
  }
}

/**
 * Validate a blog path
 */
export async function validateBlogPath(blogPath: string): Promise<ValidatePathResponse> {
  try {
    const response = await apiClient.post<ValidatePathResponse>('/settings/validate-path', { blogPath })
    return response.data
  } catch (error) {
    return {
      valid: false,
      errors: [handleApiError(error)],
    }
  }
}

// ============================================
// Config API
// ============================================

/**
 * Get the current blog configuration
 */
export async function getConfig(): Promise<GetConfigResponse> {
  try {
    const response = await apiClient.get<GetConfigResponse>('/config')
    return response.data
  } catch (error) {
    return {
      success: false,
      data: {} as BlogConfig,
      error: handleApiError(error),
    }
  }
}

/**
 * Update the blog configuration
 */
export async function updateConfig(config: Partial<BlogConfig>): Promise<UpdateConfigResponse> {
  try {
    const request: UpdateConfigRequest = { config }
    const response = await apiClient.put<UpdateConfigResponse>('/config', request)
    return response.data
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error),
    }
  }
}

// ============================================
// Images API
// ============================================

/**
 * Get all images from the static directory
 */
export async function getImages(): Promise<GetImagesResponse> {
  try {
    const response = await apiClient.get<GetImagesResponse>('/images')
    return response.data
  } catch (error) {
    return {
      success: false,
      images: [],
      error: handleApiError(error),
    }
  }
}

// ============================================
// Posts API
// ============================================

/**
 * Get all posts
 */
export async function getPosts(): Promise<GetPostsResponse> {
  try {
    const response = await apiClient.get<GetPostsResponse>('/posts')
    return response.data
  } catch (error) {
    return {
      success: false,
      posts: [],
      error: handleApiError(error),
    }
  }
}

/**
 * Create a new post
 */
export async function createPost(post: CreatePostRequest): Promise<CreatePostResponse> {
  try {
    const response = await apiClient.post<CreatePostResponse>('/posts', post)
    return response.data
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error),
    }
  }
}

// Export the API client for advanced usage
export { apiClient }
