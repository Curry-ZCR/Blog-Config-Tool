import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { PostService } from '../../services/PostService'
import type { CreatePostRequest, PostMeta } from '../../../../shared/types/post'

/**
 * **Feature: blog-config-tool, Property 3: Post Creation Front-matter Correctness**
 * **Validates: Requirements 2.2, 5.2**
 * 
 * For any valid CreatePostRequest, the created markdown file SHALL contain 
 * Front-matter that, when parsed, produces an equivalent PostMeta object.
 */

// Safe string generator that avoids YAML special characters
const safeStringArbitrary = (minLength: number = 1, maxLength: number = 50) =>
  fc.string({ minLength, maxLength })
    .filter(s => 
      !s.includes('\n') && 
      !s.includes(':') && 
      !s.includes('#') && 
      !s.includes('|') && 
      !s.includes('>') &&
      !s.includes("'") &&
      !s.includes('"') &&
      s.trim().length > 0
    )

// Generate valid ISO date strings (YYYY-MM-DD format)
const dateArbitrary = fc.date({
  min: new Date('2000-01-01'),
  max: new Date('2099-12-31')
}).map(d => d.toISOString().split('T')[0])

// Category/tag arbitrary - simple alphanumeric strings
const categoryTagArbitrary = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => /^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(s) && s.trim().length > 0)

// URL path arbitrary for cover images
const coverArbitrary = fc.oneof(
  fc.constant(undefined),
  fc.string({ minLength: 1, maxLength: 100 })
    .filter(s => !s.includes('\n') && !s.includes("'") && !s.includes('"'))
    .map(s => `/images/${s.replace(/[^a-zA-Z0-9-_./]/g, '')}.jpg`)
)

// CreatePostRequest arbitrary generator
const createPostRequestArbitrary: fc.Arbitrary<CreatePostRequest> = fc.record({
  title: safeStringArbitrary(1, 100),
  date: dateArbitrary,
  categories: fc.option(
    fc.array(categoryTagArbitrary, { minLength: 1, maxLength: 5 }),
    { nil: undefined }
  ),
  tags: fc.option(
    fc.array(categoryTagArbitrary, { minLength: 1, maxLength: 5 }),
    { nil: undefined }
  ),
  cover: coverArbitrary,
  description: fc.option(
    safeStringArbitrary(0, 200),
    { nil: undefined }
  ),
  draft: fc.option(fc.boolean(), { nil: undefined })
})

/**
 * Parse Front-matter from generated content and return PostMeta
 * This mirrors the parsing logic in PostService
 */
function parseFrontMatter(content: string): PostMeta | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) {
    return null
  }

  const frontMatterText = match[1]
  const meta: Partial<PostMeta> = {
    draft: false
  }

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

      // Track if value was originally quoted BEFORE removing quotes
      const wasQuoted = (value.startsWith("'") && value.endsWith("'")) ||
                        (value.startsWith('"') && value.endsWith('"'))

      // Remove quotes
      if (wasQuoted) {
        // Handle escaped quotes
        value = value.slice(1, -1).replace(/''/g, "'")
      }

      if (value === '') {
        // This might be an array
        currentKey = key
      } else {
        currentKey = null
        // Parse value based on type
        // Only convert to boolean/number if NOT quoted
        if (!wasQuoted && value === 'true') {
          (meta as any)[key] = true
        } else if (!wasQuoted && value === 'false') {
          (meta as any)[key] = false
        } else if (!wasQuoted && !isNaN(Number(value)) && value !== '') {
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
 * Compare CreatePostRequest with parsed PostMeta for equivalence
 */
function requestMatchesParsedMeta(request: CreatePostRequest, parsed: PostMeta): boolean {
  // Title must match exactly
  if (request.title !== parsed.title) {
    return false
  }

  // Date must match
  if (request.date !== parsed.date) {
    return false
  }

  // Draft status - default is false if not specified
  const expectedDraft = request.draft ?? false
  if (expectedDraft !== parsed.draft) {
    return false
  }

  // Categories - compare arrays if present
  if (request.categories && request.categories.length > 0) {
    if (!parsed.categories || parsed.categories.length !== request.categories.length) {
      return false
    }
    for (let i = 0; i < request.categories.length; i++) {
      if (request.categories[i] !== parsed.categories[i]) {
        return false
      }
    }
  } else if (parsed.categories && parsed.categories.length > 0) {
    return false
  }

  // Tags - compare arrays if present
  if (request.tags && request.tags.length > 0) {
    if (!parsed.tags || parsed.tags.length !== request.tags.length) {
      return false
    }
    for (let i = 0; i < request.tags.length; i++) {
      if (request.tags[i] !== parsed.tags[i]) {
        return false
      }
    }
  } else if (parsed.tags && parsed.tags.length > 0) {
    return false
  }

  // Cover - compare if present
  if (request.cover) {
    if (parsed.cover !== request.cover) {
      return false
    }
  } else if (parsed.cover) {
    return false
  }

  // Description - compare if present
  if (request.description) {
    if (parsed.description !== request.description) {
      return false
    }
  } else if (parsed.description) {
    return false
  }

  return true
}

describe('Post Creation Front-matter Correctness', () => {
  const postService = new PostService()

  /**
   * **Feature: blog-config-tool, Property 3: Post Creation Front-matter Correctness**
   * **Validates: Requirements 2.2, 5.2**
   */
  it('should generate Front-matter that parses back to equivalent PostMeta', () => {
    fc.assert(
      fc.property(createPostRequestArbitrary, (request) => {
        // Generate Front-matter from request
        const frontMatter = postService.generateFrontMatter(request)
        
        // Parse the generated Front-matter
        const parsed = parseFrontMatter(frontMatter)
        
        // Verify parsing succeeded
        expect(parsed).not.toBeNull()
        if (!parsed) return false
        
        // Verify equivalence
        return requestMatchesParsedMeta(request, parsed)
      }),
      { numRuns: 100 }
    )
  })

  it('should always produce valid YAML Front-matter structure', () => {
    fc.assert(
      fc.property(createPostRequestArbitrary, (request) => {
        const frontMatter = postService.generateFrontMatter(request)
        
        // Must start and end with ---
        expect(frontMatter.startsWith('---')).toBe(true)
        expect(frontMatter.endsWith('---')).toBe(true)
        
        // Must contain title and date
        expect(frontMatter).toContain('title:')
        expect(frontMatter).toContain('date:')
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should preserve array order for categories and tags', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: safeStringArbitrary(1, 50),
          date: dateArbitrary,
          categories: fc.array(categoryTagArbitrary, { minLength: 2, maxLength: 5 }),
          tags: fc.array(categoryTagArbitrary, { minLength: 2, maxLength: 5 }),
          draft: fc.constant(false)
        }),
        (request) => {
          const frontMatter = postService.generateFrontMatter(request)
          const parsed = parseFrontMatter(frontMatter)
          
          expect(parsed).not.toBeNull()
          if (!parsed) return false
          
          // Categories order must be preserved
          expect(parsed.categories).toEqual(request.categories)
          
          // Tags order must be preserved
          expect(parsed.tags).toEqual(request.tags)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
