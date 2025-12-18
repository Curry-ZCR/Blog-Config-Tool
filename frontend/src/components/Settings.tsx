import { useState } from 'react'
import { useApp, useToast } from '../context'
import { setBlogPath, validateBlogPath } from '../services/api'

export function Settings() {
  const { state, dispatch } = useApp()
  const { showToast } = useToast()
  const [newPath, setNewPath] = useState(state.blogPath || '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleUpdatePath = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate the path first
      const validateResult = await validateBlogPath(newPath)
      if (!validateResult.valid) {
        setError(validateResult.errors?.join(', ') || '路径验证失败')
        setLoading(false)
        return
      }

      // Set the new path
      const result = await setBlogPath(newPath)
      if (result.success) {
        dispatch({ type: 'SET_BLOG_PATH', payload: newPath })
        dispatch({ type: 'SET_PATH_VALID', payload: true })
        showToast('success', '路径已更新，正在重新加载...')
        // Reload the page to refresh all data
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setError(result.error || '保存路径失败')
      }
    } catch {
      setError('发生网络错误，请检查连接后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">设置</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">博客路径配置</h2>
        
        <form onSubmit={handleUpdatePath}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hugo 博客根目录路径
            </label>
            <input
              type="text"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例如: C:\Users\username\my-blog"
            />
            <p className="mt-1 text-sm text-gray-500">
              请输入包含 hugo.toml 和 config/_default/params.yml 的目录路径
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !newPath.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '保存中...' : '更新路径'}
          </button>
        </form>
      </div>
    </div>
  )
}
