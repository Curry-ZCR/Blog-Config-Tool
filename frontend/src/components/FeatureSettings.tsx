import type { BlogConfig } from '../../../shared/types'
import { ConfigSection, CheckboxField, TextField, NumberField, TextAreaField, SelectField } from './FormFields'

interface Props {
  config: BlogConfig
  onChange: (field: string, value: any) => void
  onNestedChange: (parent: string, field: string, value: any) => void
}

export function FeatureSettings({ config, onChange, onNestedChange }: Props) {
  const sharePlatforms = [
    { id: 'facebook', label: 'Facebook' },
    { id: 'twitter', label: 'Twitter' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'reddit', label: 'Reddit' },
    { id: 'weibo', label: '微博' },
    { id: 'qq', label: 'QQ' },
    { id: 'weixin', label: '微信' },
  ]

  const handleShareToggle = (id: string, checked: boolean) => {
    const currentShare = config.share || []
    if (checked) {
      onChange('share', [...currentShare, id])
    } else {
      onChange('share', currentShare.filter(s => s !== id))
    }
  }

  return (
    <div className="space-y-6">
      <ConfigSection title="搜索功能">
        <div className="space-y-4">
          <CheckboxField
            label="启用 Algolia 搜索"
            checked={config.algolia_search?.enable ?? false}
            onChange={(v) => onNestedChange('algolia_search', 'enable', v)}
          />

          {config.algolia_search?.enable && (
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
              <TextField
                label="Application ID (appID)"
                value={config.algolia_search?.appID || ''}
                onChange={(v) => onNestedChange('algolia_search', 'appID', v)}
              />
              <TextField
                label="Search-Only API Key"
                value={config.algolia_search?.apiKey || ''}
                onChange={(v) => onNestedChange('algolia_search', 'apiKey', v)}
              />
              <TextField
                label="Index Name"
                value={config.algolia_search?.indexName || ''}
                onChange={(v) => onNestedChange('algolia_search', 'indexName', v)}
              />
              <NumberField
                label="每页搜索结果数 (hits.per_page)"
                value={config.algolia_search?.hits?.per_page || 10}
                onChange={(v) => {
                  const hits = config.algolia_search?.hits || { per_page: 10 }
                  onNestedChange('algolia_search', 'hits', { ...hits, per_page: v })
                }}
              />
            </div>
          )}
        </div>
      </ConfigSection>

      <ConfigSection title="Markdown 扩展 (Math & Mermaid)">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">数学公式 (Mutually Exclusive)</p>
              <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg">
                <CheckboxField
                  label="启用 KaTeX (推荐)"
                  checked={config.math?.katex?.enable ?? false}
                  onChange={(v) => {
                    const math = config.math || { katex: { enable: false }, mathjax: { enable: false } }
                    onChange('math', { ...math, katex: { enable: v }, mathjax: { ...math.mathjax, enable: v ? false : math.mathjax.enable } })
                  }}
                />
                <CheckboxField
                  label="启用 MathJax3"
                  checked={config.math?.mathjax?.enable ?? false}
                  onChange={(v) => {
                    const math = config.math || { katex: { enable: false }, mathjax: { enable: false } }
                    onChange('math', { ...math, mathjax: { ...math.mathjax, enable: v }, katex: { enable: v ? false : math.katex.enable } })
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">流程图 (Mermaid)</p>
              <div className="p-3 bg-gray-50 rounded-lg">
                <CheckboxField
                  label="启用 Mermaid 缩放 (Zoom)"
                  checked={config.mermaid?.zoom ?? false}
                  onChange={(v) => onNestedChange('mermaid', 'zoom', v)}
                />
              </div>
            </div>
          </div>
        </div>
      </ConfigSection>

      <ConfigSection title="订阅与分享">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700">RSS 订阅</p>
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <NumberField
                  label="文章输出限制 (-1 为全部)"
                  value={config.rss?.limit ?? 10}
                  onChange={(v) => onNestedChange('rss', 'limit', v)}
                />
                <CheckboxField
                  label="输出完整内容"
                  checked={config.rss?.showFullContent ?? false}
                  onChange={(v) => onNestedChange('rss', 'showFullContent', v)}
                />
                <CheckboxField
                  label="在 RSS 中显示版权"
                  checked={config.rss?.showCopyright ?? false}
                  onChange={(v) => onNestedChange('rss', 'showCopyright', v)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700">社交分享平台</p>
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
                {sharePlatforms.map(platform => (
                  <CheckboxField
                    key={platform.id}
                    label={platform.label}
                    checked={(config.share || []).includes(platform.id)}
                    onChange={(v) => handleShareToggle(platform.id, v)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </ConfigSection>

      <ConfigSection title="备案与规范 (ICP)">
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="ICP 备案号"
            value={config.icp?.icpnumber || ''}
            onChange={(v) => onNestedChange('icp', 'icpnumber', v)}
          />
          <TextField
            label="公安备案号"
            value={config.icp?.beian || ''}
            onChange={(v) => onNestedChange('icp', 'beian', v)}
          />
          <TextField
            label="萌国 ICP 备案号"
            value={config.moe_icp?.icpnumber || ''}
            onChange={(v) => onNestedChange('moe_icp', 'icpnumber', v)}
          />
        </div>
      </ConfigSection>

      <ConfigSection title="站点装饰 (Decorations)">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">文章过期提醒</p>
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <CheckboxField
                label="启用过期提醒"
                checked={config.outdate?.enable ?? false}
                onChange={(v) => onNestedChange('outdate', 'enable', v)}
              />
              {config.outdate?.enable && (
                <>
                  <NumberField
                    label="视为过期的天数"
                    value={config.outdate?.daysAgo ?? 180}
                    onChange={(v) => onNestedChange('outdate', 'daysAgo', v)}
                  />
                  <TextAreaField
                    label="提醒消息 (zh-CN)"
                    value={config.outdate?.message?.['zh-CN'] || ''}
                    onChange={(v) => {
                      const msg = config.outdate?.message || {}
                      onNestedChange('outdate', 'message', { ...msg, 'zh-CN': v })
                    }}
                  />
                </>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">右上角三角徽章</p>
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <CheckboxField
                label="启用三角徽章"
                checked={config.triangle_badge?.enable ?? false}
                onChange={(v) => onNestedChange('triangle_badge', 'enable', v)}
              />
              {config.triangle_badge?.enable && (
                <>
                  <TextField
                    label="图标 (与社交图标同名)"
                    value={config.triangle_badge?.icon || ''}
                    onChange={(v) => onNestedChange('triangle_badge', 'icon', v)}
                  />
                  <TextField
                    label="跳转链接"
                    value={config.triangle_badge?.link || ''}
                    onChange={(v) => onNestedChange('triangle_badge', 'link', v)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </ConfigSection>

      <ConfigSection title="文章版权与打赏">
        <div className="space-y-6">
          {/* Copyright Section */}
          <div className="space-y-4">
            <CheckboxField
              label="启用文章版权声明"
              checked={config.article_copyright?.enable ?? false}
              onChange={(v) => onNestedChange('article_copyright', 'enable', v)}
            />
            {config.article_copyright?.enable && (
              <div className="grid grid-cols-2 gap-4 mt-2 p-4 bg-gray-50 rounded-lg">
                <CheckboxField
                  label="显示作者"
                  checked={config.article_copyright?.content?.author ?? true}
                  onChange={(v) => {
                    const content = config.article_copyright?.content || { author: true, link: true, license: true, license_type: 'by-nc-sa' }   
                    onNestedChange('article_copyright', 'content', { ...content, author: v })
                  }}
                />
                <CheckboxField
                  label="显示文章标题"
                  checked={config.article_copyright?.content?.title ?? false}
                  onChange={(v) => {
                    const content = config.article_copyright?.content || { author: true, link: true, license: true, license_type: 'by-nc-sa' }   
                    onNestedChange('article_copyright', 'content', { ...content, title: v })
                  }}
                />
                <CheckboxField
                  label="显示发布日期"
                  checked={config.article_copyright?.content?.date ?? false}
                  onChange={(v) => {
                    const content = config.article_copyright?.content || { author: true, link: true, license: true, license_type: 'by-nc-sa' }   
                    onNestedChange('article_copyright', 'content', { ...content, date: v })
                  }}
                />
                <CheckboxField
                  label="显示更新日期"
                  checked={config.article_copyright?.content?.updated ?? false}
                  onChange={(v) => {
                    const content = config.article_copyright?.content || { author: true, link: true, license: true, license_type: 'by-nc-sa' }   
                    onNestedChange('article_copyright', 'content', { ...content, updated: v })
                  }}
                />
                <CheckboxField
                  label="显示文章链接"
                  checked={config.article_copyright?.content?.link ?? true}
                  onChange={(v) => {
                    const content = config.article_copyright?.content || { author: true, link: true, license: true, license_type: 'by-nc-sa' }   
                    onNestedChange('article_copyright', 'content', { ...content, link: v })
                  }}
                />
                <CheckboxField
                  label="显示许可证"
                  checked={config.article_copyright?.content?.license ?? true}
                  onChange={(v) => {
                    const content = config.article_copyright?.content || { author: true, link: true, license: true, license_type: 'by-nc-sa' }   
                    onNestedChange('article_copyright', 'content', { ...content, license: v })
                  }}
                />
                <SelectField
                  label="许可证类型"
                  value={config.article_copyright?.content?.license_type || 'by-nc-sa'}
                  options={[
                    { value: 'by', label: 'CC BY' },
                    { value: 'by-sa', label: 'CC BY-SA' },
                    { value: 'by-nd', label: 'CC BY-ND' },
                    { value: 'by-nc', label: 'CC BY-NC' },
                    { value: 'by-nc-sa', label: 'CC BY-NC-SA' },
                    { value: 'by-nc-nd', label: 'CC BY-NC-ND' },
                  ]}
                  onChange={(v) => {
                    const content = config.article_copyright?.content || { author: true, link: true, license: true, license_type: 'by-nc-sa' }   
                    onNestedChange('article_copyright', 'content', { ...content, license_type: v })
                  }}
                />
              </div>
            )}
          </div>

          {/* Sponsor Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <CheckboxField
              label="启用打赏功能"
              checked={config.sponsor?.enable ?? false}
              onChange={(v) => onNestedChange('sponsor', 'enable', v)}
            />
            {config.sponsor?.enable && (
              <div className="space-y-4 mt-2 p-4 bg-gray-50 rounded-lg">
                <TextField
                  label="打赏提示语 (zh-CN)"
                  value={config.sponsor?.tip?.['zh-CN'] || ''}
                  onChange={(v) => {
                    const tip = config.sponsor?.tip || {}
                    onNestedChange('sponsor', 'tip', { ...tip, 'zh-CN': v })
                  }}
                />
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">收款二维码</p>
                    <button
                      type="button"
                      onClick={() => {
                        const qr = config.sponsor?.qr || []
                        onNestedChange('sponsor', 'qr', [...qr, { name: '新支付方式', src: '' }])
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      + 添加二维码
                    </button>
                  </div>
                  {config.sponsor?.qr?.map((item, index) => (
                    <div key={index} className="flex flex-col gap-2 bg-white p-3 rounded border shadow-sm relative group">
                      <button
                        type="button"
                        onClick={() => {
                          const qr = [...(config.sponsor?.qr || [])]
                          qr.splice(index, 1)
                          onNestedChange('sponsor', 'qr', qr)
                        }}
                        className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <TextField
                          label="名称"
                          value={item.name}
                          onChange={(v) => {
                            const qr = [...(config.sponsor?.qr || [])]
                            qr[index] = { ...qr[index], name: v }
                            onNestedChange('sponsor', 'qr', qr)
                          }}
                        />
                        <TextField
                          label="图片路径 (static/)"
                          value={item.src}
                          onChange={(v) => {
                            const qr = [...(config.sponsor?.qr || [])]
                            qr[index] = { ...qr[index], src: v }
                            onNestedChange('sponsor', 'qr', qr)
                          }}
                        />
                      </div>
                      {item.src && (
                        <img
                          src={item.src.startsWith('http') ? item.src : `/static/${item.src}`}
                          alt={item.name}
                          className="h-20 w-auto object-contain mt-2 border rounded"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </ConfigSection>
    </div>
  )
}