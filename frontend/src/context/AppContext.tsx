import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import type { BlogConfig, ImageInfo, PostMeta } from '../../../shared/types'
import { getBlogPath, getConfig, getImages, getPosts } from '../services/api'

// Application state interface
export interface AppState {
  blogPath: string | null
  isPathValid: boolean
  config: BlogConfig | null
  images: ImageInfo[]
  posts: PostMeta[]
  loading: boolean
  error: string | null
}

// Action types
export type AppAction =
  | { type: 'SET_BLOG_PATH'; payload: string | null }
  | { type: 'SET_PATH_VALID'; payload: boolean }
  | { type: 'SET_CONFIG'; payload: BlogConfig | null }
  | { type: 'SET_IMAGES'; payload: ImageInfo[] }
  | { type: 'SET_POSTS'; payload: PostMeta[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' }

// Initial state
const initialState: AppState = {
  blogPath: null,
  isPathValid: false,
  config: null,
  images: [],
  posts: [],
  loading: true,
  error: null,
}

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_BLOG_PATH':
      return { ...state, blogPath: action.payload }
    case 'SET_PATH_VALID':
      return { ...state, isPathValid: action.payload }
    case 'SET_CONFIG':
      return { ...state, config: action.payload }
    case 'SET_IMAGES':
      return { ...state, images: action.payload }
    case 'SET_POSTS':
      return { ...state, posts: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'RESET_STATE':
      return { ...initialState, loading: false }
    default:
      return state
  }
}


// Context interface
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  refreshConfig: () => Promise<void>
  refreshImages: () => Promise<void>
  refreshPosts: () => Promise<void>
  refreshAll: () => Promise<void>
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined)

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      try {
        // First, check if blog path is set
        const pathResponse = await getBlogPath()
        
        if (pathResponse.success && pathResponse.data) {
          dispatch({ type: 'SET_BLOG_PATH', payload: pathResponse.data })
          dispatch({ type: 'SET_PATH_VALID', payload: true })
          
          // Load config, images, and posts
          const [configRes, imagesRes, postsRes] = await Promise.all([
            getConfig(),
            getImages(),
            getPosts(),
          ])
          
          if (configRes.success) {
            dispatch({ type: 'SET_CONFIG', payload: configRes.data })
          } else {
            console.warn('Failed to load config:', configRes.error)
          }
          if (imagesRes.success) {
            dispatch({ type: 'SET_IMAGES', payload: imagesRes.images })
          } else {
            console.warn('Failed to load images:', imagesRes.error)
          }
          if (postsRes.success) {
            dispatch({ type: 'SET_POSTS', payload: postsRes.posts })
          } else {
            console.warn('Failed to load posts:', postsRes.error)
          }
        } else {
          dispatch({ type: 'SET_PATH_VALID', payload: false })
        }
      } catch (error) {
        console.error('Failed to load initial data:', error)
        dispatch({ type: 'SET_ERROR', payload: '无法连接到服务器，请确保后端服务正在运行' })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
    
    loadInitialData()
  }, [])

  // Refresh functions
  const refreshConfig = async () => {
    const response = await getConfig()
    if (response.success) {
      dispatch({ type: 'SET_CONFIG', payload: response.data })
    }
  }

  const refreshImages = async () => {
    const response = await getImages()
    if (response.success) {
      dispatch({ type: 'SET_IMAGES', payload: response.images })
    }
  }

  const refreshPosts = async () => {
    const response = await getPosts()
    if (response.success) {
      dispatch({ type: 'SET_POSTS', payload: response.posts })
    }
  }

  const refreshAll = async () => {
    await Promise.all([refreshConfig(), refreshImages(), refreshPosts()])
  }

  return (
    <AppContext.Provider value={{ state, dispatch, refreshConfig, refreshImages, refreshPosts, refreshAll }}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
