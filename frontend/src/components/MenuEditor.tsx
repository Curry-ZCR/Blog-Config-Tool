import { useState } from 'react'
import type { MenuItem } from '../../../shared/types'

interface MenuEditorProps {
  items: MenuItem[]
  onChange: (items: MenuItem[]) => void
}

export function MenuEditor({ items, onChange }: MenuEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleAdd = () => {
    const newItem: MenuItem = { name: '', url: '', icon: '' }
    onChange([...items, newItem])
    setEditingIndex(items.length)
  }

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    onChange(newItems)
    if (editingIndex === index) {
      setEditingIndex(null)
    }
  }

  const handleUpdate = (index: number, field: keyof MenuItem, value: string) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    onChange(newItems)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newItems = [...items]
    ;[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
    onChange(newItems)
  }

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return
    const newItems = [...items]
    ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
    onChange(newItems)
  }

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">暂无菜单项</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <MenuItemRow
              key={index}
              item={item}
              isEditing={editingIndex === index}
              isFirst={index === 0}
              isLast={index === items.length - 1}
              onEdit={() => setEditingIndex(editingIndex === index ? null : index)}
              onUpdate={(field, value) => handleUpdate(index, field, value)}
              onRemove={() => handleRemove(index)}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        添加菜单项
      </button>
    </div>
  )
}

interface MenuItemRowProps {
  item: MenuItem
  isEditing: boolean
  isFirst: boolean
  isLast: boolean
  onEdit: () => void
  onUpdate: (field: keyof MenuItem, value: string) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

function MenuItemRow({
  item,
  isEditing,
  isFirst,
  isLast,
  onEdit,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: MenuItemRowProps) {
  const [urlWarning, setUrlWarning] = useState<string | null>(null)

  const validateUrl = (url: string) => {
    if (!url) {
      setUrlWarning(null)
      return
    }
    // Check if URL starts with / or http
    if (!url.startsWith('/') && !url.startsWith('http')) {
      setUrlWarning('URL 应以 / 或 http 开头')
    } else {
      setUrlWarning(null)
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Collapsed View */}
      <div className="flex items-center p-3 bg-gray-50">
        <div className="flex items-center gap-1 mr-3">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="上移"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="下移"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <span className="font-medium text-gray-700">
            {item.name || <span className="text-gray-400 italic">未命名</span>}
          </span>
          <span className="ml-2 text-sm text-gray-500 truncate">
            {item.url || <span className="text-gray-400">无链接</span>}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-blue-600"
            title={isEditing ? '收起' : '编辑'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-600"
            title="删除"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Edit View */}
      {isEditing && (
        <div className="p-4 border-t bg-white space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
            <input
              type="text"
              value={item.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="菜单名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="text"
              value={item.url}
              onChange={(e) => {
                onUpdate('url', e.target.value)
                validateUrl(e.target.value)
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                urlWarning ? 'border-yellow-400' : 'border-gray-300'
              }`}
              placeholder="/path 或 https://..."
            />
            {urlWarning && (
              <p className="mt-1 text-sm text-yellow-600">{urlWarning}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">图标 (可选)</label>
            <input
              type="text"
              value={item.icon || ''}
              onChange={(e) => onUpdate('icon', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="fa-solid fa-home"
            />
            <p className="mt-1 text-xs text-gray-500">使用 Font Awesome 图标类名</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Export menu operations for testing
export const menuOperations = {
  add: (items: MenuItem[], newItem: MenuItem): MenuItem[] => [...items, newItem],
  remove: (items: MenuItem[], index: number): MenuItem[] => items.filter((_, i) => i !== index),
  reorder: (items: MenuItem[], fromIndex: number, toIndex: number): MenuItem[] => {
    if (fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length) {
      return items
    }
    const newItems = [...items]
    const [removed] = newItems.splice(fromIndex, 1)
    newItems.splice(toIndex, 0, removed)
    return newItems
  },
  update: (items: MenuItem[], index: number, updates: Partial<MenuItem>): MenuItem[] =>
    items.map((item, i) => (i === index ? { ...item, ...updates } : item)),
}
