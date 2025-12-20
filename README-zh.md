简单的多文本注释工具，基于 [Next.js](https://nextjs.org) 项目构建。

## Getting Started / 开始使用

First, run the development server:

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

你可以通过修改 `app/page.tsx` 开始编辑页面。当你编辑文件时，页面会自动更新。

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

该项目使用 [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) 自动优化和加载 [Geist](https://vercel.com/font)，这是 Vercel 的新字体家族。

## Environment Variables / 环境变量

You can configure the application using the following environment variables:

你可以使用以下环境变量配置应用程序：

### Storage Service Configuration / 存储服务配置
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

### Local Development / 本地开发
Create a `.env.local` file in the project root to set these variables:

在项目根目录下创建一个 `.env.local` 文件来设置这些变量：

```bash
# Example: .env.local
HADEX_STORAGE_TYPE=indexeddb
HADEX_DB_NAME=MyCustomDB
```

### Docker Deployment / Docker 部署
You can pass environment variables directly to the `docker run` command or configure them in `docker-compose.yml`.

你可以将环境变量直接传递给 `docker run` 命令，或在 `docker-compose.yml` 中配置它们。

## Deploy on Vercel / 在 Vercel 上部署

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

部署 Next.js 应用的最简单方法是使用 Next.js 创作者提供的 [Vercel 平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)。

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

有关更多详细信息，请查看我们的 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。

## Docker Deployment / Docker 部署

### Pull from GHCR / 从 GHCR 拉取

You can pull the latest Docker image from GitHub Container Registry (GHCR):

你可以从 GitHub Container Registry (GHCR) 拉取最新的 Docker 镜像：

```bash
docker pull ghcr.io/kurok1/hadex:latest
# or pull a specific tag
# 或拉取特定标签
docker pull ghcr.io/kurok1/hadex:v1.0.0
```

### Run the Container / 运行容器

```bash
docker run -p 3000:3000 ghcr.io/kurok1/hadex:latest
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

### Build Locally / 本地构建

If you prefer to build the Docker image locally:

如果你喜欢在本地构建 Docker 镜像：

```bash
# Build the image
# 构建镜像
docker build -t hadex .

# Run the container
# 运行容器
docker run -p 3000:3000 hadex
```

### Docker Compose

If you prefer to use Docker Compose, create a `docker-compose.yml` file in the project root:

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
      - HADEX_STORAGE_TYPE=indexeddb  # Available types: indexeddb, memory (extend as implemented)
      - HADEX_STORAGE_TYPE=indexeddb  # 可用类型: indexeddb, memory（根据实现扩展）
      - HADEX_DB_NAME=AnnotationDB      # IndexedDB database name
      - HADEX_DB_NAME=AnnotationDB      # IndexedDB 数据库名称
      - HADEX_STORE_NAME=Annotations    # IndexedDB store name
      - HADEX_STORE_NAME=Annotations    # IndexedDB 存储名称
      - HADEX_DB_VERSION=1              # IndexedDB version
      - HADEX_DB_VERSION=1              # IndexedDB 版本
    # Optional: Mount additional volumes if needed
    # 可选：如果需要，挂载额外的卷
    # volumes:
    #   - ./data:/app/data
```

Then run:

然后运行：

```bash
docker-compose up -d
```

To use a specific tag:

要使用特定标签：

```yaml
image: ghcr.io/kurok1/hadex:v1.0.0
```

### Automatic Builds / 自动构建

This project uses GitHub Actions to automatically build and push Docker images to GHCR whenever a new tag is created (e.g., `v1.0.0`).

该项目使用 GitHub Actions，在创建新标签（例如 `v1.0.0`）时自动构建并将 Docker 镜像推送到 GHCR。

The workflow configuration is located at `.github/workflows/docker-build-push.yml`.

工作流配置位于 `.github/workflows/docker-build-push.yml`。
