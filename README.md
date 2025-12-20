This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

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
