import { useState } from 'react'
import { useApp, useToast } from '../context'
import { updateConfig } from '../services/api'
import type { BlogConfig } from '../../../shared/types'
import { MenuEditor } from './MenuEditor'
import { SocialLinksEditor } from './SocialLinksEditor'
import { Preview } from './Preview'
import { BasicSettings } from './BasicSettings'
import { CommentSettings } from './CommentSettings'
import { MediaSettings } from './MediaSettings'
import { StyleSettings } from './StyleSettings'
import { FeatureSettings } from './FeatureSettings'
import { AdvancedSettings } from './AdvancedSettings'
import { ConfigSection } from './FormFields'

export function ConfigEditor() {
  const { state, refreshConfig } = useApp()
  const { showToast } = useToast()
  const [editedConfig, setEditedConfig] = useState<BlogConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'menu' | 'style' | 'feature' | 'comment' | 'media' | 'advanced'>('basic')

  // Use edited config or original config
  const config = editedConfig || state.config

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">正在加载配置...</p>
      </div>
    )
  }

  const handleFieldChange = (field: string, value: unknown) => {
    setEditedConfig((prev) => ({
      ...(prev || state.config!),
      [field]: value,
    }))
  }

  const handleNestedFieldChange = (parent: string, field: string, value: unknown) => {
    setEditedConfig((prev) => {
      const current = prev || state.config!
      return {
        ...current,
        [parent]: {
          ...(current[parent] as Record<string, unknown> || {}),
          [field]: value,
        },
      }
    })
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
      showToast('error', '保存失败，请检查网络连接或服务器状态')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setEditedConfig(null)
    showToast('info', '已重置未保存的修改')
  }

  const hasChanges = editedConfig !== null

  const tabs = [
    { id: 'basic', label: '基础配置' },
    { id: 'menu', label: '菜单与社交' },
    { id: 'style', label: '外观样式' },
    { id: 'feature', label: '功能设置' },
    { id: 'comment', label: '评论系统' },
    { id: 'media', label: '媒体与动画' },
    { id: 'advanced', label: '高级设置' },
  ] as const

  return (
    <div className="max-w-4xl pb-20">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">博客配置</h1>
        <div className="flex gap-2">
          {hasChanges && (
            <>
              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white shadow-sm transition-colors"
              >
                预览变更
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white shadow-sm transition-colors"
              >
                撤销修改
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
          >
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'basic' && (
          <BasicSettings
            config={config}
            onChange={handleFieldChange}
          />
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            <ConfigSection title="导航菜单配置">
              <MenuEditor
                items={config.menu || []}
                onChange={(items) => handleFieldChange('menu', items)}
              />
            </ConfigSection>
            <ConfigSection title="社交链接配置">
              <SocialLinksEditor
                links={config.social || {}}
                onChange={(links) => handleFieldChange('social', links)}
              />
            </ConfigSection>
          </div>
        )}

        {activeTab === 'style' && (
          <StyleSettings
            config={config}
            onChange={handleFieldChange}
            onNestedChange={handleNestedFieldChange}
          />
        )}

        {activeTab === 'feature' && (
          <FeatureSettings
            config={config}
            onChange={handleFieldChange}
            onNestedChange={handleNestedFieldChange}
          />
        )}

        {activeTab === 'comment' && (
          <CommentSettings
            config={config}
            onChange={handleFieldChange}
            onNestedChange={handleNestedFieldChange}
          />
        )}

        {activeTab === 'media' && (
          <MediaSettings
            config={config}
            onChange={handleFieldChange}
            onNestedChange={handleNestedFieldChange}
          />
        )}

        {activeTab === 'advanced' && (
          <AdvancedSettings
            config={config}
            onChange={handleFieldChange}
            onNestedChange={handleNestedFieldChange}
          />
        )}
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