import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import type { ImageInfo } from '../../../shared/types'

interface ImagePickerProps {
  value: string
  onChange: (path: string) => void
  onClose: () => void
  allowUrl?: boolean
}

export function ImagePicker({ value, onChange, onClose, allowUrl = true }: ImagePickerProps) {
  const { state } = useApp()
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [activeTab, setActiveTab] = useState<'browse' | 'url'>('browse')

  // Group images by folder
  const imagesByFolder = useMemo(() => {
    const grouped: Record<string, ImageInfo[]> = {}
    for (const image of state.images) {
      const folder = image.folder || 'root'
      if (!grouped[folder]) {
        grouped[folder] = []
      }
      grouped[folder].push(image)
    }
    return grouped
  }, [state.images])

  const folders = Object.keys(imagesByFolder).sort()
  const currentImages = selectedFolder ? imagesByFolder[selectedFolder] || [] : []

  const handleSelectImage = (image: ImageInfo) => {
    onChange(image.path)
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">选择图片</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        {allowUrl && (
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'browse'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              浏览图片
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'url'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              输入 URL
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {activeTab === 'browse' ? (
            <>
              {/* Folder List */}
              <div className="w-48 border-r overflow-y-auto bg-gray-50">
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2 px-2">文件夹</p>
                  {folders.length === 0 ? (
                    <p className="text-sm text-gray-400 px-2">暂无图片</p>
                  ) : (
                    <ul className="space-y-1">
                      {folders.map((folder) => (
                        <li key={folder}>
                          <button
                            onClick={() => setSelectedFolder(folder)}
                            className={`w-full text-left px-3 py-2 rounded text-sm ${
                              selectedFolder === folder
                                ? 'bg-blue-100 text-blue-700'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <span className="mr-2">📁</span>
                            {folder === 'root' ? '根目录' : folder}
                            <span className="ml-1 text-xs text-gray-400">
                              ({imagesByFolder[folder].length})
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Image Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {!selectedFolder ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>请选择一个文件夹</p>
                  </div>
                ) : currentImages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>该文件夹中没有图片</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    {currentImages.map((image) => (
                      <ImageCard
                        key={image.path}
                        image={image}
                        isSelected={value === image.path}
                        onSelect={() => handleSelectImage(image)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* URL Input */
            <div className="flex-1 p-6">
              <div className="max-w-lg mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  图片 URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-2 text-sm text-gray-500">
                  输入外部图片的完整 URL 地址
                </p>
                
                {urlInput && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">预览：</p>
                    <img
                      src={urlInput}
                      alt="Preview"
                      className="max-w-full h-48 object-contain border rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">加载失败</text></svg>'
                      }}
                    />
                  </div>
                )}

                <button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  使用此 URL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {value && <span>已选择: {value}</span>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


// Image Card Component
function ImageCard({
  image,
  isSelected,
  onSelect,
}: {
  image: ImageInfo
  isSelected: boolean
  onSelect: () => void
}) {
  const [imageError, setImageError] = useState(false)

  // Construct the image URL for preview
  const imageUrl = image.path.startsWith('http')
    ? image.path
    : `http://localhost:3001/static${image.path}`

  return (
    <button
      onClick={onSelect}
      className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-transparent hover:border-gray-300'
      }`}
    >
      <div className="aspect-square bg-gray-100">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={image.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>
      
      {/* Overlay with info */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="text-white text-xs truncate">{image.name}</p>
        {image.dimensions && (
          <p className="text-white/70 text-xs">
            {image.dimensions.width}×{image.dimensions.height}
          </p>
        )}
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  )
}
