// Menu item configuration
export interface MenuItem {
  name: string
  url: string
  icon?: string | null
}

// Banner responsive configuration
export interface BannerSrcsetConfig {
  enable: boolean
  srcset: {
    src: string
    media: string
  }[]
}

// Open Graph configuration
export interface OpenGraphConfig {
  enable: boolean
  options?: Record<string, string>
}

// Injector configuration
export interface InjectorConfig {
  head_begin?: string
  head_end?: string
  body_begin?: string
  body_end?: string
  sidebar_begin?: string
  sidebar_end?: string
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

// Summary configuration
export interface SummaryConfig {
  enable: boolean
  style: 'subtitle' | 'blockquote'
}

// Triangle badge configuration
export interface TriangleBadgeConfig {
  enable: boolean
  icon: string
  link: string
}

// RSS configuration
export interface RssConfig {
  limit: number
  showFullContent: boolean
  showCopyright: boolean
}

// Sort order configuration
export interface SortOrderConfig {
  taxonomy: {
    category: string
    tag: string
  }
  archive: string
  home: string
}

// Layout configuration
export interface LayoutConfig {
  max_width: string
}

// Cursor configuration
export interface CursorConfig {
  enable: boolean
  cursor: {
    default: string
    pointer: string
    text: string
  }
}

// Font configuration
export interface CustomFontConfig {
  enable: boolean
  article?: {
    css: string
    name: string
  }
  code?: {
    css: string
    name: string
  }
}

export interface FontConfig {
  enable: boolean
  article: string[]
  code?: string[]
}

export interface LocalFontConfig {
  article: string[]
  code: string[]
}

// Dark mode configuration
export interface DarkModeConfig {
  enable: boolean | 'auto'
  auto: boolean
}

// Mermaid configuration
export interface MermaidConfig {
  zoom: boolean
}

// Code block configuration
export interface CodeBlockConfig {
  expand: boolean | number
}

// Math configuration
export interface MathConfig {
  katex: {
    enable: boolean
  }
  mathjax: {
    enable: boolean
    options?: any[]
    loader?: Record<string, any>
  }
}

// Comment configurations
export interface ValineConfig {
  enable: boolean
  appId?: string
  appKey?: string
  pageSize?: number
  avatar?: string
  placeholder?: string
  guest_info?: string
  recordIP?: boolean
  highlight?: boolean
  visitor?: boolean
  serverURLs?: string
}

export interface WalineConfig {
  enable: boolean
  serverURL?: string
  locale?: Record<string, any>
  emoji?: string[]
  meta?: string[]
  requiredMeta?: string[]
  wordLimit?: number
  pageSize?: number
  pageview?: boolean
}

export interface TwikooConfig {
  enable: boolean
  envId?: string
  region?: string
}

export interface GitalkConfig {
  enable: boolean
  clientID?: string
  clientSecret?: string
  repo?: string
  owner?: string
  admin?: string[]
  md5?: boolean
}

export interface GiscusConfig {
  enable: boolean
  repo?: string
  repoId?: string
  category?: string
  categoryId?: string
  mapping?: string
  strict?: number
  reactionsEnabled?: number
  emitMetadata?: number
  inputPosition?: string
}

export interface DisqusConfig {
  enable: boolean
  shortname?: string
  count?: boolean
}

// Comment configuration main
export interface CommentConfig {
  enable: boolean
  title?: Record<string, string>
  default?: string
}

// Algolia search configuration
export interface AlgoliaConfig {
  enable: boolean
  appID?: string
  apiKey?: string
  indexName?: string
  hits?: {
    per_page: number
  }
}

// Preloader configuration
export interface PreloaderConfig {
  enable: boolean
  text?: Record<string, string>
  icon?: string
  rotate?: boolean
}

// Animation configuration
export interface AnimationConfig {
  enable: boolean
  options?: Record<string, any>
}

// Firework configuration
export interface FireworkConfig {
  enable: boolean
  disable_on_mobile?: boolean
  options?: Record<string, any>
}

// Copyright configuration
export interface CopyrightConfig {
  enable: boolean
  content?: {
    author: boolean
    link: boolean
    title: boolean
    date: boolean
    updated: boolean
    license: boolean
    license_type: string
  }
}

// Clipboard configuration
export interface ClipboardConfig {
  success?: Record<string, string>
  fail?: Record<string, string>
  copyright?: {
    enable: boolean
    count: number
    license_type: string
  }
}

// Top button configuration
export interface TopConfig {
  enable: boolean
  position: 'left' | 'right'
  icon: IconConfig
}

// Outdate configuration
export interface OutdateConfig {
  enable: boolean
  daysAgo: number
  message: Record<string, string>
}

// ICP configuration
export interface IcpConfig {
  icpnumber?: string
  beian?: string
  recordcode?: string
}

export interface MoeIcpConfig {
  icpnumber?: string
}

// Sponsor configuration
export interface SponsorConfig {
  enable: boolean
  tip?: Record<string, string>
  icon?: IconConfig
  qr?: {
    name: string
    src: string
  }[]
}

// Home categories configuration
export interface HomeCategoriesConfig {
  enable: boolean
  content?: {
    categories: string[] | null
    cover: string | null
  }[]
}

// Quicklink configuration
export interface QuicklinkConfig {
  enable: boolean
  timeout: number
  priority: boolean
  ignores: string[]
}

// Live2D configuration
export interface Live2DConfig {
  enable: boolean
  position: 'left' | 'right'
}

// Player configuration
export interface PlayerConfig {
  disable_on_mobile: boolean
  position: string
  aplayer: {
    enable: boolean
    options?: Record<string, any>
  }
  meting: {
    enable: boolean
    meting_api?: string
    options?: Record<string, any>
  }
}

// Pangu configuration
export interface PanguConfig {
  enable: boolean
}

// Material Theme configuration
export interface MaterialThemeConfig {
  enable: boolean
}

// Internal Theme configuration
export interface InternalThemeConfig {
  light: Record<string, string>
  dark: Record<string, string>
}

// Main blog configuration
export interface BlogConfig {
  // Basic configuration
  menu: MenuItem[]
  mainSections: string[]
  yearFormat: string
  monthFormat: string
  dateFormat: string
  timeFormat: string
  author: string
  email: string
  description: string
  subtitle: string
  banner: string
  banner_srcset?: BannerSrcsetConfig
  avatar: string
  cover?: string | boolean
  toc: boolean
  open_graph?: OpenGraphConfig
  excerpt_link?: string
  injector?: InjectorConfig
  copyright?: string

  // Footer configuration
  footer: FooterConfig

  // Sidebar configuration
  sidebar: 'left' | 'right'
  social: Record<string, string>
  widgets: string[]
  category_limits?: number
  tag_limits?: number
  recent_posts_limits?: number
  tagcloud_limits?: number
  only_show_capsule_in_index?: boolean
  show_update_time?: boolean

  // Summary configuration
  summary?: SummaryConfig

  // Triangle badge
  triangle_badge?: TriangleBadgeConfig

  // RSS
  rss?: RssConfig

  // Sort order
  sort_order?: SortOrderConfig

  // Layout
  layout?: LayoutConfig

  // Style configuration
  anchor_icon?: string | boolean
  reimu_cursor: CursorConfig
  icon_font?: string | boolean
  custom_font?: CustomFontConfig
  font?: FontConfig
  local_font?: LocalFontConfig
  dark_mode: DarkModeConfig

  // Analytics
  baidu_analytics?: string | boolean
  google_analytics?: string | boolean
  clarity?: string | boolean

  // Markdown
  mermaid?: MermaidConfig
  code_block?: CodeBlockConfig
  math?: MathConfig

  // Feature configuration
  comment: CommentConfig
  valine?: ValineConfig
  waline?: WalineConfig
  twikoo?: TwikooConfig
  gitalk?: GitalkConfig
  giscus?: GiscusConfig
  disqus?: DisqusConfig
  algolia_search: AlgoliaConfig

  // Animation configuration
  preloader: PreloaderConfig
  animation: AnimationConfig
  firework: FireworkConfig

  // Extended features
  article_copyright: CopyrightConfig
  clipboard?: ClipboardConfig
  top?: TopConfig
  outdate?: OutdateConfig
  icp?: IcpConfig
  moe_icp?: MoeIcpConfig
  sponsor: SponsorConfig
  share: string[]
  home_categories?: HomeCategoriesConfig

  // Experimental
  pjax?: { enable: boolean }
  quicklink?: QuicklinkConfig
  service_worker?: { enable: boolean }
  live2d?: Live2DConfig
  live2d_widgets?: Live2DConfig
  pace?: { enable: boolean }
  player?: PlayerConfig
  pangu?: PanguConfig
  material_theme?: MaterialThemeConfig
  internal_theme?: InternalThemeConfig

  // Allow additional properties
  [key: string]: unknown
}