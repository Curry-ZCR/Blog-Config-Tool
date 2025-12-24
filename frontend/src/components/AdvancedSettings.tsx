import type { BlogConfig } from '../../../shared/types'
import { ConfigSection, CheckboxField, TextAreaField, NumberField } from './FormFields'

interface Props {
  config: BlogConfig
  onChange: (field: string, value: any) => void
  onNestedChange: (parent: string, field: string, value: any) => void
}

export function AdvancedSettings({ config, onChange, onNestedChange }: Props) {
  // Helper to handle array <-> string conversion for ignored URLs in Quicklink
  const handleQuicklinkIgnoresChange = (value: string) => {
    const ignores = value.split('\n').map(s => s.trim()).filter(Boolean)
    const quicklink = config.quicklink || { enable: false, timeout: 3000, priority: true, ignores: [] }
    onChange('quicklink', { ...quicklink, ignores })
  }

  const getQuicklinkIgnoresString = (arr?: string[]) => {
    return Array.isArray(arr) ? arr.join('\n') : ''
  }

  return (
    <div className="space-y-6">
      <ConfigSection title="SPA 与性能优化">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <CheckboxField
              label="启用 PJAX (无刷新加载)"
              checked={config.pjax?.enable ?? false}
              onChange={(v) => onChange('pjax', { enable: v })}
            />
            <CheckboxField
              label="启用 Service Worker (离线支持)"
              checked={config.service_worker?.enable ?? false}
              onChange={(v) => onChange('service_worker', { enable: v })}
            />
             <CheckboxField
              label="启用 Pace 进度条"
              checked={config.pace?.enable ?? true}
              onChange={(v) => onChange('pace', { enable: v })}
            />
             <CheckboxField
              label="启用 Material Theme (动态色彩)"
              checked={config.material_theme?.enable ?? false}
              onChange={(v) => onChange('material_theme', { enable: v })}
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
             <div className="space-y-4">
                <CheckboxField
                  label="启用 Quicklink (预加载)"
                  checked={config.quicklink?.enable ?? false}
                  onChange={(v) => {
                     const quicklink = config.quicklink || { enable: false, timeout: 3000, priority: true, ignores: [] }
                     onChange('quicklink', { ...quicklink, enable: v })
                  }}
                />
                {config.quicklink?.enable && (
                   <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <NumberField
                        label="Timeout (ms)"
                        value={config.quicklink?.timeout || 3000}
                        onChange={(v) => {
                           const quicklink = config.quicklink || { enable: true, timeout: 3000, priority: true, ignores: [] }
                           onChange('quicklink', { ...quicklink, timeout: v })
                        }}
                      />
                      <CheckboxField
                        label="Priority (Fetch API)"
                        checked={config.quicklink?.priority ?? true}
                        onChange={(v) => {
                           const quicklink = config.quicklink || { enable: true, timeout: 3000, priority: true, ignores: [] }
                           onChange('quicklink', { ...quicklink, priority: v })
                        }}
                      />
                      <div className="col-span-2">
                        <TextAreaField
                           label="忽略的 URL (每行一个正则)"
                           value={getQuicklinkIgnoresString(config.quicklink?.ignores)}
                           onChange={handleQuicklinkIgnoresChange}
                        />
                      </div>
                   </div>
                )}
             </div>
          </div>
        </div>
      </ConfigSection>

      <ConfigSection title="代码注入 (Injector)">
        <div className="space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  警告：在此处注入的代码将直接执行。请确保输入的是安全的 HTML/JS 代码，避免 XSS 攻击。
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <TextAreaField
               label="Head Begin (在 <head> 标签后)"
               value={config.injector?.head_begin || ''}
               onChange={(v) => onNestedChange('injector', 'head_begin', v)}
             />
             <TextAreaField
               label="Head End (在 </head> 标签前)"
               value={config.injector?.head_end || ''}
               onChange={(v) => onNestedChange('injector', 'head_end', v)}
             />
             <TextAreaField
               label="Body Begin (在 <body> 标签后)"
               value={config.injector?.body_begin || ''}
               onChange={(v) => onNestedChange('injector', 'body_begin', v)}
             />
             <TextAreaField
               label="Body End (在 </body> 标签前)"
               value={config.injector?.body_end || ''}
               onChange={(v) => onNestedChange('injector', 'body_end', v)}
             />
             <TextAreaField
               label="Sidebar Begin (侧边栏开始)"
               value={config.injector?.sidebar_begin || ''}
               onChange={(v) => onNestedChange('injector', 'sidebar_begin', v)}
             />
             <TextAreaField
               label="Sidebar End (侧边栏结束)"
               value={config.injector?.sidebar_end || ''}
               onChange={(v) => onNestedChange('injector', 'sidebar_end', v)}
             />
          </div>
        </div>
      </ConfigSection>
    </div>
  )
}