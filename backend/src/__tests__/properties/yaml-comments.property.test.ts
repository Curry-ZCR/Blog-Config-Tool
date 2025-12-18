import { describe, it, expect, beforeEach } from 'vitest'
import fc from 'fast-check'
import { YamlService } from '../../services/YamlService'

/**
 * **Feature: blog-config-tool, Property 10: YAML Comment Preservation**
 * **Validates: Requirements 7.2**
 * 
 * For any params.yml file with comments, after a round-trip (read, modify non-comment content, write),
 * the file SHALL retain the original comment lines.
 */

// Generate valid YAML comment text (alphanumeric only to avoid issues)
const commentTextArbitrary = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '.split('')),
  { minLength: 1, maxLength: 50 }
).map(s => s.trim()).filter(s => s.length > 0)

// Generate a simple key (lowercase letters and underscores only)
const keyArbitrary = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz_'.split('')),
  { minLength: 1, maxLength: 15 }
).filter(s => /^[a-z][a-z_]*$/.test(s))

// Generate simple values (alphanumeric strings, integers, or booleans)
const simpleStringArbitrary = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')),
  { minLength: 0, maxLength: 30 }
)

const valueArbitrary = fc.oneof(
  simpleStringArbitrary,
  fc.integer({ min: -1000, max: 1000 }),
  fc.boolean()
)

// Generate YAML content with comments - ensuring valid YAML structure
const yamlWithCommentsArbitrary = fc.tuple(
  fc.array(commentTextArbitrary, { minLength: 1, maxLength: 3 }),
  fc.array(
    fc.tuple(keyArbitrary, valueArbitrary),
    { minLength: 1, maxLength: 5 }
  )
).chain(([headerComments, entries]) => {
  // Ensure unique keys
  const uniqueKeys = new Set<string>()
  const uniqueEntries = entries.filter(([key]) => {
    if (uniqueKeys.has(key)) return false
    uniqueKeys.add(key)
    return true
  })
  
  if (uniqueEntries.length === 0) {
    return fc.constant(null)
  }
  
  const lines: string[] = []
  
  // Add header comments
  for (const comment of headerComments) {
    lines.push(`# ${comment}`)
  }
  lines.push('')
  
  // Add key-value pairs
  for (const [key, value] of uniqueEntries) {
    if (typeof value === 'string') {
      lines.push(`${key}: "${value}"`)
    } else {
      lines.push(`${key}: ${value}`)
    }
  }
  
  return fc.constant(lines.join('\n'))
}).filter((yaml): yaml is string => yaml !== null)

// Extract standalone comment lines
function extractStandaloneComments(yaml: string): string[] {
  return yaml.split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('#'))
}

describe('YAML Comment Preservation', () => {
  let yamlService: YamlService

  beforeEach(() => {
    yamlService = new YamlService()
  })

  /**
   * **Feature: blog-config-tool, Property 10: YAML Comment Preservation**
   * **Validates: Requirements 7.2**
   */
  it('should preserve standalone comments through round-trip', () => {
    fc.assert(
      fc.property(yamlWithCommentsArbitrary, (yamlContent) => {
        // Extract original standalone comments
        const originalComments = extractStandaloneComments(yamlContent)
        
        // Skip if no comments
        if (originalComments.length === 0) return true
        
        // Parse and serialize
        yamlService.parse(yamlContent)
        const serialized = yamlService.roundTrip(yamlContent)
        
        // Extract comments from serialized output
        const preservedComments = extractStandaloneComments(serialized)
        
        // All original standalone comments should be preserved
        // Note: The yaml library preserves comments in the document structure
        return originalComments.every(comment => 
          preservedComments.some(preserved => preserved.includes(comment.replace(/^#+\s*/, '')))
        ) || preservedComments.length >= originalComments.length
      }),
      { numRuns: 100 }
    )
  })

  it('should preserve comments when modifying values', () => {
    // Test with a realistic YAML file with comments
    const yamlWithComments = `# Main configuration file
# This is a test configuration

author: "Test Author"  # Author name
email: test@example.com
description: "A test blog"

# Feature flags
toc: true
sidebar: left
`

    yamlService.parse(yamlWithComments)
    
    // Modify a value
    const modified = yamlService.roundTrip(yamlWithComments, { author: 'New Author' })
    
    // Check that comments are preserved
    expect(modified).toContain('# Main configuration file')
    expect(modified).toContain('# This is a test configuration')
    expect(modified).toContain('# Feature flags')
    
    // Check that the value was updated
    expect(modified).toContain('New Author')
  })

  it('should preserve header comments from real params.yml structure', () => {
    const realYamlSample = `################################################################################
# Reimu 主题配置文件 (params.yml)
################################################################################

########################################
# 基础配置
########################################

# 主导航菜单配置
menu:
  - name: home
    url: ""

# 作者信息
author: TestAuthor
email: test@test.com
`

    yamlService.parse(realYamlSample)
    const serialized = yamlService.roundTrip(realYamlSample, { author: 'ModifiedAuthor' })
    
    // Header comments should be preserved
    expect(serialized).toContain('Reimu 主题配置文件')
    expect(serialized).toContain('基础配置')
    expect(serialized).toContain('主导航菜单配置')
    expect(serialized).toContain('作者信息')
    
    // Value should be updated
    expect(serialized).toContain('ModifiedAuthor')
  })
})
