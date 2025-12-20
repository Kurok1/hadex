# Simple multi-text annotation tool bootstrapped with [Next.js](https://nextjs.org) project.

[中文版 README](/README-zh.md)

## Getting Started

First, run the development server:

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

You can configure the application using the following environment variables:

### Storage Service Configuration
| Variable Name               | Default Value      | Description                                                                 |
|------------------------------|--------------------|-----------------------------------------------------------------------------|
| `HADEX_STORAGE_TYPE`         | `indexeddb`        | Storage service type. Available: `indexeddb` (persistent), `memory` (non-persistent, session-only) |
| `HADEX_DB_NAME`              | `AnnotationDB`     | IndexedDB database name (used when STORAGE_TYPE=indexeddb)                 |
| `HADEX_STORE_NAME`           | `Annotations`      | IndexedDB object store name (used when STORAGE_TYPE=indexeddb)             |
| `HADEX_DB_VERSION`           | `1`                | IndexedDB database version (used when STORAGE_TYPE=indexeddb)              |

### Local Development
Create a `.env.local` file in the project root to set these variables:

```bash
# Example: .env.local
HADEX_STORAGE_TYPE=indexeddb
HADEX_DB_NAME=MyCustomDB
```

### Docker Deployment
You can pass environment variables directly to the `docker run` command or configure them in `docker-compose.yml`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Docker Deployment

### Pull from GHCR

You can pull the latest Docker image from GitHub Container Registry (GHCR):

```bash
docker pull ghcr.io/kurok1/hadex:latest
# or pull a specific tag
docker pull ghcr.io/kurok1/hadex:v1.0.0
```

### Run the Container

```bash
docker run -p 3000:3000 ghcr.io/kurok1/hadex:latest
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build Locally

If you prefer to build the Docker image locally:

```bash
# Build the image
docker build -t hadex .

# Run the container
docker run -p 3000:3000 hadex
```

### Docker Compose

If you prefer to use Docker Compose, create a `docker-compose.yml` file in the project root:

```yaml
version: '3.8'

services:
  hadex:
    image: ghcr.io/kurok1/hadex:latest
    ports:
      - "3000:3000"
    restart: unless-stopped
    # Storage service configuration environment variables
    environment:
      - HADEX_STORAGE_TYPE=indexeddb  # Available types: indexeddb, memory (extend as implemented)
      - HADEX_DB_NAME=AnnotationDB      # IndexedDB database name
      - HADEX_STORE_NAME=Annotations    # IndexedDB store name
      - HADEX_DB_VERSION=1              # IndexedDB version
    # Optional: Mount additional volumes if needed
    # volumes:
    #   - ./data:/app/data
```

Then run:

```bash
docker-compose up -d
```

To use a specific tag:

```yaml
image: ghcr.io/kurok1/hadex:v1.0.0
```

### Automatic Builds

This project uses GitHub Actions to automatically build and push Docker images to GHCR whenever a new tag is created (e.g., `v1.0.0`).

The workflow configuration is located at `.github/workflows/docker-build-push.yml`.
