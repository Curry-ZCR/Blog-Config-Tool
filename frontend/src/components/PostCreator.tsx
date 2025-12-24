import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { format } from 'date-fns'
import { useApp, useToast } from '../context'
import { createPost } from '../services/api'
import { generateFilename } from '../utils/filename'
import { Preview } from './Preview'
import { TextField, TextAreaField, NumberField, CheckboxField, SelectField, ImageField, ConfigSection } from './FormFields'
import type { CreatePostRequest } from '../../../shared/types'

interface PostFormData {
  title: string
  date: string
  lastmod: string
  author: string
  draft: boolean
  weight: number
  description: string
  summary: string
  link: string
  categories: string
  tags: string
  keywords: string
  cover: string
  photos: string
  sidebar: string // 'default', 'left', 'right', 'false'
  toc: string // 'default', 'true', 'false'
  outdated: string
  copyright: string
  sponsor: string
  comments: string
  mermaid: boolean
  math: boolean
}

export function PostCreator() {
  const { state, refreshPosts } = useApp()
  const { showToast } = useToast()
  const [showPreview, setShowPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [existingCategories, setExistingCategories] = useState<string[]>([])
  const [existingTags, setExistingTags] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'basic' | 'taxonomy' | 'media' | 'settings'>('basic')

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    defaultValues: {
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      lastmod: '',
      author: '',
      draft: false,
      weight: 0,
      description: '',
      summary: '',
      link: '',
      categories: '',
      tags: '',
      keywords: '',
      cover: '',
      photos: '',
      sidebar: 'default',
      toc: 'default',
      outdated: 'default',
      copyright: 'default',
      sponsor: 'default',
      comments: 'default',
      mermaid: false,
      math: false,
    },
  })

  const watchedValues = watch()
  const generatedFilename = generateFilename(watchedValues.title)

  // Extract existing categories and tags from posts
  useEffect(() => {
    const categories = new Set<string>()
    const tags = new Set<string>()

    state.posts.forEach((post) => {
      post.categories?.forEach((c) => categories.add(c))
      post.tags?.forEach((t) => tags.add(t))
    })

    setExistingCategories(Array.from(categories).sort())
    setExistingTags(Array.from(tags).sort())
  }, [state.posts])

  // Helper to convert tri-state select values to boolean/undefined
  const getTriState = (value: string): boolean | undefined => {
    if (value === 'true') return true
    if (value === 'false') return false
    return undefined
  }

  // Generate Front-matter preview
  const generateFrontMatter = (data: PostFormData): string => {
    const lines = ['---']
    
    const addString = (key: string, value?: string) => {
      if (value) {
        // Safe replace without regex literal to avoid tool issues
        const escaped = value.split("'").join("'\'")
        lines.push(`${key}: "${escaped}"`) 
      }
    }
    const addBoolean = (key: string, value?: boolean) => {
      if (value !== undefined) lines.push(`${key}: ${value}`)
    }
    const addNumber = (key: string, value?: number) => {
      if (value !== undefined && value !== 0) lines.push(`${key}: ${value}`)
    }
    const addArray = (key: string, value?: string) => {
      if (value && value.trim()) {
        lines.push(`${key}:`)
        // Replace newlines with commas, then split by comma
        value.replace(new RegExp('\\n', 'g'), ',')
             .split(',')
             .map(v => v.trim())
             .filter(Boolean)
             .forEach(v => lines.push(`  - ${v}`))
      }
    }

    addString('title', data.title)
    lines.push(`date: ${data.date}`)
    addString('lastmod', data.lastmod)
    addString('author', data.author)
    addBoolean('draft', data.draft)
    addNumber('weight', data.weight)
    addString('description', data.description)
    addString('summary', data.summary)
    addString('link', data.link)
    
    addArray('categories', data.categories)
    addArray('tags', data.tags)
    addArray('keywords', data.keywords)
    
    addString('cover', data.cover)
    addArray('photos', data.photos)

    // Settings
    if (data.sidebar !== 'default') {
      lines.push(`sidebar: ${data.sidebar === 'false' ? 'false' : `'${data.sidebar}'`}`)
    }
    addBoolean('toc', getTriState(data.toc))
    addBoolean('outdated', getTriState(data.outdated))
    addBoolean('copyright', getTriState(data.copyright))
    addBoolean('sponsor', getTriState(data.sponsor))
    addBoolean('comments', getTriState(data.comments))
    addBoolean('mermaid', data.mermaid || undefined) // only show if true? usually false default
    addBoolean('math', data.math || undefined)

    lines.push('---')
    return lines.join('\n')
  }

  const onSubmit = async (data: PostFormData) => {
    setSubmitting(true)

    try {
      const request: CreatePostRequest = {
        title: data.title,
        date: data.date,
        lastmod: data.lastmod || undefined,
        author: data.author || undefined,
        draft: data.draft,
        weight: data.weight || undefined,
        description: data.description || undefined,
        summary: data.summary || undefined,
        link: data.link || undefined,
        categories: data.categories.split(',').map((c) => c.trim()).filter(Boolean),
        tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
        keywords: data.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        cover: data.cover || undefined,
        photos: data.photos.split('\n').map(p => p.trim()).filter(Boolean),
        
        sidebar: data.sidebar === 'default' ? undefined : (data.sidebar === 'false' ? false : data.sidebar as 'left' | 'right'),
        toc: getTriState(data.toc),
        outdated: getTriState(data.outdated),
        copyright: getTriState(data.copyright),
        sponsor: getTriState(data.sponsor),
        comments: getTriState(data.comments),
        mermaid: data.mermaid,
        math: data.math,
      }

      const result = await createPost(request)

      if (result.success) {
        showToast('success', `文章已创建: ${result.filePath?.split('/').pop()}`)
        reset()
        await refreshPosts()
      } else {
        showToast('error', result.error || '创建失败')
      }
    } catch {
      showToast('error', '创建失败，请检查网络或服务器')
    } finally {
      setSubmitting(false)
    }
  }

  const triStateOptions = [
    { value: 'default', label: '默认 (跟随全局)' },
    { value: 'true', label: '开启' },
    { value: 'false', label: '关闭' },
  ]

  const sidebarOptions = [
    { value: 'default', label: '默认 (跟随全局)' },
    { value: 'left', label: '左侧' },
    { value: 'right', label: '右侧' },
    { value: 'false', label: '隐藏' },
  ]

  const tabs = [
    { id: 'basic', label: '基础信息' },
    { id: 'taxonomy', label: '分类与标签' },
    { id: 'media', label: '封面与图片' },
    { id: 'settings', label: '功能配置' },
  ] as const

  return (
    <div className="max-w-4xl pb-20">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">新建文章</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(true)}
            disabled={!watchedValues.title}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 bg-white shadow-sm"
          >
            预览 Front-matter
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {submitting ? '创建中...' : '创建文章'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form className="space-y-6">
        {activeTab === 'basic' && (
          <ConfigSection title="基础信息">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="title"
                control={control}
                rules={{ required: '标题不能为空' }}
                render={({ field }) => (
                  <div className="col-span-2">
                    <TextField label="文章标题 *" value={field.value} onChange={field.onChange} />
                    {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
                    {field.value && (
                       <p className="mt-1 text-xs text-gray-500">
                         文件名: {generatedFilename}.md
                       </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="date"
                control={control}
                rules={{ required: '日期不能为空' }}
                render={({ field }) => (
                  <TextField label="创建日期 *" value={field.value} onChange={field.onChange} />
                )}
              />
              <Controller
                name="lastmod"
                control={control}
                render={({ field }) => (
                   <div className="">
                      <label className="block text-sm font-medium text-gray-700 mb-1">最后修改时间</label>
                      <input type="datetime-local" className="w-full px-3 py-2 border border-gray-300 rounded-lg" {...field} />
                   </div>
                )}
              />
              <Controller
                name="author"
                control={control}
                render={({ field }) => (
                  <TextField label="作者 (覆盖全局)" value={field.value} onChange={field.onChange} />
                )}
              />
              <Controller
                name="weight"
                control={control}
                render={({ field }) => (
                  <NumberField label="权重 (置顶排序)" value={field.value} onChange={field.onChange} />
                )}
              />
              <Controller
                name="draft"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center h-full pt-6">
                    <CheckboxField label="设为草稿 (Draft)" checked={field.value} onChange={field.onChange} />
                  </div>
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div className="col-span-2">
                    <TextAreaField label="文章描述 (Description)" value={field.value} onChange={field.onChange} />
                  </div>
                )}
              />
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <div className="col-span-2">
                    <TextAreaField label="文章摘要 (Summary)" value={field.value} onChange={field.onChange} />
                  </div>
                )}
              />
              <Controller
                name="link"
                control={control}
                render={({ field }) => (
                  <div className="col-span-2">
                    <TextField label="外部链接 (Link)" value={field.value} onChange={field.onChange} />
                  </div>
                )}
              />
            </div>
          </ConfigSection>
        )}

        {activeTab === 'taxonomy' && (
          <ConfigSection title="分类与标签">
            <div className="space-y-6">
              <Controller
                name="categories"
                control={control}
                render={({ field }) => (
                  <div>
                    <TextField label="分类 (逗号分隔)" value={field.value} onChange={field.onChange} placeholder="例如: 技术, 生活" />
                    {existingCategories.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {existingCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                                const current = field.value ? field.value.split(',').map(s => s.trim()) : []
                                if (!current.includes(cat)) {
                                    field.onChange([...current, cat].join(', '))
                                }
                            }}
                            className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              />
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <div>
                    <TextField label="标签 (逗号分隔)" value={field.value} onChange={field.onChange} placeholder="例如: Hugo, React" />
                    {existingTags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {existingTags.slice(0, 20).map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                                const current = field.value ? field.value.split(',').map(s => s.trim()) : []
                                if (!current.includes(tag)) {
                                    field.onChange([...current, tag].join(', '))
                                }
                            }}
                            className="px-2 py-0.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              />
              <Controller
                name="keywords"
                control={control}
                render={({ field }) => (
                  <TextField label="关键词 (Keywords, 逗号分隔)" value={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          </ConfigSection>
        )}

        {activeTab === 'media' && (
          <ConfigSection title="媒体资源">
             <div className="space-y-6">
               <Controller
                 name="cover"
                 control={control}
                 render={({ field }) => (
                   <ImageField label="文章封面" value={field.value} onChange={field.onChange} />
                 )}
               />
               <Controller
                 name="photos"
                 control={control}
                 render={({ field }) => (
                   <TextAreaField 
                     label="照片墙 (Photos, 每行一个 URL)" 
                     value={field.value} 
                     onChange={field.onChange} 
                   />
                 )}
               />
             </div>
          </ConfigSection>
        )}

        {activeTab === 'settings' && (
          <ConfigSection title="功能配置">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Controller
                 name="sidebar"
                 control={control}
                 render={({ field }) => (
                   <SelectField label="侧边栏位置" value={field.value} onChange={field.onChange} options={sidebarOptions} />
                 )}
               />
               <Controller
                 name="toc"
                 control={control}
                 render={({ field }) => (
                   <SelectField label="显示目录 (TOC)" value={field.value} onChange={field.onChange} options={triStateOptions} />
                 )}
               />
               <Controller
                 name="outdated"
                 control={control}
                 render={({ field }) => (
                   <SelectField label="过期提醒 (Outdated)" value={field.value} onChange={field.onChange} options={triStateOptions} />
                 )}
               />
               <Controller
                 name="copyright"
                 control={control}
                 render={({ field }) => (
                   <SelectField label="版权声明 (Copyright)" value={field.value} onChange={field.onChange} options={triStateOptions} />
                 )}
               />
               <Controller
                 name="sponsor"
                 control={control}
                 render={({ field }) => (
                   <SelectField label="打赏功能 (Sponsor)" value={field.value} onChange={field.onChange} options={triStateOptions} />
                 )}
               />
               <Controller
                 name="comments"
                 control={control}
                 render={({ field }) => (
                   <SelectField label="评论功能 (Comments)" value={field.value} onChange={field.onChange} options={triStateOptions} />
                 )}
               />
               <div className="col-span-2 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <Controller
                    name="mermaid"
                    control={control}
                    render={({ field }) => (
                      <CheckboxField label="启用 Mermaid 流程图" checked={field.value} onChange={field.onChange} />
                    )}
                  />
                  <Controller
                    name="math"
                    control={control}
                    render={({ field }) => (
                      <CheckboxField label="启用 LaTeX 数学公式" checked={field.value} onChange={field.onChange} />
                    )}
                  />
               </div>
             </div>
          </ConfigSection>
        )}
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <Preview
          type="frontmatter"
          frontmatter={generateFrontMatter(watchedValues)}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}
