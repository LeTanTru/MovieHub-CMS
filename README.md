![MovieHub](./src/assets/images/logo-with-text.png)

<h1 align="center">MovieHub CMS Tenant</h1>

MovieHub CMS Tenant is the **administration console** for a multi-tenant movie platform.  
It helps internal teams manage the full content lifecycle: catalog setup, people metadata, media assets, publishing structure, access control, and UI configuration.

## Project Summary

This project is a modern web CMS built with **Next.js 16 (App Router) + TypeScript** for reliability, scalability, and maintainability.

At a high level, it provides:

- Centralized movie operations: categories, movies, movie items, comments, and reviews.
- Talent and metadata management: actors/directors and related entities.
- Media workflows: video library and rich content editing.
- Access governance: employee/audience management, roles, and permissions.
- Tenant-level customization: sidebar highlights, style presets, and content collections.
- System administration: permission controls and app-level operational settings.

The app uses a feature-oriented `src/` structure with reusable components, query hooks, validation schemas, and state stores to keep business logic modular and consistent across modules.

## Key Functional Areas

- User management: employees, audiences, and role/permission groups.
- Movie management: categories, people (actors/directors), video library, movies, movie items, comments, and reviews.
- UI management: sidebar highlights, style presets, and content collections.
- System management: app versioning and permission administration.

## Tech Stack

- Framework: Next.js (App Router), React 19, TypeScript.
- Data & state: TanStack Query, Zustand.
- Forms & validation: React Hook Form, Zod.
- UI: Tailwind CSS, Radix UI, Framer Motion, Lucide icons.
- Media/editor: HLS.js, Vidstack, TinyMCE.

## Prerequisites

- Node.js 20+ (recommended).
- Yarn package manager.

## Getting Started

1. Install dependencies:

```bash
yarn
```

2. Create environment configuration:

```bash
# macOS/Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

3. Fill all required variables in `.env`:

- `NEXT_PUBLIC_NODE_ENV`
- `NEXT_PUBLIC_API_META_ENDPOINT_URL`
- `NEXT_PUBLIC_API_TENANT_ENDPOINT_URL`
- `NEXT_PUBLIC_API_MEDIA_URL`
- `NEXT_PUBLIC_APP_USERNAME`
- `NEXT_PUBLIC_APP_PASSWORD`
- `NEXT_PUBLIC_URL`
- `NEXT_PUBLIC_TINYMCE_URL`
- `NEXT_PUBLIC_API_SOCKET`
- `NEXT_PUBLIC_GRANT_TYPE`
- `NEXT_PUBLIC_TENANT_ID`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_GRANT_TYPE_REFRESH_TOKEN`
- `NEXT_PUBLIC_MEDIA_HOST`
- `NEXT_PUBLIC_CLIENT_TYPE`

4. Start development server:

```bash
yarn dev
```

The app runs on `http://localhost:3001`.

## Available Scripts

- `yarn dev` — start local development server on port `3001`.
- `yarn clean-dev` — clear build cache and run dev server.
- `yarn build` — create production build.
- `yarn start` — run production server on port `3001`.
- `yarn lint` — run ESLint.
- `yarn format` — format code with Prettier.

## Project Structure

```text
src/
  app/                # Next.js app routes and feature pages
  components/         # Reusable UI and form components
  constants/          # API config, menu config, app constants
  hooks/              # Custom React hooks
  queries/            # Data fetching/mutation hooks
  routes/             # Route definitions and permission mapping
  schemaValidations/  # Zod schemas
  store/              # Zustand stores
  utils/              # Shared utilities
```

## Author

Developed by [Lê Tấn Trụ](https://github.com/LeTanTru).
