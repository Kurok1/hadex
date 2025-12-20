# 简单的多文本注释工具，基于 [Next.js](https://nextjs.org) 项目构建。

## 开始使用
首先，运行开发服务器：

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

你可以通过修改 `app/page.tsx` 开始编辑页面。当你编辑文件时，页面会自动更新。

该项目使用 [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) 自动优化和加载 [Geist](https://vercel.com/font)，这是 Vercel 的新字体家族。

## 环境变量

你可以使用以下环境变量配置应用程序：

### 存储服务配置
| Variable Name               | Default Value      | Description                                                                 |
|------------------------------|--------------------|-----------------------------------------------------------------------------|
| `HADEX_STORAGE_TYPE`         | `indexeddb`        | Storage service type. Available: `indexeddb` (persistent), `memory` (non-persistent, session-only) |
| `HADEX_STORAGE_TYPE`         | `indexeddb`        | 存储服务类型。可用选项：`indexeddb`（持久化）、`memory`（非持久化，仅会话） |
| `HADEX_DB_NAME`              | `AnnotationDB`     | IndexedDB database name (used when STORAGE_TYPE=indexeddb)                 |
| `HADEX_DB_NAME`              | `AnnotationDB`     | IndexedDB 数据库名称（当 STORAGE_TYPE=indexeddb 时使用）                     |
| `HADEX_STORE_NAME`           | `Annotations`      | IndexedDB object store name (used when STORAGE_TYPE=indexeddb)             |
| `HADEX_STORE_NAME`           | `Annotations`      | IndexedDB 对象存储名称（当 STORAGE_TYPE=indexeddb 时使用）                 |
| `HADEX_DB_VERSION`           | `1`                | IndexedDB database version (used when STORAGE_TYPE=indexeddb)              |
| `HADEX_DB_VERSION`           | `1`                | IndexedDB 数据库版本（当 STORAGE_TYPE=indexeddb 时使用）                   |

### 本地开发
在项目根目录下创建一个 `.env.local` 文件来设置这些变量：

```bash
# Example: .env.local
HADEX_STORAGE_TYPE=indexeddb
HADEX_DB_NAME=MyCustomDB
```

### Docker 部署
你可以将环境变量直接传递给 `docker run` 命令，或在 `docker-compose.yml` 中配置它们。

## 在 Vercel 上部署

部署 Next.js 应用的最简单方法是使用 Next.js 创作者提供的 [Vercel 平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)。

有关更多详细信息，请查看我们的 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。

## Docker Deployment / Docker 部署

### 从 GHCR 拉取

你可以从 GitHub Container Registry (GHCR) 拉取最新的 Docker 镜像：

```bash
docker pull ghcr.io/kurok1/hadex:latest
# 或拉取特定标签
docker pull ghcr.io/kurok1/hadex:v1.0.0
```

### 运行容器

```bash
docker run -p 3000:3000 ghcr.io/kurok1/hadex:latest
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

### 本地构建

如果你喜欢在本地构建 Docker 镜像：

```bash
# 构建镜像
docker build -t hadex .

# 运行容器
docker run -p 3000:3000 hadex
```

### Docker Compose

如果你喜欢使用 Docker Compose，请在项目根目录下创建一个 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  hadex:
    image: ghcr.io/kurok1/hadex:latest
    ports:
      - "3000:3000"
    restart: unless-stopped
    # Storage service configuration environment variables
    # 存储服务配置环境变量
    environment:
      - HADEX_STORAGE_TYPE=indexeddb  # 可用类型: indexeddb, memory（根据实现扩展）
      - HADEX_DB_NAME=AnnotationDB      # IndexedDB 数据库名称
      - HADEX_STORE_NAME=Annotations    # IndexedDB 存储名称
      - HADEX_DB_VERSION=1              # IndexedDB 版本
    # 可选：如果需要，挂载额外的卷
    # volumes:
    #   - ./data:/app/data
```

然后运行：

```bash
docker-compose up -d
```

要使用特定标签：

```yaml
image: ghcr.io/kurok1/hadex:v1.0.0
```

### 自动构建

该项目使用 GitHub Actions，在创建新标签（例如 `v1.0.0`）时自动构建并将 Docker 镜像推送到 GHCR。

工作流配置位于 `.github/workflows/docker-build-push.yml`。
