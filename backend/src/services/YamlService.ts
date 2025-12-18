import { Document, parseDocument, stringify, YAMLMap, isMap, Scalar } from 'yaml'
import type { BlogConfig } from '../../../shared/types/config'

/**
 * Default values for optional fields in BlogConfig
 */
const DEFAULT_CONFIG: Partial<BlogConfig> = {
  menu: [],
  mainSections: ['post'],
  author: '',
  email: '',
  description: '',
  subtitle: '',
  banner: '',
  avatar: '',
  toc: true,
  yearFormat: '2006',
  monthFormat: '2006-01',
  dateFormat: '2006-01-02',
  timeFormat: '2006-01-02 15:04:05',
  footer: {
    since: new Date().getFullYear(),
    powered: true,
    count: true,
    busuanzi: false,
    icon: {
      url: '',
      rotate: false,
      mask: false
    }
  },
  sidebar: 'left',
  social: {},
  widgets: [],
  reimu_cursor: {
    enable: false
  },
  dark_mode: {
    enable: false,
    auto: false
  },
  comment: {
    enable: false
  },
  algolia_search: {
    enable: false
  },
  preloader: {
    enable: false
  },
  animation: {
    enable: false
  },
  firework: {
    enable: false
  },
  article_copyright: {
    enable: false
  },
  sponsor: {
    enable: false
  },
  share: []
}

/**
 * YamlService provides YAML parsing and serialization with comment preservation
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */
export class YamlService {
  private document: Document | null = null

  /**
   * Parse YAML string into BlogConfig object
   * Preserves the document structure for later serialization with comments
   * 
   * @param yamlContent - Raw YAML string content
   * @returns Parsed BlogConfig with default values for missing optional fields
   */
  parse(yamlContent: string): BlogConfig {
    this.document = parseDocument(yamlContent, {
      keepSourceTokens: true
    })

    const parsed = this.document.toJS() as Partial<BlogConfig>
    
    // Apply defaults for missing optional fields (Requirement 7.4)
    return this.applyDefaults(parsed)
  }

  /**
   * Serialize BlogConfig object back to YAML string
   * Preserves comments if the document was previously parsed
   * 
   * @param config - BlogConfig object to serialize
   * @returns YAML string with preserved comments
   */
  serialize(config: BlogConfig): string {
    if (this.document) {
      // Update existing document to preserve comments (Requirement 7.2)
      this.updateDocument(this.document.contents as YAMLMap, config)
      return this.document.toString()
    }

    // Create new document if none exists
    return stringify(config, {
      indent: 2,
      lineWidth: 0,
      defaultKeyType: 'PLAIN',
      defaultStringType: 'PLAIN'
    })
  }

  /**
   * Parse YAML and serialize back - useful for testing round-trip consistency
   * 
   * @param yamlContent - Raw YAML string
   * @param modifications - Optional modifications to apply
   * @returns Serialized YAML string
   */
  roundTrip(yamlContent: string, modifications?: Partial<BlogConfig>): string {
    const config = this.parse(yamlContent)
    const modified = modifications ? { ...config, ...modifications } : config
    return this.serialize(modified)
  }

  /**
   * Get the raw parsed document (for testing purposes)
   */
  getDocument(): Document | null {
    return this.document
  }

  /**
   * Reset the internal document state
   */
  reset(): void {
    this.document = null
  }

  /**
   * Apply default values for missing optional fields
   */
  private applyDefaults(parsed: Partial<BlogConfig> | null): BlogConfig {
    // Handle null/undefined parsed value (empty YAML)
    if (!parsed) {
      return { ...DEFAULT_CONFIG } as BlogConfig
    }

    const result: BlogConfig = {
      ...DEFAULT_CONFIG,
      ...parsed
    } as BlogConfig

    // Deep merge nested objects
    if (parsed.footer) {
      result.footer = {
        ...DEFAULT_CONFIG.footer,
        ...parsed.footer,
        icon: {
          ...DEFAULT_CONFIG.footer?.icon,
          ...parsed.footer?.icon
        }
      }
    }

    if (parsed.reimu_cursor) {
      result.reimu_cursor = {
        ...DEFAULT_CONFIG.reimu_cursor,
        ...parsed.reimu_cursor
      }
    }

    if (parsed.dark_mode) {
      result.dark_mode = {
        ...DEFAULT_CONFIG.dark_mode,
        ...parsed.dark_mode
      }
    }

    return result
  }

  /**
   * Update YAML document in-place to preserve comments
   */
  private updateDocument(node: YAMLMap | null, config: Record<string, unknown>, path: string[] = []): void {
    if (!node || !isMap(node)) return

    for (const [key, value] of Object.entries(config)) {
      const existingPair = node.items.find(item => {
        const itemKey = item.key
        if (itemKey instanceof Scalar) {
          return itemKey.value === key
        }
        return itemKey === key
      })

      if (existingPair) {
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          // Recursively update nested objects
          if (isMap(existingPair.value)) {
            this.updateDocument(existingPair.value as YAMLMap, value as Record<string, unknown>, [...path, key])
          } else {
            existingPair.value = this.document!.createNode(value)
          }
        } else if (Array.isArray(value)) {
          // Handle arrays
          existingPair.value = this.document!.createNode(value)
        } else {
          // Update scalar value
          if (existingPair.value instanceof Scalar) {
            existingPair.value.value = value
          } else {
            existingPair.value = this.document!.createNode(value)
          }
        }
      } else {
        // Add new key-value pair
        node.add({ key, value: this.document!.createNode(value) })
      }
    }
  }
}

// Export singleton instance
export const yamlService = new YamlService()

// Export default config for testing
export { DEFAULT_CONFIG }
