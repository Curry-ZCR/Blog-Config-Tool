import { useState } from 'react'
import { useApp, useToast } from '../context'
import { updateConfig } from '../services/api'
import type { BlogConfig } from '../../../shared/types'
import { MenuEditor } from './MenuEditor'
import { SocialLinksEditor } from './SocialLinksEditor'
import { ImagePicker } from './ImagePicker'
import { Preview } from './Preview'

export function ConfigEditor() {
  const { state, refreshConfig } = useApp()
  const { showToast } = useToast()
  const [editedConfig, setEditedConfig] = useState<BlogConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Use edited config or original config
  const config = editedConfig || state.config

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">加载配置中...</p>
      </div>
    )
  }

  const handleFieldChange = (field: string, value: unknown) => {
    setEditedConfig((prev) => ({
      ...(prev || state.config!),
      [field]: value,
    }))
    setSuccess(false)
  }

  const handleNestedFieldChange = (parent: string, field: string, value: unknown) => {
    setEditedConfig((prev) => {
      const current = prev || state.config!
      return {
        ...current,
        [parent]: {
          ...(current[parent] as Record<string, unknown>),
          [field]: value,
        },
      }
    })
    setSuccess(false)
  }

  const handleSave = async () => {
    if (!editedConfig) return

    setSaving(true)

    try {
      const result = await updateConfig(editedConfig)
      if (result.success) {
        showToast('success', '配置已保存成功！')
        await refreshConfig()
        setEditedConfig(null)
      } else {
        showToast('error', result.error || '保存失败')
      }
    } catch {
      showToast('error', '保存时发生网络错误，请检查连接后重试')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setEditedConfig(null)
    showToast('info', '已重置为原始配置')
  }

  const hasChanges = editedConfig !== null

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">配置编辑</h1>
        <div className="flex gap-2">
          {hasChanges && (
            <>
              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                预览更改
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                重置
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Settings Section */}
        <ConfigSection title="基本设置">
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="作者"
              value={config.author || ''}
              onChange={(v) => handleFieldChange('author', v)}
            />
            <TextField
              label="邮箱"
              value={config.email || ''}
              onChange={(v) => handleFieldChange('email', v)}
            />
            <TextField
              label="副标题"
              value={config.subtitle || ''}
              onChange={(v) => handleFieldChange('subtitle', v)}
              className="col-span-2"
            />
            <TextAreaField
              label="描述"
              value={config.description || ''}
              onChange={(v) => handleFieldChange('description', v)}
              className="col-span-2"
            />
          </div>
        </ConfigSection>

        {/* Images Section */}
        <ConfigSection title="图片设置">
          <div className="grid grid-cols-2 gap-4">
            <ImageField
              label="横幅图片"
              value={config.banner || ''}
              onChange={(v) => handleFieldChange('banner', v)}
            />
            <ImageField
              label="头像"
              value={config.avatar || ''}
              onChange={(v) => handleFieldChange('avatar', v)}
            />
          </div>
        </ConfigSection>

        {/* Menu Section */}
        <ConfigSection title="菜单配置">
          <MenuEditor
            items={config.menu || []}
            onChange={(items) => handleFieldChange('menu', items)}
          />
        </ConfigSection>

        {/* Social Links Section */}
        <ConfigSection title="社交链接">
          <SocialLinksEditor
            links={config.social || {}}
            onChange={(links) => handleFieldChange('social', links)}
          />
        </ConfigSection>

        {/* Footer Section */}
        <ConfigSection title="页脚设置">
          <div className="grid grid-cols-2 gap-4">
            <NumberField
              label="建站年份"
              value={config.footer?.since || new Date().getFullYear()}
              onChange={(v) => handleNestedFieldChange('footer', 'since', v)}
            />
            <CheckboxField
              label="显示 Powered by"
              checked={config.footer?.powered ?? true}
              onChange={(v) => handleNestedFieldChange('footer', 'powered', v)}
            />
            <CheckboxField
              label="显示访问计数"
              checked={config.footer?.count ?? false}
              onChange={(v) => handleNestedFieldChange('footer', 'count', v)}
            />
            <CheckboxField
              label="启用不蒜子统计"
              checked={config.footer?.busuanzi ?? false}
              onChange={(v) => handleNestedFieldChange('footer', 'busuanzi', v)}
            />
          </div>
        </ConfigSection>

        {/* Style Section */}
        <ConfigSection title="样式设置">
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="侧边栏位置"
              value={config.sidebar || 'right'}
              options={[
                { value: 'left', label: '左侧' },
                { value: 'right', label: '右侧' },
              ]}
              onChange={(v) => handleFieldChange('sidebar', v)}
            />
            <CheckboxField
              label="显示目录"
              checked={config.toc ?? true}
              onChange={(v) => handleFieldChange('toc', v)}
            />
            <CheckboxField
              label="启用自定义光标"
              checked={config.reimu_cursor?.enable ?? false}
              onChange={(v) => handleNestedFieldChange('reimu_cursor', 'enable', v)}
            />
            <CheckboxField
              label="启用暗色模式"
              checked={config.dark_mode?.enable ?? true}
              onChange={(v) => handleNestedFieldChange('dark_mode', 'enable', v)}
            />
          </div>
        </ConfigSection>

        {/* Features Section */}
        <ConfigSection title="功能设置">
          <div className="grid grid-cols-2 gap-4">
            <CheckboxField
              label="启用评论"
              checked={config.comment?.enable ?? false}
              onChange={(v) => handleNestedFieldChange('comment', 'enable', v)}
            />
            <CheckboxField
              label="启用 Algolia 搜索"
              checked={config.algolia_search?.enable ?? false}
              onChange={(v) => handleNestedFieldChange('algolia_search', 'enable', v)}
            />
            <CheckboxField
              label="启用预加载动画"
              checked={config.preloader?.enable ?? true}
              onChange={(v) => handleNestedFieldChange('preloader', 'enable', v)}
            />
            <CheckboxField
              label="启用烟花效果"
              checked={config.firework?.enable ?? false}
              onChange={(v) => handleNestedFieldChange('firework', 'enable', v)}
            />
            <CheckboxField
              label="启用文章版权声明"
              checked={config.article_copyright?.enable ?? false}
              onChange={(v) => handleNestedFieldChange('article_copyright', 'enable', v)}
            />
            <CheckboxField
              label="启用赞助功能"
              checked={config.sponsor?.enable ?? false}
              onChange={(v) => handleNestedFieldChange('sponsor', 'enable', v)}
            />
          </div>
        </ConfigSection>
      </div>

      {/* Preview Modal */}
      {showPreview && editedConfig && (
        <Preview
          type="config"
          original={state.config!}
          modified={editedConfig}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}


// Helper Components

function ConfigSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  className = '',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  className = '',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  )
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label className="ml-2 text-sm text-gray-700">{label}</label>
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="图片路径或 URL"
        />
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          选择
        </button>
      </div>
      {value && (
        <div className="mt-2">
          <img
            src={value.startsWith('http') ? value : `/static${value}`}
            alt="Preview"
            className="h-20 w-auto object-cover rounded border"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}
      {showPicker && (
        <ImagePicker
          value={value}
          onChange={(path) => {
            onChange(path)
            setShowPicker(false)
          }}
          onClose={() => setShowPicker(false)}
          allowUrl
        />
      )}
    </div>
  )
}
