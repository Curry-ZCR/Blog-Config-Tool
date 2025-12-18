// Menu item configuration
export interface MenuItem {
  name: string
  url: string
  icon?: string
}

// Footer icon configuration
export interface IconConfig {
  url: string
  rotate: boolean
  mask: boolean
}

// Footer configuration
export interface FooterConfig {
  since: number
  powered: boolean
  count: boolean
  busuanzi: boolean
  icon: IconConfig
}

// Cursor configuration
export interface CursorConfig {
  enable: boolean
  default?: string
  pointer?: string
  text?: string
}

// Dark mode configuration
export interface DarkModeConfig {
  enable: boolean
  auto: boolean
}

// Comment configuration
export interface CommentConfig {
  enable: boolean
  provider?: string
  [key: string]: unknown
}

// Algolia search configuration
export interface AlgoliaConfig {
  enable: boolean
  appId?: string
  apiKey?: string
  indexName?: string
}

// Preloader configuration
export interface PreloaderConfig {
  enable: boolean
  text?: string
}

// Animation configuration
export interface AnimationConfig {
  enable: boolean
  duration?: number
}

// Firework configuration
export interface FireworkConfig {
  enable: boolean
  colors?: string[]
}

// Copyright configuration
export interface CopyrightConfig {
  enable: boolean
  license?: string
}

// Sponsor configuration
export interface SponsorConfig {
  enable: boolean
  alipay?: string
  wechat?: string
}

// Main blog configuration
export interface BlogConfig {
  // Basic configuration
  menu: MenuItem[]
  mainSections: string[]
  author: string
  email: string
  description: string
  subtitle: string
  banner: string
  avatar: string
  cover?: string | boolean
  toc: boolean

  // Date formats
  yearFormat: string
  monthFormat: string
  dateFormat: string
  timeFormat: string

  // Footer configuration
  footer: FooterConfig

  // Sidebar configuration
  sidebar: 'left' | 'right'
  social: Record<string, string>
  widgets: string[]

  // Style configuration
  reimu_cursor: CursorConfig
  dark_mode: DarkModeConfig

  // Feature configuration
  comment: CommentConfig
  algolia_search: AlgoliaConfig

  // Animation configuration
  preloader: PreloaderConfig
  animation: AnimationConfig
  firework: FireworkConfig

  // Extended features
  article_copyright: CopyrightConfig
  sponsor: SponsorConfig
  share: string[]

  // Allow additional properties
  [key: string]: unknown
}
