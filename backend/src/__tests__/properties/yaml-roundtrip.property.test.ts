import { describe, it, expect, beforeEach } from 'vitest'
import fc from 'fast-check'
import { YamlService } from '../../services/YamlService'
import type { BlogConfig, MenuItem, FooterConfig } from '../../../../shared/types/config'

/**
 * **Feature: blog-config-tool, Property 1: Configuration Round-Trip Consistency**
 * **Validates: Requirements 1.2, 7.1, 7.3**
 * 
 * For any valid BlogConfig object, serializing it to YAML and then deserializing 
 * it back SHALL produce an equivalent configuration object.
 */

// Arbitrary generators for BlogConfig components
const menuItemArbitrary: fc.Arbitrary<MenuItem> = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('\n') && !s.includes(':')),
  url: fc.string({ minLength: 0, maxLength: 100 }).filter(s => !s.includes('\n')),
  icon: fc.option(fc.string({ minLength: 0, maxLength: 20 }).filter(s => !s.includes('\n')), { nil: undefined })
})

const iconConfigArbitrary = fc.record({
  url: fc.string({ minLength: 0, maxLength: 100 }).filter(s => !s.includes('\n')),
  rotate: fc.boolean(),
  mask: fc.boolean()
})

const footerConfigArbitrary: fc.Arbitrary<FooterConfig> = fc.record({
  since: fc.integer({ min: 1990, max: 2100 }),
  powered: fc.boolean(),
  count: fc.boolean(),
  busuanzi: fc.boolean(),
  icon: iconConfigArbitrary
})

const cursorConfigArbitrary = fc.record({
  enable: fc.boolean(),
  default: fc.option(fc.string({ minLength: 0, maxLength: 100 }).filter(s => !s.includes('\n')), { nil: undefined }),
  pointer: fc.option(fc.string({ minLength: 0, maxLength: 100 }).filter(s => !s.includes('\n')), { nil: undefined }),
  text: fc.option(fc.string({ minLength: 0, maxLength: 100 }).filter(s => !s.includes('\n')), { nil: undefined })
})

const darkModeConfigArbitrary = fc.record({
  enable: fc.boolean(),
  auto: fc.boolean()
})

const commentConfigArbitrary = fc.record({
  enable: fc.boolean(),
  provider: fc.option(fc.string({ minLength: 0, maxLength: 50 }).filter(s => !s.includes('\n')), { nil: undefined })
})

const algoliaConfigArbitrary = fc.record({
  enable: fc.boolean(),
  appId: fc.option(fc.string({ minLength: 0, maxLength: 50 }).filter(s => !s.includes('\n')), { nil: undefined }),
  apiKey: fc.option(fc.string({ minLength: 0, maxLength: 100 }).filter(s => !s.includes('\n')), { nil: undefined }),
  indexName: fc.option(fc.string({ minLength: 0, maxLength: 50 }).filter(s => !s.includes('\n')), { nil: undefined })
})

const preloaderConfigArbitrary = fc.record({
  enable: fc.boolean(),
  text: fc.option(fc.string({ minLength: 0, maxLength: 100 }).filter(s => !s.includes('\n')), { nil: undefined })
})

const animationConfigArbitrary = fc.record({
  enable: fc.boolean(),
  duration: fc.option(fc.integer({ min: 0, max: 10000 }), { nil: undefined })
})

const fireworkConfigArbitrary = fc.record({
  enable: fc.boolean(),
  colors: fc.option(fc.array(fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`), { minLength: 0, maxLength: 5 }), { nil: undefined })
})

const copyrightConfigArbitrary = fc.record({
  enable: fc.boolean(),
  license: fc.option(fc.string({ minLength: 0, maxLength: 50 }).filter(s => !s.includes('\n')), { nil: undefined })
})

const sponsorConfigArbitrary = fc.record({
  enable: fc.boolean(),
  alipay: fc.option(fc.string({ minLength: 0, maxLength: 100 }).filter(s => !s.includes('\n')), { nil: undefined }),
  wechat: fc.option(fc.string({ minLength: 0, maxLength: 100 }).filter(s => !s.includes('\n')), { nil: undefined })
})

// Safe string generator that avoids YAML special characters
const safeStringArbitrary = (maxLength: number = 100) => 
  fc.string({ minLength: 0, maxLength })
    .filter(s => !s.includes('\n') && !s.includes(':') && !s.includes('#') && !s.includes('|') && !s.includes('>'))

// Social links arbitrary - simple key-value pairs
const socialArbitrary = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-z_]+$/.test(s)),
  safeStringArbitrary(100),
  { minKeys: 0, maxKeys: 5 }
)

// Full BlogConfig arbitrary
const blogConfigArbitrary: fc.Arbitrary<BlogConfig> = fc.record({
  menu: fc.array(menuItemArbitrary, { minLength: 0, maxLength: 10 }),
  mainSections: fc.array(fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-z]+$/.test(s)), { minLength: 1, maxLength: 5 }),
  author: safeStringArbitrary(50),
  email: fc.emailAddress(),
  description: safeStringArbitrary(200),
  subtitle: safeStringArbitrary(100),
  banner: safeStringArbitrary(100),
  avatar: safeStringArbitrary(100),
  cover: fc.oneof(safeStringArbitrary(100), fc.boolean()),
  toc: fc.boolean(),
  yearFormat: fc.constant('2006'),
  monthFormat: fc.constant('2006-01'),
  dateFormat: fc.constant('2006-01-02'),
  timeFormat: fc.constant('2006-01-02 15:04:05'),
  footer: footerConfigArbitrary,
  sidebar: fc.constantFrom('left', 'right') as fc.Arbitrary<'left' | 'right'>,
  social: socialArbitrary,
  widgets: fc.array(fc.constantFrom('category', 'tag', 'tagcloud', 'recent_posts'), { minLength: 0, maxLength: 4 }),
  reimu_cursor: cursorConfigArbitrary,
  dark_mode: darkModeConfigArbitrary,
  comment: commentConfigArbitrary,
  algolia_search: algoliaConfigArbitrary,
  preloader: preloaderConfigArbitrary,
  animation: animationConfigArbitrary,
  firework: fireworkConfigArbitrary,
  article_copyright: copyrightConfigArbitrary,
  sponsor: sponsorConfigArbitrary,
  share: fc.array(fc.constantFrom('facebook', 'twitter', 'linkedin', 'weibo'), { minLength: 0, maxLength: 4 })
})

// Helper to compare configs - checks that all defined values in original are preserved
// Undefined values may become defaults after round-trip (per Requirement 7.4)
function configsAreEquivalent(original: BlogConfig, parsed: BlogConfig): boolean {
  const compareValues = (orig: unknown, pars: unknown, path: string = ''): boolean => {
    // If original is undefined, parsed can be anything (defaults applied)
    if (orig === undefined) return true
    
    // If original is defined but parsed is undefined, that's a problem
    if (pars === undefined) return false
    
    // Handle null
    if (orig === null) return pars === null
    
    // Handle arrays
    if (Array.isArray(orig)) {
      if (!Array.isArray(pars)) return false
      if (orig.length !== pars.length) return false
      return orig.every((item, i) => compareValues(item, pars[i], `${path}[${i}]`))
    }
    
    // Handle objects
    if (typeof orig === 'object') {
      if (typeof pars !== 'object' || pars === null) return false
      const origObj = orig as Record<string, unknown>
      const parsObj = pars as Record<string, unknown>
      
      // Check all defined keys in original exist and match in parsed
      for (const key of Object.keys(origObj)) {
        if (origObj[key] !== undefined) {
          if (!compareValues(origObj[key], parsObj[key], `${path}.${key}`)) {
            return false
          }
        }
      }
      return true
    }
    
    // Handle primitives
    return orig === pars
  }

  return compareValues(original, parsed)
}

describe('YAML Round-Trip Consistency', () => {
  let yamlService: YamlService

  beforeEach(() => {
    yamlService = new YamlService()
  })

  /**
   * **Feature: blog-config-tool, Property 1: Configuration Round-Trip Consistency**
   * **Validates: Requirements 1.2, 7.1, 7.3**
   */
  it('should preserve config through serialize/deserialize cycle', () => {
    fc.assert(
      fc.property(blogConfigArbitrary, (config) => {
        // Serialize config to YAML
        const yaml = yamlService.serialize(config)
        
        // Reset service state for fresh parse
        yamlService.reset()
        
        // Parse YAML back to config
        const parsed = yamlService.parse(yaml)
        
        // Verify equivalence
        return configsAreEquivalent(config, parsed)
      }),
      { numRuns: 100 }
    )
  })

  it('should handle empty arrays correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          menu: fc.constant([]),
          mainSections: fc.constant(['post']),
          author: fc.constant('test'),
          email: fc.constant('test@test.com'),
          description: fc.constant(''),
          subtitle: fc.constant(''),
          banner: fc.constant(''),
          avatar: fc.constant(''),
          toc: fc.constant(true),
          yearFormat: fc.constant('2006'),
          monthFormat: fc.constant('2006-01'),
          dateFormat: fc.constant('2006-01-02'),
          timeFormat: fc.constant('2006-01-02 15:04:05'),
          footer: footerConfigArbitrary,
          sidebar: fc.constant('left') as fc.Arbitrary<'left'>,
          social: fc.constant({}),
          widgets: fc.constant([]),
          reimu_cursor: cursorConfigArbitrary,
          dark_mode: darkModeConfigArbitrary,
          comment: commentConfigArbitrary,
          algolia_search: algoliaConfigArbitrary,
          preloader: preloaderConfigArbitrary,
          animation: animationConfigArbitrary,
          firework: fireworkConfigArbitrary,
          article_copyright: copyrightConfigArbitrary,
          sponsor: sponsorConfigArbitrary,
          share: fc.constant([])
        }) as fc.Arbitrary<BlogConfig>,
        (config) => {
          const yaml = yamlService.serialize(config)
          yamlService.reset()
          const parsed = yamlService.parse(yaml)
          
          expect(Array.isArray(parsed.menu)).toBe(true)
          expect(Array.isArray(parsed.widgets)).toBe(true)
          expect(Array.isArray(parsed.share)).toBe(true)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
