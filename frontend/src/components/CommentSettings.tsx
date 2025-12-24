import type { BlogConfig } from '../../../shared/types'
import { ConfigSection, CheckboxField, SelectField, TextField, NumberField } from './FormFields'

interface Props {
  config: BlogConfig
  onChange: (field: string, value: any) => void
  onNestedChange: (parent: string, field: string, value: any) => void
}

export function CommentSettings({ config, onNestedChange }: Props) {
  const providers = [
    { value: 'valine', label: 'Valine' },
    { value: 'waline', label: 'Waline' },
    { value: 'twikoo', label: 'Twikoo' },
    { value: 'gitalk', label: 'Gitalk' },
    { value: 'giscus', label: 'Giscus' },
    { value: 'disqus', label: 'Disqus' },
  ]

  return (
    <div className="space-y-6">
      <ConfigSection title="评论系统全局配置">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <CheckboxField
              label="启用评论系统"
              checked={config.comment?.enable ?? false}
              onChange={(v) => onNestedChange('comment', 'enable', v)}
            />
            <SelectField
              label="默认显示系统"
              value={config.comment?.default || 'waline'}
              options={providers}
              onChange={(v) => onNestedChange('comment', 'default', v)}
            />
          </div>
          {config.comment?.enable && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <TextField
                label="评论框标题 (zh-CN)"
                value={config.comment?.title?.['zh-CN'] || ''}
                onChange={(v) => {
                  const title = config.comment?.title || {}
                  onNestedChange('comment', 'title', { ...title, 'zh-CN': v })
                }}
              />
              <TextField
                label="评论框标题 (en)"
                value={config.comment?.title?.['en'] || ''}
                onChange={(v) => {
                  const title = config.comment?.title || {}
                  onNestedChange('comment', 'title', { ...title, 'en': v })
                }}
              />
            </div>
          )}
        </div>
      </ConfigSection>

      {config.comment?.enable && (
        <>
          {/* Waline */}
          <ConfigSection title="Waline 配置">
            <div className="space-y-4">
              <CheckboxField
                label="启用 Waline"
                checked={config.waline?.enable ?? false}
                onChange={(v) => onNestedChange('waline', 'enable', v)}
              />
              {config.waline?.enable && (
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <TextField
                    label="Server URL"
                    value={config.waline?.serverURL || ''}
                    onChange={(v) => onNestedChange('waline', 'serverURL', v)}
                    placeholder="https://your-waline-url.vercel.app"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <NumberField
                      label="每页评论数"
                      value={config.waline?.pageSize || 10}
                      onChange={(v) => onNestedChange('waline', 'pageSize', v)}
                    />
                    <CheckboxField
                      label="启用阅读量统计"
                      checked={config.waline?.pageview ?? true}
                      onChange={(v) => onNestedChange('waline', 'pageview', v)}
                    />
                  </div>
                </div>
              )}
            </div>
          </ConfigSection>

          {/* Valine */}
          <ConfigSection title="Valine 配置">
            <div className="space-y-4">
              <CheckboxField
                label="启用 Valine"
                checked={config.valine?.enable ?? false}
                onChange={(v) => onNestedChange('valine', 'enable', v)}
              />
              {config.valine?.enable && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <TextField
                    label="App ID"
                    value={config.valine?.appId || ''}
                    onChange={(v) => onNestedChange('valine', 'appId', v)}
                  />
                  <TextField
                    label="App Key"
                    value={config.valine?.appKey || ''}
                    onChange={(v) => onNestedChange('valine', 'appKey', v)}
                  />
                  <TextField
                    label="Placeholder"
                    value={config.valine?.placeholder || ''}
                    onChange={(v) => onNestedChange('valine', 'placeholder', v)}
                  />
                  <TextField
                    label="Server URLs (可选)"
                    value={config.valine?.serverURLs || ''}
                    onChange={(v) => onNestedChange('valine', 'serverURLs', v)}
                  />
                </div>
              )}
            </div>
          </ConfigSection>

          {/* Giscus */}
          <ConfigSection title="Giscus 配置">
            <div className="space-y-4">
              <CheckboxField
                label="启用 Giscus"
                checked={config.giscus?.enable ?? false}
                onChange={(v) => onNestedChange('giscus', 'enable', v)}
              />
              {config.giscus?.enable && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <TextField
                    label="Repository"
                    value={config.giscus?.repo || ''}
                    onChange={(v) => onNestedChange('giscus', 'repo', v)}
                    placeholder="username/repo"
                    className="col-span-2"
                  />
                  <TextField
                    label="Repository ID"
                    value={config.giscus?.repoId || ''}
                    onChange={(v) => onNestedChange('giscus', 'repoId', v)}
                  />
                  <TextField
                    label="Category ID"
                    value={config.giscus?.categoryId || ''}
                    onChange={(v) => onNestedChange('giscus', 'categoryId', v)}
                  />
                </div>
              )}
            </div>
          </ConfigSection>

          {/* Gitalk */}
          <ConfigSection title="Gitalk 配置">
            <div className="space-y-4">
              <CheckboxField
                label="启用 Gitalk"
                checked={config.gitalk?.enable ?? false}
                onChange={(v) => onNestedChange('gitalk', 'enable', v)}
              />
              {config.gitalk?.enable && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <TextField
                    label="Client ID"
                    value={config.gitalk?.clientID || ''}
                    onChange={(v) => onNestedChange('gitalk', 'clientID', v)}
                  />
                  <TextField
                    label="Client Secret"
                    value={config.gitalk?.clientSecret || ''}
                    onChange={(v) => onNestedChange('gitalk', 'clientSecret', v)}
                  />
                  <TextField
                    label="Repo"
                    value={config.gitalk?.repo || ''}
                    onChange={(v) => onNestedChange('gitalk', 'repo', v)}
                  />
                  <TextField
                    label="Owner"
                    value={config.gitalk?.owner || ''}
                    onChange={(v) => onNestedChange('gitalk', 'owner', v)}
                  />
                </div>
              )}
            </div>
          </ConfigSection>

          {/* Twikoo */}
          <ConfigSection title="Twikoo 配置">
            <div className="space-y-4">
              <CheckboxField
                label="启用 Twikoo"
                checked={config.twikoo?.enable ?? false}
                onChange={(v) => onNestedChange('twikoo', 'enable', v)}
              />
              {config.twikoo?.enable && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <TextField
                    label="Env ID"
                    value={config.twikoo?.envId || ''}
                    onChange={(v) => onNestedChange('twikoo', 'envId', v)}
                    className="col-span-2"
                  />
                  <TextField
                    label="Region (可选)"
                    value={config.twikoo?.region || ''}
                    onChange={(v) => onNestedChange('twikoo', 'region', v)}
                  />
                </div>
              )}
            </div>
          </ConfigSection>

          {/* Disqus */}
          <ConfigSection title="Disqus 配置">
            <div className="space-y-4">
              <CheckboxField
                label="启用 Disqus"
                checked={config.disqus?.enable ?? false}
                onChange={(v) => onNestedChange('disqus', 'enable', v)}
              />
              {config.disqus?.enable && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <TextField
                    label="Shortname"
                    value={config.disqus?.shortname || ''}
                    onChange={(v) => onNestedChange('disqus', 'shortname', v)}
                  />
                  <CheckboxField
                    label="显示评论数统计"
                    checked={config.disqus?.count ?? true}
                    onChange={(v) => onNestedChange('disqus', 'count', v)}
                  />
                </div>
              )}
            </div>
          </ConfigSection>
        </>
      )}
    </div>
  )
}