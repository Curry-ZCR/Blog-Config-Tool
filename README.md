# Blog Config Tool

可视化博客配置工具，用于简化 Hugo 博客（Reimu 主题）的配置和文章创建流程。

## 功能特性

- 📝 **可视化配置编辑** - 通过图形界面编辑 `params.yml` 配置文件
- 📄 **文章创建** - 快速创建新博客文章，自动生成 Front-matter
- 🖼️ **图片管理** - 浏览和选择静态目录中的图片
- 🔗 **菜单管理** - 添加、删除、重排序菜单项
- 🌐 **社交链接** - 配置社交媒体链接
- 💾 **自动备份** - 保存配置前自动创建备份
- 🔔 **实时反馈** - Toast 通知提示操作结果

## 项目结构

```
blog-config-tool/
├── frontend/          # React + TypeScript + Vite 前端
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── context/       # React Context (状态管理)
│   │   ├── services/      # API 调用服务
│   │   └── utils/         # 工具函数
│   └── package.json
├── backend/           # Node.js + Express + TypeScript 后端
│   ├── src/
│   │   ├── routes/        # API 路由
│   │   └── services/      # 业务逻辑服务
│   └── package.json
├── shared/            # 共享 TypeScript 类型定义
│   └── types/
└── README.md
```

## 技术栈

### 前端
- React 18 + TypeScript
- Vite (构建工具)
- Tailwind CSS (样式)
- React Router (路由)
- React Hook Form (表单处理)
- Axios (HTTP 客户端)
- date-fns (日期处理)

### 后端
- Node.js + Express
- TypeScript
- yaml 库 (支持注释保留)


### 测试
- Vitest (测试框架)
- fast-check (属性测试)

## 快速开始

### 前置要求

- Node.js 18+ 
- npm 或 yarn
- 一个使用 Reimu 主题的 Hugo 博客

### 安装

1. 克隆或下载项目后，进入 `blog-config-tool` 目录

2. 安装后端依赖：
```bash
cd backend
npm install
```

3. 安装前端依赖：
```bash
cd ../frontend
npm install
```

### 运行

1. 启动后端服务（端口 3001）：
```bash
cd backend
npm run dev
```

2. 在新终端启动前端服务（端口 5173）：
```bash
cd frontend
npm run dev
```

3. 打开浏览器访问 `http://localhost:5173`

### 首次使用

1. 首次打开工具时，会提示设置博客根目录路径
2. 输入 Hugo 博客的根目录路径（包含 `hugo.toml` 的目录）
3. 工具会验证路径是否有效（需要包含 `hugo.toml` 和 `config/_default/params.yml`）
4. 验证通过后即可开始使用

## 使用指南

### 配置编辑

1. 点击左侧菜单的「配置编辑」
2. 在各个配置区块中修改设置：
   - **基本设置**: 作者、邮箱、副标题、描述
   - **图片设置**: 横幅图片、头像
   - **菜单配置**: 添加/删除/排序菜单项
   - **社交链接**: 配置社交媒体链接
   - **页脚设置**: 建站年份、统计显示等
   - **样式设置**: 侧边栏位置、目录显示、暗色模式等
   - **功能设置**: 评论、搜索、动画效果等
3. 点击「预览更改」查看修改内容
4. 点击「保存配置」应用更改

### 创建文章

1. 点击左侧菜单的「文章管理」
2. 填写文章信息：
   - **标题** (必填): 文章标题，会自动生成文件名
   - **日期** (必填): 发布日期
   - **分类/标签**: 可从已有分类/标签中选择
   - **封面图片**: 可从图片库选择或输入 URL
   - **描述**: 文章简介
3. 点击「预览 Front-matter」查看生成的元数据
4. 点击「创建文章」生成 Markdown 文件

### 图片选择

在配置编辑或文章创建中选择图片时：
1. 点击「选择」或「选择图片」按钮
2. 在弹出的图片选择器中：
   - **浏览图片**: 从 `static` 目录选择本地图片
   - **输入 URL**: 使用外部图片链接
3. 点击图片即可选中

### 更改博客路径

1. 点击左侧菜单的「设置」
2. 输入新的博客根目录路径
3. 点击「更新路径」
4. 页面会自动刷新加载新路径的数据

## API 接口

### 设置 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/settings/blog-path` | 获取当前博客路径 |
| POST | `/api/settings/blog-path` | 设置博客路径 |
| POST | `/api/settings/validate-path` | 验证博客路径 |

### 配置 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/config` | 获取配置 |
| PUT | `/api/config` | 更新配置 |

### 图片 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/images` | 获取图片列表 |

### 文章 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/posts` | 获取文章列表 |
| POST | `/api/posts` | 创建新文章 |

## 运行测试

### 后端测试
```bash
cd backend
npm test
```

### 前端测试
```bash
cd frontend
npm test
```

### 运行所有测试（包含属性测试）
```bash
# 后端
cd backend
npm run test:run

# 前端
cd frontend
npm run test:run
```

## 配置选项

### 环境变量

**前端** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

**后端** (`backend/.env`):
```env
PORT=3001
```

## 故障排除

### 无法连接到服务器
- 确保后端服务正在运行（端口 3001）
- 检查防火墙设置

### 路径验证失败
- 确保路径指向 Hugo 博客根目录
- 检查是否存在 `hugo.toml` 文件
- 检查是否存在 `config/_default/params.yml` 文件

### 配置保存失败
- 检查文件写入权限
- 确保 `params.yml` 文件格式正确

## 开发

### 构建生产版本

```bash
# 前端
cd frontend
npm run build

# 后端
cd backend
npm run build
```

### 代码检查

```bash
# 前端
cd frontend
npm run lint

# 后端
cd backend
npm run lint
```

## 许可证

MIT License
