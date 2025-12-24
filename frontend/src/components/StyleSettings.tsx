import type { BlogConfig } from '../../../shared/types'
import { ConfigSection, CheckboxField, SelectField, TextField, TextAreaField } from './FormFields'

interface Props {
  config: BlogConfig
  onChange: (field: string, value: any) => void
  onNestedChange: (parent: string, field: string, value: any) => void
}

export function StyleSettings({ config, onChange, onNestedChange }: Props) {
  const getArrayString = (arr?: string[]) => {
    return Array.isArray(arr) ? arr.join('\n') : ''
  }

  return (
    <div className="space-y-6">
      <ConfigSection title="布局与侧边栏">
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="侧边栏位置"
            value={config.sidebar || 'right'}
            options={[
              { value: 'left', label: '左侧' },
              { value: 'right', label: '右侧' },
            ]}
            onChange={(v) => onChange('sidebar', v)}
          />
          <CheckboxField
            label="显示文章目录 (TOC)"
            checked={config.toc ?? true}
            onChange={(v) => onChange('toc', v)}
          />
        </div>
      </ConfigSection>

      <ConfigSection title="外观样式">
        <div className="grid grid-cols-2 gap-4">
          <CheckboxField
            label="自定义鼠标指针"
            checked={config.reimu_cursor?.enable ?? false}
            onChange={(v) => onNestedChange('reimu_cursor', 'enable', v)}
          />
          <SelectField
            label="暗黑模式"
            value={config.dark_mode?.enable === 'auto' ? 'auto' : (config.dark_mode?.enable ? 'true' : 'false')}
            options={[
              { value: 'true', label: '启用' },
              { value: 'false', label: '禁用' },
              { value: 'auto', label: '自动' },
            ]}
            onChange={(v) => {
              const val = v === 'auto' ? 'auto' : v === 'true'
              onNestedChange('dark_mode', 'enable', val)
            }}
          />
        </div>
      </ConfigSection>

      <ConfigSection title="字体与图标 (Fonts & Icons)">
        <div className="space-y-6">
           <div className="space-y-4">
              <TextField
                label="Iconfont 项目 ID"
                value={typeof config.icon_font === 'string' ? config.icon_font : ''}
                onChange={(v) => onChange('icon_font', v)}
                placeholder="例如: 4552607_xxxxxx"
              />
              <p className="text-xs text-gray-500">留空则使用默认 FontAwesome</p>
           </div>

           <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Google Fonts</h3>
              <div className="grid grid-cols-1 gap-4">
                 <CheckboxField
                    label="启用 Google Fonts"
                    checked={config.font?.enable ?? true}
                    onChange={(v) => onNestedChange('font', 'enable', v)}
                 />
                 {config.font?.enable && (
                    <div className="grid grid-cols-2 gap-4">
                       <TextAreaField
                          label="文章字体 (每行一个)"
                          value={getArrayString(config.font?.article)}
                          onChange={(v) => {
                             const font = config.font || { enable: true, article: [], code: [] }
                             onChange('font', { ...font, article: v.split('\n').map(s => s.trim()).filter(Boolean) })
                          }}
                       />
                       <TextAreaField
                          label="代码字体 (每行一个)"
                          value={getArrayString(config.font?.code)}
                          onChange={(v) => {
                             const font = config.font || { enable: true, article: [], code: [] }
                             onChange('font', { ...font, code: v.split('\n').map(s => s.trim()).filter(Boolean) })
                          }}
                       />
                    </div>
                 )}
              </div>
           </div>

           <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">自定义字体 (Custom Fonts)</h3>
              <div className="grid grid-cols-1 gap-4">
                 <CheckboxField
                    label="启用自定义字体"
                    checked={config.custom_font?.enable ?? false}
                    onChange={(v) => onNestedChange('custom_font', 'enable', v)}
                 />
                 {config.custom_font?.enable && (
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <p className="text-xs font-bold text-gray-600">文章字体</p>
                          <TextField
                             label="字体名称 (Name)"
                             value={config.custom_font?.article?.name || ''}
                             onChange={(v) => {
                                const cf = config.custom_font || { enable: true }
                                const article = cf.article || { name: '', css: '' }
                                onChange('custom_font', { ...cf, article: { ...article, name: v } })
                             }}
                          />
                          <TextField
                             label="CSS URL"
                             value={config.custom_font?.article?.css || ''}
                             onChange={(v) => {
                                const cf = config.custom_font || { enable: true }
                                const article = cf.article || { name: '', css: '' }
                                onChange('custom_font', { ...cf, article: { ...article, css: v } })
                             }}
                          />
                       </div>
                       <div className="space-y-2">
                          <p className="text-xs font-bold text-gray-600">代码字体</p>
                          <TextField
                             label="字体名称 (Name)"
                             value={config.custom_font?.code?.name || ''}
                             onChange={(v) => {
                                const cf = config.custom_font || { enable: true }
                                const code = cf.code || { name: '', css: '' }
                                onChange('custom_font', { ...cf, code: { ...code, name: v } })
                             }}
                          />
                          <TextField
                             label="CSS URL"
                             value={config.custom_font?.code?.css || ''}
                             onChange={(v) => {
                                const cf = config.custom_font || { enable: true }
                                const code = cf.code || { name: '', css: '' }
                                onChange('custom_font', { ...cf, code: { ...code, css: v } })
                             }}
                          />
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </ConfigSection>
    </div>
  )
}