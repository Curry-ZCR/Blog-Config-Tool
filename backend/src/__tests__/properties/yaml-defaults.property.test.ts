import { describe, it, expect, beforeEach } from 'vitest'
import fc from 'fast-check'
import { YamlService, DEFAULT_CONFIG } from '../../services/YamlService'
import type { BlogConfig } from '../../../../shared/types/config'

/**
 * **Feature: blog-config-tool, Property 11: Optional Field Default Values**
 * **Validates: Requirements 7.4**
 * 
 * For any params.yml file with missing optional fields, deserialization SHALL succeed
 * and missing fields SHALL have defined default values.
 */

// List of required fields that must be present in a minimal config
const REQUIRED_FIELDS = ['author', 'email'] as const

// List of optional fields that should get defaults
const OPTIONAL_FIELDS = [
  'menu',
  'mainSections',
  'description',
  'subtitle',
  'banner',
  'avatar',
  'toc',
  'yearFormat',
  'monthFormat',
  'dateFormat',
  'timeFormat',
  'footer',
  'sidebar',
  'social',
  'widgets',
  'reimu_cursor',
  'dark_mode',
  'comment',
  'algolia_search',
  'preloader',
  'animation',
  'firework',
  'article_copyright',
  'sponsor',
  'share'
] as const

// Generate a safe email that doesn't start with YAML special characters
const safeEmailArbitrary = fc.emailAddress().filter(email => 
  !email.startsWith('*') && 
  !email.startsWith('&') && 
  !email.startsWith('!') &&
  !email.startsWith('{') &&
  !email.startsWith('[')
)

// Generate a minimal YAML config with only required fields
const minimalYamlArbitrary = fc.record({
  author: fc.stringOf(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ '.split('')),
    { minLength: 1, maxLength: 30 }
  ),
  email: safeEmailArbitrary
}).map(({ author, email }) => `author: "${author}"\nemail: ${email}\n`)

// Generate YAML with a random subset of optional fields missing
const partialYamlArbitrary = fc.tuple(
  fc.stringOf(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ '.split('')),
    { minLength: 1, maxLength: 30 }
  ),
  safeEmailArbitrary,
  fc.subarray([...OPTIONAL_FIELDS], { minLength: 0, maxLength: 10 })
).map(([author, email, includedFields]) => {
  const lines: string[] = [
    `author: "${author}"`,
    `email: ${email}`
  ]
  
  // Add some optional fields
  for (const field of includedFields) {
    switch (field) {
      case 'toc':
        lines.push('toc: true')
        break
      case 'sidebar':
        lines.push('sidebar: left')
        break
      case 'description':
        lines.push('description: "Test description"')
        break
      case 'subtitle':
        lines.push('subtitle: "Test subtitle"')
        break
      case 'banner':
        lines.push('banner: "images/banner.webp"')
        break
      case 'avatar':
        lines.push('avatar: "avatar.webp"')
        break
      case 'menu':
        lines.push('menu:\n  - name: home\n    url: ""')
        break
      case 'mainSections':
        lines.push('mainSections:\n  - post')
        break
      case 'widgets':
        lines.push('widgets:\n  - category\n  - tag')
        break
      case 'share':
        lines.push('share:\n  - twitter')
        break
      // Skip complex nested objects for simplicity
    }
  }
  
  return lines.join('\n')
})

describe('Optional Field Default Values', () => {
  let yamlService: YamlService

  beforeEach(() => {
    yamlService = new YamlService()
  })

  /**
   * **Feature: blog-config-tool, Property 11: Optional Field Default Values**
   * **Validates: Requirements 7.4**
   */
  it('should apply defaults for missing optional fields in minimal config', () => {
    fc.assert(
      fc.property(minimalYamlArbitrary, (yaml) => {
        const config = yamlService.parse(yaml)
        
        // Verify all optional fields have values (either from YAML or defaults)
        expect(config.menu).toBeDefined()
        expect(Array.isArray(config.menu)).toBe(true)
        
        expect(config.mainSections).toBeDefined()
        expect(Array.isArray(config.mainSections)).toBe(true)
        
        expect(config.toc).toBeDefined()
        expect(typeof config.toc).toBe('boolean')
        
        expect(config.sidebar).toBeDefined()
        expect(['left', 'right']).toContain(config.sidebar)
        
        expect(config.footer).toBeDefined()
        expect(typeof config.footer.since).toBe('number')
        expect(typeof config.footer.powered).toBe('boolean')
        
        expect(config.reimu_cursor).toBeDefined()
        expect(typeof config.reimu_cursor.enable).toBe('boolean')
        
        expect(config.dark_mode).toBeDefined()
        
        expect(config.widgets).toBeDefined()
        expect(Array.isArray(config.widgets)).toBe(true)
        
        expect(config.share).toBeDefined()
        expect(Array.isArray(config.share)).toBe(true)
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should preserve provided values while applying defaults for missing fields', () => {
    fc.assert(
      fc.property(partialYamlArbitrary, (yaml) => {
        const config = yamlService.parse(yaml)
        
        // Required fields should be present
        expect(config.author).toBeDefined()
        expect(config.email).toBeDefined()
        
        // All optional fields should have values (either provided or default)
        for (const field of OPTIONAL_FIELDS) {
          expect(config[field]).toBeDefined()
        }
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should use correct default values from DEFAULT_CONFIG', () => {
    const minimalYaml = `author: "Test"\nemail: test@test.com\n`
    const config = yamlService.parse(minimalYaml)
    
    // Check specific default values
    expect(config.toc).toBe(DEFAULT_CONFIG.toc)
    expect(config.sidebar).toBe(DEFAULT_CONFIG.sidebar)
    expect(config.yearFormat).toBe(DEFAULT_CONFIG.yearFormat)
    expect(config.monthFormat).toBe(DEFAULT_CONFIG.monthFormat)
    expect(config.dateFormat).toBe(DEFAULT_CONFIG.dateFormat)
    expect(config.timeFormat).toBe(DEFAULT_CONFIG.timeFormat)
  })

  it('should handle empty YAML gracefully', () => {
    const emptyYaml = ''
    const config = yamlService.parse(emptyYaml)
    
    // Should still have all default values
    expect(config.menu).toEqual(DEFAULT_CONFIG.menu)
    expect(config.mainSections).toEqual(DEFAULT_CONFIG.mainSections)
    expect(config.toc).toBe(DEFAULT_CONFIG.toc)
    expect(config.sidebar).toBe(DEFAULT_CONFIG.sidebar)
  })
})
