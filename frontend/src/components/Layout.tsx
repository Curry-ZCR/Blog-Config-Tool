import { NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../context/AppContext'

// Navigation items
const navItems = [
  { path: '/', label: '配置编辑', icon: '⚙️' },
  { path: '/posts', label: '文章管理', icon: '📝' },
  { path: '/settings', label: '设置', icon: '🔧' },
]

export function Layout() {
  const { state } = useApp()

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        {/* Logo/Title */}
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Blog Config Tool</h1>
          {state.blogPath && (
            <p className="text-xs text-gray-500 mt-1 truncate" title={state.blogPath}>
              {state.blogPath}
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t text-xs text-gray-400">
          <p>Hugo Blog Config Tool</p>
          <p>v0.0.1</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
