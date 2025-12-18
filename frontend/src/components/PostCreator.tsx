import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { useApp, useToast } from '../context'
import { createPost } from '../services/api'
import { generateFilename } from '../utils/filename'
import { isValidDateFormat } from '../utils/validation'
import { ImagePicker } from './ImagePicker'
import { Preview } from './Preview'
import type { CreatePostRequest } from '../../../shared/types'

interface PostFormData {
  title: string
  date: string
  categories: string
  tags: string
  cover: string
  description: string
  draft: boolean
}

export function PostCreator() {
  const { state, refreshPosts } = useApp()
  const { showToast } = useToast()
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [existingCategories, setExistingCategories] = useState<string[]>([])
  const [existingTags, setExistingTags] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    defaultValues: {
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      categories: '',
      tags: '',
      cover: '',
      description: '',
      draft: false,
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

  // Generate Front-matter preview
  const generateFrontMatter = (data: PostFormData): string => {
    const lines = ['---']
    lines.push(`title: "${data.title}"`)
    lines.push(`date: ${data.date}`)
    
    if (data.draft) {
      lines.push('draft: true')
    }
    
    if (data.categories.trim()) {
      const cats = data.categories.split(',').map((c) => c.trim()).filter(Boolean)
      lines.push('categories:')
      cats.forEach((c) => lines.push(`  - ${c}`))
    }
    
    if (data.tags.trim()) {
      const tagList = data.tags.split(',').map((t) => t.trim()).filter(Boolean)
      lines.push('tags:')
      tagList.forEach((t) => lines.push(`  - ${t}`))
    }
    
    if (data.cover.trim()) {
      lines.push(`cover: "${data.cover}"`)
    }
    
    if (data.description.trim()) {
      lines.push(`description: "${data.description}"`)
    }
    
    lines.push('---')
    lines.push('')
    lines.push('<!-- 在此处编写文章内容 -->')
    
    return lines.join('\n')
  }

  const onSubmit = async (data: PostFormData) => {
    setSubmitting(true)

    try {
      const request: CreatePostRequest = {
        title: data.title,
        date: data.date,
        categories: data.categories.split(',').map((c) => c.trim()).filter(Boolean),
        tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
        cover: data.cover || undefined,
        description: data.description || undefined,
        draft: data.draft,
      }

      const result = await createPost(request)

      if (result.success) {
        showToast('success', `文章创建成功！文件: ${result.filePath?.split('/').pop()}`)
        reset()
        await refreshPosts()
      } else {
        showToast('error', result.error || '创建文章失败')
      }
    } catch {
      showToast('error', '创建文章时发生网络错误，请检查连接后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">创建新文章</h1>
        <button
          onClick={() => setShowPreview(true)}
          disabled={!watchedValues.title}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          预览 Front-matter
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">基本信息</h2>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                文章标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('title', { required: '请输入文章标题' })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="输入文章标题"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
              {watchedValues.title && (
                <p className="mt-1 text-sm text-gray-500">
                  生成的文件名: <code className="bg-gray-100 px-1 rounded">{generatedFilename}.md</code>
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                发布日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('date', {
                  required: '请选择发布日期',
                  validate: (value) => isValidDateFormat(value) || '日期格式无效',
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            {/* Draft */}
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('draft')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">保存为草稿</label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">分类与标签</h2>
          
          <div className="space-y-4">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分类
              </label>
              <input
                type="text"
                {...register('categories')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="多个分类用逗号分隔"
              />
              {existingCategories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-xs text-gray-500">已有分类:</span>
                  {existingCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        const current = watchedValues.categories
                        const cats = current.split(',').map((c) => c.trim()).filter(Boolean)
                        if (!cats.includes(cat)) {
                          setValue('categories', [...cats, cat].join(', '))
                        }
                      }}
                      className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                标签
              </label>
              <input
                type="text"
                {...register('tags')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="多个标签用逗号分隔"
              />
              {existingTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-xs text-gray-500">已有标签:</span>
                  {existingTags.slice(0, 10).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const current = watchedValues.tags
                        const tagList = current.split(',').map((t) => t.trim()).filter(Boolean)
                        if (!tagList.includes(tag)) {
                          setValue('tags', [...tagList, tag].join(', '))
                        }
                      }}
                      className="px-2 py-0.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
                    >
                      {tag}
                    </button>
                  ))}
                  {existingTags.length > 10 && (
                    <span className="text-xs text-gray-400">+{existingTags.length - 10} 更多</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>


        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">封面与描述</h2>
          
          <div className="space-y-4">
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                封面图片
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  {...register('cover')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="图片路径或 URL"
                />
                <button
                  type="button"
                  onClick={() => setShowImagePicker(true)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  选择图片
                </button>
              </div>
              {watchedValues.cover && (
                <div className="mt-2">
                  <img
                    src={watchedValues.cover.startsWith('http') ? watchedValues.cover : `http://localhost:3001/static${watchedValues.cover}`}
                    alt="Cover preview"
                    className="h-32 w-auto object-cover rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                文章描述
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="简短描述文章内容（可选）"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            重置
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '创建中...' : '创建文章'}
          </button>
        </div>
      </form>

      {/* Existing Posts List */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">已有文章</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {state.posts.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">暂无文章</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.posts.map((post, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{post.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{post.date}</td>
                    <td className="px-4 py-3">
                      {post.draft ? (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">草稿</span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">已发布</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {post.categories?.join(', ') || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Image Picker Modal */}
      {showImagePicker && (
        <ImagePicker
          value={watchedValues.cover}
          onChange={(path) => {
            setValue('cover', path)
            setShowImagePicker(false)
          }}
          onClose={() => setShowImagePicker(false)}
          allowUrl
        />
      )}

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
