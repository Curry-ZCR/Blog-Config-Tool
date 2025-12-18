import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, useToast } from '../context'
import { setBlogPath, validateBlogPath } from '../services/api'

export function BlogPathSetup() {
  const { state, dispatch, refreshAll } = useApp()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [path, setPath] = useState(state.blogPath || '')
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setLoading(true)

    try {
      // Validate the path first
      const validateResult = await validateBlogPath(path)
      
      if (!validateResult.valid) {
        setErrors(validateResult.errors || ['路径验证失败'])
        setLoading(false)
        return
      }

      // Set the blog path
      const result = await setBlogPath(path)
      
      if (result.success) {
        dispatch({ type: 'SET_BLOG_PATH', payload: path })
        dispatch({ type: 'SET_PATH_VALID', payload: true })
        showToast('success', '博客路径设置成功！正在加载...')
        // Load all data with new path and navigate
        await refreshAll()
        navigate('/', { replace: true })
      } else {
        setErrors([result.error || '保存路径失败'])
      }
    } catch {
      setErrors(['发生网络错误，请检查连接后重试'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Blog Config Tool</h1>
            <p className="text-gray-500 mt-2">Hugo 博客可视化配置工具</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                博客根目录路径
              </label>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="例如: C:\Users\username\my-blog"
                autoFocus
              />
              <p className="mt-2 text-sm text-gray-500">
                请输入 Hugo 博客的根目录路径，该目录应包含 hugo.toml 配置文件
              </p>
            </div>

            {/* Validation Requirements */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">路径要求：</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <span className="mr-2">📄</span>
                  包含 hugo.toml 文件
                </li>
                <li className="flex items-center">
                  <span className="mr-2">📁</span>
                  包含 config/_default/params.yml 文件
                </li>
              </ul>
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-700 mb-2">验证失败：</p>
                <ul className="text-sm text-red-600 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">❌</span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !path.trim()}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  验证中...
                </span>
              ) : (
                '开始使用'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-400">
            支持 Reimu 主题的 Hugo 博客
          </p>
        </div>
      </div>
    </div>
  )
}
