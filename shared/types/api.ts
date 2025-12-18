import type { BlogConfig } from './config'

// Generic API response
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Get config response
export interface GetConfigResponse {
  success: boolean
  data: BlogConfig
  error?: string
}

// Update config request
export interface UpdateConfigRequest {
  config: Partial<BlogConfig>
}

// Update config response
export interface UpdateConfigResponse {
  success: boolean
  backupPath?: string
  error?: string
}

// Validate path request
export interface ValidatePathRequest {
  blogPath: string
}

// Validate path response
export interface ValidatePathResponse {
  valid: boolean
  errors?: string[]
  missingFiles?: string[]
}

// Image info
export interface ImageInfo {
  path: string
  name: string
  folder: string
  size: number
  dimensions?: { width: number; height: number }
}

// Get images response
export interface GetImagesResponse {
  success: boolean
  images: ImageInfo[]
  error?: string
}

// Set blog path request
export interface SetBlogPathRequest {
  path: string
}

// Set blog path response
export interface SetBlogPathResponse {
  success: boolean
  error?: string
}
