// Post metadata
export interface PostMeta {
  title: string
  date: string
  draft: boolean
  categories?: string[]
  tags?: string[]
  cover?: string
  description?: string
  toc?: boolean
  math?: boolean
  mermaid?: boolean
  sticky?: number
}

// Front-matter extends PostMeta
export interface FrontMatter extends PostMeta {
  lastmod?: string
}

// Request to create a new post
export interface CreatePostRequest {
  title: string
  date: string
  categories?: string[]
  tags?: string[]
  cover?: string
  description?: string
  draft?: boolean
}

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
