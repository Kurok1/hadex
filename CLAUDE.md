# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## HADEX - 多语言文本标注工具

HADEX 是一个基于浏览器的文本标注工具，使用 Next.js 16、React 19 和 TypeScript 构建。支持命名实体识别（NER）和文本分类任务，具有持久化存储和中英文国际化支持。

## 开发命令

```bash
# 开发服务器 (http://localhost:3000)
npm run dev

# 生产构建
npm run build

# 生产服务器
npm start

# 代码检查
npm run lint
```

## 架构设计

### 存储服务工厂模式

应用使用工厂模式管理存储服务，支持灵活的存储后端切换：

- **IndexedDB 存储** (`app/services/indexeddb-storage.ts`)：持久化的客户端存储
- **内存存储** (`app/services/memory-storage.ts`)：仅限会话的非持久化存储
- **存储工厂** (`app/services/storage-factory.ts`)：根据 `HADEX_STORAGE_TYPE` 环境变量创建存储实例

存储接口定义在 `app/services/storage.ts`。添加新存储实现时，需实现此接口并在工厂中注册。

### 国际化架构

i18n 系统使用 `next-intl` 并采用模块化消息加载机制：

- **配置文件**：`i18n/config.ts`、`i18n/routing.ts`、`i18n/request.ts`
- **消息文件**：`i18n/messages/{locale}/{module}.json`
- **支持的语言**：`zh`（中文）、`en`（英文）

请求处理器（`i18n/request.ts`）动态加载翻译模块。每个功能都有独立的消息文件（如 `nav_bar.json`、`text_annotation.json`）。

### App Router 结构

Next.js App Router 配合国际化路由：

```
app/
├── [locale]/           # 国际化路由
│   ├── ner/           # 命名实体识别工具
│   ├── classification/# 文本分类工具
│   └── page.tsx       # 首页（功能导航）
├── components/        # 共享 UI 组件
├── services/          # 存储服务
└── support/           # 工具模块
```

### 任务特定组件

每个标注任务（NER、分类）都有独立的组件目录：

- `app/[locale]/ner/components/`：NER 专用组件（实体选择器、标注显示）
- `app/[locale]/classification/components/`：分类任务专用组件

### 主题系统

- 使用 `next-themes` 实现深色/浅色主题切换
- 主题切换组件：`app/components/layouts/ThemeSwitcher.tsx`
- 主题设置会跨会话持久化

## 环境变量

通过环境变量配置存储行为：

| 变量名 | 默认值 | 说明 |
|----------|---------|-------------|
| `HADEX_STORAGE_TYPE` | `indexeddb` | 存储后端：`indexeddb` 或 `memory` |
| `HADEX_DB_NAME` | `AnnotationDB` | IndexedDB 数据库名称 |
| `HADEX_STORE_NAME` | `Annotations` | IndexedDB 对象存储名称 |
| `HADEX_DB_VERSION` | `1` | IndexedDB 版本 |

本地开发创建 `.env.local` 文件，或通过 Docker/Docker Compose 传入。

## 核心技术栈

- **Next.js 16.1.0** 配合 App Router
- **React 19.2.3**
- **TypeScript 5** 配置路径别名（`@/*`）
- **Tailwind CSS 4** + **DaisyUI 5.5.14** 样式框架
- **next-intl 4.6.1** 国际化
- **next-themes 0.4.6** 主题管理
- **SparkMD5 3.0.2** 文件哈希

## 部署

### Docker

镜像发布在 GHCR：`ghcr.io/kurok1/hadex:latest`

```bash
docker run -p 3000:3000 ghcr.io/kurok1/hadex:latest
```

### Docker Compose

使用提供的 `docker-compose.yml` 进行便捷部署，支持环境变量配置。

### 自动构建

GitHub Actions 工作流（`.github/workflows/docker-build-push.yml`）会在创建新标签时自动构建并推送 Docker 镜像。

## 添加新的标注任务

添加新的标注任务类型时：

1. 在 `app/[locale]/{task-name}/` 下创建新路由
2. 在 `app/[locale]/{task-name}/components/` 添加任务专用组件
3. 创建 i18n 消息文件：`i18n/messages/zh/{task-name}.json` 和 `i18n/messages/en/{task-name}.json`
4. 在首页（`app/[locale]/page.tsx`）添加导航卡片
5. 遵循现有模式，通过工厂使用存储服务
