import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp, ToastProvider } from './context'
import { Layout, BlogPathSetup, ConfigEditor, PostCreator, Settings } from './components'

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    </div>
  )
}

// Connection error component
function ConnectionError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md mx-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">连接失败</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          重试
        </button>
      </div>
    </div>
  )
}

// Protected route wrapper - redirects to setup if no valid path
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useApp()

  if (state.loading) {
    return <LoadingSpinner />
  }

  if (!state.isPathValid) {
    return <Navigate to="/setup" replace />
  }

  return <>{children}</>
}

// Main app routes
function AppRoutes() {
  const { state } = useApp()

  if (state.loading) {
    return <LoadingSpinner />
  }

  if (state.error && !state.isPathValid) {
    return <ConnectionError error={state.error} onRetry={() => window.location.reload()} />
  }

  return (
    <Routes>
      {/* Setup route - always accessible */}
      <Route path="/setup" element={<BlogPathSetup />} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<ConfigEditor />} />
        <Route path="/posts" element={<PostCreator />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
