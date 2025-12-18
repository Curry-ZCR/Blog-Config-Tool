import type { BlogConfig } from '../../../shared/types'

interface PreviewProps {
  type: 'config' | 'frontmatter'
  original?: BlogConfig
  modified?: BlogConfig
  frontmatter?: string
  onClose: () => void
}

export function Preview({ type, original, modified, frontmatter, onClose }: PreviewProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {type === 'config' ? '配置更改预览' : 'Front-matter 预览'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {type === 'config' && original && modified ? (
            <ConfigDiff original={original} modified={modified} />
          ) : type === 'frontmatter' && frontmatter ? (
            <FrontmatterPreview content={frontmatter} />
          ) : (
            <p className="text-gray-500">无预览内容</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

// Config Diff Component
function ConfigDiff({ original, modified }: { original: BlogConfig; modified: BlogConfig }) {
  const changes = getConfigChanges(original, modified)

  if (changes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>没有检测到更改</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        检测到 {changes.length} 处更改
      </p>
      
      <div className="space-y-3">
        {changes.map((change, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b">
              <span className="font-medium text-gray-700">{change.path}</span>
            </div>
            <div className="p-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">原值</p>
                <div className="bg-red-50 p-2 rounded text-sm font-mono text-red-700 break-all">
                  {formatValue(change.oldValue)}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">新值</p>
                <div className="bg-green-50 p-2 rounded text-sm font-mono text-green-700 break-all">
                  {formatValue(change.newValue)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Frontmatter Preview Component
function FrontmatterPreview({ content }: { content: string }) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        以下是将要生成的 Front-matter 内容：
      </p>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
        {content}
      </pre>
    </div>
  )
}

// Helper: Get changes between two config objects
interface ConfigChange {
  path: string
  oldValue: unknown
  newValue: unknown
}

function getConfigChanges(original: BlogConfig, modified: BlogConfig): ConfigChange[] {
  const changes: ConfigChange[] = []
  
  function compare(obj1: unknown, obj2: unknown, path: string) {
    if (obj1 === obj2) return
    
    if (typeof obj1 !== typeof obj2) {
      changes.push({ path, oldValue: obj1, newValue: obj2 })
      return
    }
    
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (JSON.stringify(obj1) !== JSON.stringify(obj2)) {
        changes.push({ path, oldValue: obj1, newValue: obj2 })
      }
      return
    }
    
    if (typeof obj1 === 'object' && obj1 !== null && obj2 !== null) {
      const keys = new Set([...Object.keys(obj1 as object), ...Object.keys(obj2 as object)])
      for (const key of keys) {
        compare(
          (obj1 as Record<string, unknown>)[key],
          (obj2 as Record<string, unknown>)[key],
          path ? `${path}.${key}` : key
        )
      }
      return
    }
    
    if (obj1 !== obj2) {
      changes.push({ path, oldValue: obj1, newValue: obj2 })
    }
  }
  
  compare(original, modified, '')
  return changes
}

// Helper: Format value for display
function formatValue(value: unknown): string {
  if (value === undefined) return '(未定义)'
  if (value === null) return '(空)'
  if (typeof value === 'boolean') return value ? '是' : '否'
  if (typeof value === 'string') return value || '(空字符串)'
  if (Array.isArray(value)) {
    if (value.length === 0) return '(空数组)'
    return JSON.stringify(value, null, 2)
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}
