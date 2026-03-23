![MovieHub](./src/assets/images/logo-with-text.png)

<h1 align="center">MovieHub CMS Tenant</h1>

MovieHub CMS Tenant is the internal administration console for a multi-tenant movie platform.  
It is used by operations teams to manage catalog content, metadata, publishing assets, user access, and tenant-level UI configuration.

## Project Summary

This repository contains a CMS built with **Next.js 16 (App Router) + TypeScript**.  
The system centralizes movie-platform back-office workflows across:

- User administration (admins, employees, audiences, role/permission groups)
- Movie domain management (categories, people, movies, movie items, comments, reviews)
- Media and rich-content management (video library and editor-integrated flows)
- UI/tenant configuration (sidebar, styles, collections)
- System-level management (permission administration and app-version features)

The app follows a feature-oriented structure under `src/`, with shared hooks, query modules, validation schemas, and reusable UI/form primitives.

## Tech Stack

- Framework: Next.js (App Router), React 19, TypeScript
- Data/state: TanStack Query, Zustand
- Forms/validation: React Hook Form, Zod
- UI: Tailwind CSS, Radix UI, Framer Motion
- Media/editor: HLS.js, Vidstack, TinyMCE

## Prerequisites

- Node.js 20+
- Yarn

## Getting Started

1. Install dependencies:

```bash
yarn
```

2. Create environment file:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

3. Fill required environment variables in `.env`:

- `NEXT_PUBLIC_NODE_ENV`
- `NEXT_PUBLIC_AUTH_API_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_API_MEDIA_URL`
- `NEXT_PUBLIC_APP_USERNAME`
- `NEXT_PUBLIC_APP_PASSWORD`
- `NEXT_PUBLIC_URL`
- `NEXT_PUBLIC_TINYMCE_URL`
- `NEXT_PUBLIC_API_SOCKET_URL`
- `NEXT_PUBLIC_GRANT_TYPE`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_GRANT_TYPE_REFRESH_TOKEN`
- `NEXT_PUBLIC_MEDIA_HOST`
- `NEXT_PUBLIC_CLIENT_TYPE`

4. Start development server:

```bash
yarn dev
```

Application runs at `http://localhost:3001`.

## Scripts

- `yarn dev`: Start dev server on port `3001`
- `yarn clean-dev`: Remove `.next` and start dev server
- `yarn build`: Build production bundle
- `yarn start`: Start production server on port `3001`
- `yarn lint`: Run ESLint
- `yarn format`: Run Prettier

## Project Structure

```text
src/
  app/                # Next.js routes and feature pages
  components/         # Shared components and UI/form building blocks
  constants/          # API config, app constants, menu/query keys
  hooks/              # Reusable client hooks
  queries/            # TanStack Query hooks by domain
  routes/             # Route metadata and permission mapping
  schemaValidations/  # Zod schemas
  store/              # Zustand stores
  utils/              # Shared utilities (HTTP, storage, formatting, etc.)
```
