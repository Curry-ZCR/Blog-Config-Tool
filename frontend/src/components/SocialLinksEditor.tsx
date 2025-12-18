import { useState } from 'react'

// Predefined social platforms with icons
const SOCIAL_PLATFORMS = [
  { key: 'github', label: 'GitHub', icon: 'fab fa-github', placeholder: 'https://github.com/username' },
  { key: 'twitter', label: 'Twitter/X', icon: 'fab fa-twitter', placeholder: 'https://twitter.com/username' },
  { key: 'weibo', label: '微博', icon: 'fab fa-weibo', placeholder: 'https://weibo.com/username' },
  { key: 'bilibili', label: 'Bilibili', icon: 'fab fa-bilibili', placeholder: 'https://space.bilibili.com/uid' },
  { key: 'zhihu', label: '知乎', icon: 'fab fa-zhihu', placeholder: 'https://www.zhihu.com/people/username' },
  { key: 'email', label: '邮箱', icon: 'fas fa-envelope', placeholder: 'mailto:your@email.com' },
  { key: 'rss', label: 'RSS', icon: 'fas fa-rss', placeholder: '/index.xml' },
  { key: 'telegram', label: 'Telegram', icon: 'fab fa-telegram', placeholder: 'https://t.me/username' },
  { key: 'discord', label: 'Discord', icon: 'fab fa-discord', placeholder: 'https://discord.gg/invite' },
  { key: 'youtube', label: 'YouTube', icon: 'fab fa-youtube', placeholder: 'https://youtube.com/@channel' },
  { key: 'instagram', label: 'Instagram', icon: 'fab fa-instagram', placeholder: 'https://instagram.com/username' },
  { key: 'facebook', label: 'Facebook', icon: 'fab fa-facebook', placeholder: 'https://facebook.com/username' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'fab fa-linkedin', placeholder: 'https://linkedin.com/in/username' },
  { key: 'mastodon', label: 'Mastodon', icon: 'fab fa-mastodon', placeholder: 'https://mastodon.social/@username' },
]

interface SocialLinksEditorProps {
  links: Record<string, string>
  onChange: (links: Record<string, string>) => void
}

export function SocialLinksEditor({ links, onChange }: SocialLinksEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [customKey, setCustomKey] = useState('')
  const [customUrl, setCustomUrl] = useState('')

  // Get platforms that are already added
  const addedPlatforms = Object.keys(links)
  
  // Get platforms that can still be added
  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    (p) => !addedPlatforms.includes(p.key)
  )

  const handleUpdateLink = (key: string, url: string) => {
    onChange({ ...links, [key]: url })
  }

  const handleRemoveLink = (key: string) => {
    const newLinks = { ...links }
    delete newLinks[key]
    onChange(newLinks)
  }

  const handleAddPlatform = (key: string) => {
    onChange({ ...links, [key]: '' })
    setShowAddMenu(false)
  }

  const handleAddCustom = () => {
    if (customKey.trim() && !links[customKey.trim()]) {
      onChange({ ...links, [customKey.trim()]: customUrl.trim() })
      setCustomKey('')
      setCustomUrl('')
      setShowAddMenu(false)
    }
  }

  // Get platform info by key
  const getPlatformInfo = (key: string) => {
    return SOCIAL_PLATFORMS.find((p) => p.key === key) || {
      key,
      label: key,
      icon: 'fas fa-link',
      placeholder: 'https://...',
    }
  }

  return (
    <div className="space-y-3">
      {/* Existing Links */}
      {addedPlatforms.length === 0 ? (
        <p className="text-gray-500 text-sm">暂无社交链接</p>
      ) : (
        <div className="space-y-2">
          {addedPlatforms.map((key) => {
            const platform = getPlatformInfo(key)
            return (
              <div key={key} className="flex items-center gap-2">
                <div className="w-32 flex items-center text-sm text-gray-700">
                  <i className={`${platform.icon} mr-2 w-4 text-center`}></i>
                  {platform.label}
                </div>
                <input
                  type="text"
                  value={links[key] || ''}
                  onChange={(e) => handleUpdateLink(key, e.target.value)}
                  placeholder={platform.placeholder}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveLink(key)}
                  className="p-2 text-gray-400 hover:text-red-600"
                  title="删除"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加社交链接
        </button>

        {/* Add Menu Dropdown */}
        {showAddMenu && (
          <div className="absolute left-0 top-full mt-1 w-80 bg-white border rounded-lg shadow-lg z-10">
            <div className="p-2 border-b">
              <p className="text-xs font-medium text-gray-500 uppercase">常用平台</p>
            </div>
            <div className="max-h-48 overflow-y-auto p-2">
              {availablePlatforms.length === 0 ? (
                <p className="text-sm text-gray-400 p-2">所有平台已添加</p>
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {availablePlatforms.map((platform) => (
                    <button
                      key={platform.key}
                      type="button"
                      onClick={() => handleAddPlatform(platform.key)}
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <i className={`${platform.icon} mr-2 w-4 text-center`}></i>
                      {platform.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Custom Platform */}
            <div className="p-3 border-t bg-gray-50">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">自定义</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="名称"
                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="URL"
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={handleAddCustom}
                  disabled={!customKey.trim()}
                  className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  添加
                </button>
              </div>
            </div>

            {/* Close button */}
            <div className="p-2 border-t">
              <button
                type="button"
                onClick={() => setShowAddMenu(false)}
                className="w-full px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
