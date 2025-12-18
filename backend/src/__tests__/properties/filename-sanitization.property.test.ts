import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { PostService } from '../../services/PostService'

/**
 * **Feature: blog-config-tool, Property 4: Filename Sanitization Safety**
 * **Validates: Requirements 2.4, 4.3**
 * 
 * For any post title string, the generated filename SHALL contain only 
 * URL-safe characters (alphanumeric, hyphens) and SHALL be non-empty.
 */

// Bounded string arbitrary to prevent timeout issues
const titleArbitrary = fc.string({ minLength: 0, maxLength: 200 })

describe('Filename Sanitization Safety', () => {
  const postService = new PostService()

  /**
   * **Feature: blog-config-tool, Property 4: Filename Sanitization Safety**
   * **Validates: Requirements 2.4, 4.3**
   */
  it('should produce only URL-safe characters (alphanumeric and hyphens)', () => {
    fc.assert(
      fc.property(titleArbitrary, (title) => {
        const filename = postService.sanitizeFilename(title)
        
        // Filename must only contain lowercase alphanumeric characters and hyphens
        const urlSafePattern = /^[a-z0-9-]*$/
        expect(filename).toMatch(urlSafePattern)
        
        return urlSafePattern.test(filename)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: blog-config-tool, Property 4: Filename Sanitization Safety**
   * **Validates: Requirements 2.4, 4.3**
   */
  it('should always produce a non-empty filename', () => {
    fc.assert(
      fc.property(titleArbitrary, (title) => {
        const filename = postService.sanitizeFilename(title)
        
        // Filename must be non-empty
        expect(filename.length).toBeGreaterThan(0)
        
        return filename.length > 0
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: blog-config-tool, Property 4: Filename Sanitization Safety**
   * **Validates: Requirements 2.4, 4.3**
   */
  it('should not have leading or trailing hyphens', () => {
    fc.assert(
      fc.property(titleArbitrary, (title) => {
        const filename = postService.sanitizeFilename(title)
        
        // Filename should not start or end with hyphens
        expect(filename).not.toMatch(/^-/)
        expect(filename).not.toMatch(/-$/)
        
        return !filename.startsWith('-') && !filename.endsWith('-')
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: blog-config-tool, Property 4: Filename Sanitization Safety**
   * **Validates: Requirements 2.4, 4.3**
   */
  it('should not have consecutive hyphens', () => {
    fc.assert(
      fc.property(titleArbitrary, (title) => {
        const filename = postService.sanitizeFilename(title)
        
        // Filename should not contain consecutive hyphens
        expect(filename).not.toMatch(/--/)
        
        return !filename.includes('--')
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Test with various edge case inputs
   */
  it('should handle edge cases correctly', () => {
    // Empty string
    expect(postService.sanitizeFilename('')).toBe('untitled')
    
    // Whitespace only
    expect(postService.sanitizeFilename('   ')).toBe('untitled')
    
    // Special characters only
    expect(postService.sanitizeFilename('!@#$%^&*()')).toBe('untitled')
    
    // Normal English title
    const englishResult = postService.sanitizeFilename('Hello World')
    expect(englishResult).toBe('hello-world')
    
    // Title with numbers
    const numbersResult = postService.sanitizeFilename('Post 123')
    expect(numbersResult).toBe('post-123')
  })

  /**
   * Test with Chinese characters (common use case for this blog tool)
   */
  it('should handle Chinese characters by converting to pinyin or removing', () => {
    // Use a custom arbitrary that generates strings with Chinese characters
    const chineseChars = '你好世界博客文章标题测试新建创作日记笔技术分享学习教程开发编'
    const chineseStringArbitrary = fc.array(
      fc.integer({ min: 0, max: chineseChars.length - 1 }),
      { minLength: 1, maxLength: 20 }
    ).map(indices => indices.map(i => chineseChars[i]).join(''))
    
    fc.assert(
      fc.property(chineseStringArbitrary, (title) => {
        const filename = postService.sanitizeFilename(title)
        
        // Result should still be URL-safe
        const urlSafePattern = /^[a-z0-9-]*$/
        expect(filename).toMatch(urlSafePattern)
        
        // Result should be non-empty (fallback to 'untitled' if all chars removed)
        expect(filename.length).toBeGreaterThan(0)
        
        return urlSafePattern.test(filename) && filename.length > 0
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Test with mixed content (English, Chinese, special chars)
   */
  it('should handle mixed content titles', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.string({ minLength: 0, maxLength: 20 }),
          fc.string({ minLength: 0, maxLength: 20 }),
          fc.string({ minLength: 0, maxLength: 20 })
        ).map(([a, b, c]) => `${a}${b}${c}`),
        (title) => {
          const filename = postService.sanitizeFilename(title)
          
          // Result should be URL-safe
          const urlSafePattern = /^[a-z0-9-]*$/
          expect(filename).toMatch(urlSafePattern)
          
          // Result should be non-empty
          expect(filename.length).toBeGreaterThan(0)
          
          // No leading/trailing hyphens
          expect(filename).not.toMatch(/^-|-$/)
          
          // No consecutive hyphens
          expect(filename).not.toMatch(/--/)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
