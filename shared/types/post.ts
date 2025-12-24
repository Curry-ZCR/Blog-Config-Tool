// Post metadata
export interface PostMeta {
  title: string
  date: string
  lastmod?: string
  summary?: string
  weight?: number
  categories?: string[]
  tags?: string[]
  description?: string
  mermaid?: boolean
  math?: boolean
  link?: string
  copyright?: boolean
  sponsor?: boolean
  comments?: boolean
  photos?: string[]
  sidebar?: 'left' | 'right' | false
  toc?: boolean
  outdated?: boolean
  author?: string
  keywords?: string[]
  cover?: string
  draft?: boolean
}

// Front-matter extends PostMeta
export interface FrontMatter extends PostMeta {}

// Request to create a new post
export interface CreatePostRequest extends PostMeta {}

// Response after creating a post
export interface CreatePostResponse {
  success: boolean
  filePath?: string
  error?: string
}

// Response for getting posts list
export interface GetPostsResponse {
  success: boolean
  posts: PostMeta[]
  error?: string
}