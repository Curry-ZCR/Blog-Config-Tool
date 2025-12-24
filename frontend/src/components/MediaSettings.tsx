import type { BlogConfig } from '../../../shared/types'
import { ConfigSection, CheckboxField, SelectField, TextField } from './FormFields'

interface Props {
  config: BlogConfig
  onChange: (field: string, value: any) => void
  onNestedChange: (parent: string, field: string, value: any) => void
}

export function MediaSettings({ config, onChange, onNestedChange }: Props) {
  return (
    <div className="space-y-6">
      <ConfigSection title="动画与特效">
        <div className="grid grid-cols-2 gap-4">
          <CheckboxField
            label="启用加载动画"
            checked={config.preloader?.enable ?? true}
            onChange={(v) => onNestedChange('preloader', 'enable', v)}
          />
          <CheckboxField
            label="启用点击烟花"
            checked={config.firework?.enable ?? false}
            onChange={(v) => onNestedChange('firework', 'enable', v)}
          />
        </div>
      </ConfigSection>

      <ConfigSection title="Live2D 看板娘">
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
             <p className="text-sm text-blue-800 mb-2 font-bold">新版 Live2D</p>
             <div className="grid grid-cols-2 gap-4">
                <CheckboxField
                  label="启用新版 Live2D"
                  checked={config.live2d?.enable ?? false}
                  onChange={(v) => onNestedChange('live2d', 'enable', v)}
                />
                <SelectField
                  label="显示位置"
                  value={config.live2d?.position || 'left'}
                  options={[
                    { value: 'left', label: '左侧' },
                    { value: 'right', label: '右侧' },
                  ]}
                  onChange={(v) => onNestedChange('live2d', 'position', v)}
                />
             </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
             <p className="text-sm text-gray-800 mb-2 font-bold">旧版 Live2D (Widgets)</p>
             <div className="grid grid-cols-2 gap-4">
                <CheckboxField
                  label="启用旧版 Live2D"
                  checked={config.live2d_widgets?.enable ?? false}
                  onChange={(v) => onNestedChange('live2d_widgets', 'enable', v)}
                />
                <SelectField
                  label="显示位置"
                  value={config.live2d_widgets?.position || 'left'}
                  options={[
                    { value: 'left', label: '左侧' },
                    { value: 'right', label: '右侧' },
                  ]}
                  onChange={(v) => onNestedChange('live2d_widgets', 'position', v)}
                />
             </div>
          </div>
        </div>
      </ConfigSection>

      <ConfigSection title="音乐播放器 (Player)">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <CheckboxField
               label="移动端禁用"
               checked={config.player?.disable_on_mobile ?? false}
               onChange={(v) => {
                 const player = config.player || {}
                 onChange('player', { ...player, disable_on_mobile: v })
               }}
             />
             <SelectField
               label="播放器位置"
               value={config.player?.position || 'before_sidebar'}
               options={[
                 { value: 'before_sidebar', label: '侧边栏上方' },
                 { value: 'after_sidebar', label: '侧边栏下方' },
                 { value: 'after_widget', label: '小组件下方' },
               ]}
               onChange={(v) => {
                 const player = config.player || {}
                 onChange('player', { ...player, position: v })
               }}
             />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
               <h3 className="font-bold text-gray-700">APlayer 基础配置</h3>
               <CheckboxField
                 label="启用 APlayer"
                 checked={config.player?.aplayer?.enable ?? false}
                 onChange={(v) => {
                   const player = config.player || { aplayer: { enable: false }, meting: { enable: false } }
                   onChange('player', { ...player, aplayer: { ...player.aplayer, enable: v } })
                 }}
               />
            </div>
            
            {config.player?.aplayer?.enable && (
               <div className="grid grid-cols-2 gap-4">
                  <CheckboxField
                    label="固定到底部 (Fixed)"
                    checked={config.player?.aplayer?.options?.fixed ?? true}
                    onChange={(v) => {
                       const player = config.player || { aplayer: { options: {} } }
                       const options = player.aplayer?.options || {}
                       onChange('player', { 
                         ...player, 
                         aplayer: { ...player.aplayer, options: { ...options, fixed: v } } 
                       })
                    }}
                  />
                  <CheckboxField
                    label="自动播放 (Autoplay)"
                    checked={config.player?.aplayer?.options?.autoplay ?? false}
                    onChange={(v) => {
                       const player = config.player || { aplayer: { options: {} } }
                       const options = player.aplayer?.options || {}
                       onChange('player', { 
                         ...player, 
                         aplayer: { ...player.aplayer, options: { ...options, autoplay: v } } 
                       })
                    }}
                  />
                  <CheckboxField
                     label="循环播放 (Loop)"
                     checked={(config.player?.aplayer?.options?.loop ?? 'all') !== 'none'}
                     onChange={(v) => {
                        const player = config.player || { aplayer: { options: {} } }
                        const options = player.aplayer?.options || {}
                        onChange('player', {
                           ...player,
                           aplayer: { ...player.aplayer, options: { ...options, loop: v ? 'all' : 'none' } }
                        })
                     }}
                  />
                  <SelectField 
                     label="预加载 (Preload)"
                     value={config.player?.aplayer?.options?.preload || 'auto'}
                     options={[
                        { value: 'none', label: '不预加载' },
                        { value: 'metadata', label: '仅元数据' },
                        { value: 'auto', label: '自动' },
                     ]}
                     onChange={(v) => {
                        const player = config.player || { aplayer: { options: {} } }
                        const options = player.aplayer?.options || {}
                        onChange('player', {
                           ...player,
                           aplayer: { ...player.aplayer, options: { ...options, preload: v } }
                        })
                     }}
                  />
               </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Meting (在线歌单)</h3>
                <CheckboxField
                  label="启用 Meting"
                  checked={config.player?.meting?.enable ?? false}
                  onChange={(v) => {
                    const player = config.player || { aplayer: { enable: false }, meting: { enable: false } }
                    onChange('player', { ...player, meting: { ...player.meting, enable: v } })
                  }}
                />
             </div>

             {config.player?.meting?.enable && (
               <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="平台 (Server)"
                    value={config.player?.meting?.options?.server || 'netease'}
                    options={[
                       { value: 'netease', label: '网易云音乐' },
                       { value: 'tencent', label: 'QQ 音乐' },
                       { value: 'kugou', label: '酷狗音乐' },
                       { value: 'xiami', label: '虾米音乐' },
                       { value: 'baidu', label: '百度音乐' },
                    ]}
                    onChange={(v) => {
                       const player = config.player || { meting: { options: {} } }
                       const options = player.meting?.options || {}
                       onChange('player', {
                          ...player,
                          meting: { ...player.meting, options: { ...options, server: v } }
                       })
                    }}
                  />
                  <SelectField
                    label="类型 (Type)"
                    value={config.player?.meting?.options?.type || 'playlist'}
                    options={[
                       { value: 'playlist', label: '歌单' },
                       { value: 'song', label: '单曲' },
                       { value: 'album', label: '专辑' },
                       { value: 'artist', label: '艺人' },
                       { value: 'search', label: '搜索' },
                    ]}
                    onChange={(v) => {
                       const player = config.player || { meting: { options: {} } }
                       const options = player.meting?.options || {}
                       onChange('player', {
                          ...player,
                          meting: { ...player.meting, options: { ...options, type: v } }
                       })
                    }}
                  />
                  <TextField
                    label="ID / URL"
                    value={config.player?.meting?.options?.id || ''}
                    onChange={(v) => {
                       const player = config.player || { meting: { options: {} } }
                       const options = player.meting?.options || {}
                       onChange('player', {
                          ...player,
                          meting: { ...player.meting, options: { ...options, id: v } }
                       })
                    }}
                  />
                  <TextField
                    label="自定义 API (可选)"
                    value={config.player?.meting?.meting_api || ''}
                    onChange={(v) => {
                       const player = config.player || { meting: { options: {} } }
                       onChange('player', {
                          ...player,
                          meting: { ...player.meting, meting_api: v }
                       })
                    }}
                  />
               </div>
             )}
          </div>
        </div>
      </ConfigSection>
    </div>
  )
}