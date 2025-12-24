import type { BlogConfig } from '../../../shared/types'
import { ConfigSection, TextField, TextAreaField, ImageField } from './FormFields'

interface Props {
  config: BlogConfig
  onChange: (field: string, value: any) => void
}

export function BasicSettings({ config, onChange }: Props) {
  return (
    <div className="space-y-6">
      <ConfigSection title="基础配置">
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="作者"
            value={config.author || ''}
            onChange={(v) => onChange('author', v)}
          />
          <TextField
            label="邮箱"
            value={config.email || ''}
            onChange={(v) => onChange('email', v)}
          />
          <TextField
            label="网站副标题"
            value={config.subtitle || ''}
            onChange={(v) => onChange('subtitle', v)}
            className="col-span-2"
          />
          <TextAreaField
            label="网站描述"
            value={config.description || ''}
            onChange={(v) => onChange('description', v)}
            className="col-span-2"
          />
        </div>
      </ConfigSection>

      <ConfigSection title="图片配置">
        <div className="grid grid-cols-2 gap-4">
          <ImageField
            label="横幅图片"
            value={config.banner || ''}
            onChange={(v) => onChange('banner', v)}
          />
          <ImageField
            label="头像"
            value={config.avatar || ''}
            onChange={(v) => onChange('avatar', v)}
          />
        </div>
      </ConfigSection>
    </div>
  )
}
