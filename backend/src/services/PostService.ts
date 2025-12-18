import * as fs from 'fs'
import * as path from 'path'
import { settingsService } from './SettingsService'
import type { PostMeta, CreatePostRequest, FrontMatter } from '../../../shared/types/post'

/**
 * PostService handles blog post creation and listing
 * 
 * Requirements: 2.1, 2.2, 2.4
 */
export class PostService {
  /**
   * Get the content/post directory path
   */
  getPostsPath(): string {
    const blogPath = settingsService.getBlogPath()
    if (!blogPath) {
      throw new Error('Blog path not set')
    }
    return path.join(blogPath, 'content', 'post')
  }

  /**
   * Sanitize a title to create a URL-friendly filename
   * Converts Chinese characters to pinyin, replaces spaces with hyphens,
   * and removes invalid URL characters
   * 
   * Requirements: 2.4, 4.3
   */
  sanitizeFilename(title: string): string {
    if (!title || typeof title !== 'string') {
      return 'untitled'
    }

    let result = title.trim().toLowerCase()

    // Replace spaces and underscores with hyphens
    result = result.replace(/[\s_]+/g, '-')
    
    // Remove characters that are not alphanumeric, hyphens, or Chinese characters
    // Keep Chinese characters for now, they'll be handled by pinyin conversion if needed
    result = result.replace(/[^\w\u4e00-\u9fa5-]/g, '')
    
    // For Chinese characters, convert to pinyin (simplified approach)
    // In a real implementation, you'd use a pinyin library
    result = this.convertChineseToPinyin(result)
    
    // Remove any remaining non-URL-safe characters
    result = result.replace(/[^a-z0-9-]/g, '')
    
    // Remove consecutive hyphens
    result = result.replace(/-+/g, '-')
    
    // Remove leading/trailing hyphens
    result = result.replace(/^-+|-+$/g, '')
    
    // Ensure non-empty result
    return result || 'untitled'
  }

  /**
   * Simple Chinese to pinyin conversion
   * This is a basic implementation - in production, use a proper pinyin library
   */
  private convertChineseToPinyin(text: string): string {
    // Common Chinese character to pinyin mapping (simplified)
    const pinyinMap: Record<string, string> = {
      '你': 'ni', '好': 'hao', '世': 'shi', '界': 'jie',
      '博': 'bo', '客': 'ke', '文': 'wen', '章': 'zhang',
      '标': 'biao', '题': 'ti', '测': 'ce', '试': 'shi',
      '新': 'xin', '建': 'jian', '创': 'chuang', '作': 'zuo',
      '日': 'ri', '记': 'ji', '笔': 'bi',
      '技': 'ji', '术': 'shu', '分': 'fen', '享': 'xiang',
      '学': 'xue', '习': 'xi', '教': 'jiao', '程': 'cheng',
      '开': 'kai', '发': 'fa', '编': 'bian',
    }

    let result = ''
    for (const char of text) {
      if (pinyinMap[char]) {
        result += pinyinMap[char]
      } else if (/[\u4e00-\u9fa5]/.test(char)) {
        // Unknown Chinese character - skip it
        continue
      } else {
        result += char
      }
    }
    return result
  }

  /**
   * Generate Front-matter YAML from post data
   * 
   * Requirements: 2.2, 5.2
   */
  generateFrontMatter(post: CreatePostRequest): string {
    const lines: string[] = ['---']
    
    // Title (required)
    lines.push(`title: '${post.title.replace(/'/g, "''")}'`)
    
    // Date (required)
    lines.push(`date: ${post.date}`)
    
    // Draft status
    if (post.draft !== undefined) {
      lines.push(`draft: ${post.draft}`)
    }
    
    // Categories (optional)
    if (post.categories && post.categories.length > 0) {
      lines.push('categories:')
      for (const cat of post.categories) {
        lines.push(`  - ${cat}`)
      }
    }
    
    // Tags (optional)
    if (post.tags && post.tags.length > 0) {
      lines.push('tags:')
      for (const tag of post.tags) {
        lines.push(`  - ${tag}`)
      }
    }
    
    // Cover image (optional)
    if (post.cover) {
      lines.push(`cover: '${post.cover}'`)
    }
    
    // Description (optional)
    if (post.description) {
      lines.push(`description: '${post.description.replace(/'/g, "''")}'`)
    }
    
    lines.push('---')
    return lines.join('\n')
  }


  /**
   * Create a new blog post
   * 
   * Requirements: 2.1, 2.2, 2.4
   */
  async createPost(request: CreatePostRequest): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const postsPath = this.getPostsPath()
      
      // Ensure posts directory exists
      if (!fs.existsSync(postsPath)) {
        await fs.promises.mkdir(postsPath, { recursive: true })
      }
      
      // Generate filename from title
      const filename = this.sanitizeFilename(request.title) + '.md'
      const filePath = path.join(postsPath, filename)
      
      // Check if file already exists
      if (fs.existsSync(filePath)) {
        return {
          success: false,
          error: `File already exists: ${filename}`
        }
      }
      
      // Generate Front-matter and content
      const frontMatter = this.generateFrontMatter(request)
      const content = `${frontMatter}\n\n`
      
      // Write the file
      await fs.promises.writeFile(filePath, content, 'utf-8')
      
      return {
        success: true,
        filePath: filePath
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        error: errorMessage
      }
    }
  }


  /**
   * Parse Front-matter from markdown content
   */
  private parseFrontMatter(content: string): PostMeta | null {
    const match = content.match(/^---\n([\s\S]*?)\n---/)
    if (!match) {
      return null
    }
    
    const frontMatterText = match[1]
    const meta: Partial<PostMeta> = {
      draft: false
    }
    
    // Simple YAML parsing for Front-matter
    const lines = frontMatterText.split('\n')
    let currentKey: string | null = null
    let currentArray: string[] = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Check for array item
      if (trimmed.startsWith('- ') && currentKey) {
        currentArray.push(trimmed.substring(2).trim())
        continue
      }
      
      // Save previous array if exists
      if (currentKey && currentArray.length > 0) {
        (meta as any)[currentKey] = currentArray
        currentArray = []
      }
      
      // Parse key-value pair
      const colonIndex = trimmed.indexOf(':')
      if (colonIndex > 0) {
        const key = trimmed.substring(0, colonIndex).trim()
        let value = trimmed.substring(colonIndex + 1).trim()
        
        // Remove quotes
        if ((value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))) {
          value = value.slice(1, -1)
        }
        
        if (value === '') {
          // This might be an array
          currentKey = key
        } else {
          currentKey = null
          // Parse value based on type
          if (value === 'true') {
            (meta as any)[key] = true
          } else if (value === 'false') {
            (meta as any)[key] = false
          } else if (!isNaN(Number(value))) {
            (meta as any)[key] = Number(value)
          } else {
            (meta as any)[key] = value
          }
        }
      }
    }
    
    // Save last array if exists
    if (currentKey && currentArray.length > 0) {
      (meta as any)[currentKey] = currentArray
    }
    
    // Ensure required fields
    if (!meta.title || !meta.date) {
      return null
    }
    
    return meta as PostMeta
  }


  /**
   * List all posts in the content/post directory
   * 
   * Requirements: 2.1
   */
  async listPosts(): Promise<{ success: boolean; posts: PostMeta[]; error?: string }> {
    try {
      const postsPath = this.getPostsPath()
      
      if (!fs.existsSync(postsPath)) {
        return {
          success: true,
          posts: []
        }
      }
      
      const entries = await fs.promises.readdir(postsPath, { withFileTypes: true })
      const posts: PostMeta[] = []
      
      for (const entry of entries) {
        // Skip directories and non-markdown files
        if (entry.isDirectory() || !entry.name.endsWith('.md')) {
          continue
        }
        
        // Skip _index.md
        if (entry.name === '_index.md') {
          continue
        }
        
        const filePath = path.join(postsPath, entry.name)
        const content = await fs.promises.readFile(filePath, 'utf-8')
        const meta = this.parseFrontMatter(content)
        
        if (meta) {
          posts.push(meta)
        }
      }
      
      // Sort by date descending
      posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      return {
        success: true,
        posts
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        posts: [],
        error: errorMessage
      }
    }
  }
}

// Export singleton instance
export const postService = new PostService()
