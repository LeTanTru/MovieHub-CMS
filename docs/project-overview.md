# MovieHub CMS Project Overview

## Purpose

MovieHub CMS is a Next.js App Router administration console for a movie streaming platform. It manages content, media, users, permissions, app configuration, notifications, statistics, and video processing workflows.

The project is a frontend CMS that talks to several backend services:

- Auth API for accounts, employees, groups, permissions, login, logout, and token refresh.
- Main API for movies, categories, collections, comments, reviews, user reports, settings, statistics, subtitles, and platform configuration.
- Media API and internal API routes for file deletion and chunked video upload.
- MQTT broker for realtime notifications and media-processing events.

## Tech Stack

- Runtime: Node.js 20.
- Framework: Next.js 16 App Router.
- Language: TypeScript.
- UI: React 19, Tailwind CSS, Radix UI wrappers, lucide-react, react-icons.
- Data fetching: TanStack Query.
- Local state: Zustand.
- Forms: React Hook Form plus Zod validation.
- HTTP: Axios with centralized auth, CSRF, timeout, upload, and refresh-token handling.
- Rich content and media: TinyMCE, Vidstack, HLS.js, S3-compatible uploads through AWS SDK.
- Realtime: MQTT.
- Tooling: ESLint 9, Prettier, Husky, lint-staged, Commitlint.

## Commands

```bash
yarn
yarn dev
yarn clean-dev
yarn build
yarn start
yarn lint
yarn format
ANALYZE=true yarn build
```

Notes:

- The dev server uses port 3001 with Turbopack.
- Production output is standalone.
- There is no configured test framework and no test script.
- Commit messages are conventional commits.

## Top-Level Structure

```text
.
|-- docs/                         Documentation, audit, and planning notes
|-- public/                       Static public assets
|-- src/
|   |-- app/                      Next.js App Router routes and API routes
|   |-- assets/                   Images and static app assets
|   |-- components/               Shared UI, form, table, provider components
|   |-- constants/                API config, query keys, option lists, storage keys
|   |-- hooks/                    Shared app hooks and CRUD abstractions
|   |-- lib/                      Library setup helpers
|   |-- logger/                   Logging helper
|   |-- queries/                  TanStack Query hooks
|   |-- routes/                   Central route metadata and route permissions
|   |-- schemaValidations/        Zod schemas
|   |-- store/                    Zustand stores
|   |-- styles/                   Global and grid styles
|   |-- types/                    Shared TypeScript types
|   `-- utils/                    HTTP, URL, storage, permission, media utilities
|-- Dockerfile                    Multi-stage standalone Next.js image
|-- next.config.ts                Security headers, image config, React Compiler, bundle analyzer
|-- package.json                  Scripts and dependencies
|-- tsconfig.json                 TypeScript configuration
`-- eslint.config.mjs             ESLint flat config
```

## App Modules

Main route modules under `src/app`:

- `(auth)`: login flow.
- `profile`: current user profile.
- `actions`: Next.js server action handlers.
- `admin`: admin account management.
- `employee`: employee management.
- `user`: platform user management.
- `user-report`: user reports for comments and reviews.
- `group-permission`: groups and permission assignment.
- `category`: category CRUD.
- `person`: actor/director CRUD.
- `movie`: movie, movie item, movie person, comments, and reviews.
- `video-library`: source video records, processing actions, subtitles, and subtitle editor.
- `collection`: collection and collection item management.
- `sidebar`: sidebar configuration.
- `style`: style configuration.
- `app-version`: app version releases.
- `server-config`: server configuration.
- `setting`: key/value settings.
- `notification`: notification list and actions.
- `statistics`: overview, movie distribution, and top movies.
- `contact` and `privacy`: public static pages.
- `api`: BFF-style server routes for auth/session and protected file operations.

## Runtime Entry Points

- Root layout: `src/app/layout.tsx`.
- App route metadata: `src/routes/route.ts`.
- API and permission metadata: `src/constants/api-config.ts`.
- HTTP client: `src/utils/http.util.ts`.
- Environment validation: `src/config.ts`.
- Query client defaults: `src/components/providers/query-provider/get-query-client.ts`.
- Auth store: `src/store/auth.store.ts`.
- Session query: `src/queries/auth.query.ts`.

## Documentation Index

- `docs/architecture.md`: provider tree, auth, permission, HTTP, realtime, security, and performance model.
- `docs/development-guide.md`: local workflow, module patterns, forms, queries, stores, uploads, and git conventions.
- `docs/module-map.md`: route modules, internal API routes, shared components, hooks, stores, and query modules.
- `docs/security-scan.md`: static security review and remediation backlog from 2026-06-17.
- `docs/subtitle-editor-flow.md`: subtitle editor state and interaction flow.
- `docs/comment-toxic-spans-modal-summary.md`: toxic-span moderation modal behavior.

## Environment

Public runtime config is validated in `src/config.ts` using Zod `safeParse`. The public keys are:

- `NEXT_PUBLIC_NODE_ENV`
- `NEXT_PUBLIC_AUTH_API_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_API_MEDIA_URL`
- `NEXT_PUBLIC_TINYMCE_URL`
- `NEXT_PUBLIC_MEDIA_HOST`
- `NEXT_PUBLIC_CLIENT_TYPE`
- `NEXT_PUBLIC_MQTT_BROKER`
- `NEXT_PUBLIC_MQTT_USERNAME`
- `NEXT_PUBLIC_MQTT_PASSWORD`
- `NEXT_PUBLIC_URL`

Private/server-side values are present in `.env.example` and used by API routes:

- `APP_USERNAME`
- `APP_PASSWORD`
- `GRANT_TYPE`
- `GRANT_TYPE_REFRESH_TOKEN`
- `MINIO_ENDPOINT`
- `MINIO_ROOT_USER`
- `MINIO_ROOT_PASSWORD`
- `MINIO_BUCKET`
- `MINIO_UPLOAD_FOLDER`
- `MINIO_UPLOAD_PREFIX`

Do not read or commit `.env`.

## Deployment Shape

`Dockerfile` uses three stages:

1. `deps`: install dependencies with `yarn install --frozen-lockfile`.
2. `builder`: copy source, inject build args for public env, run `yarn build`.
3. `runner`: copy standalone output, run as non-root `nextjs`, expose port 3001, start `server.js`.

`next.config.ts` enables standalone output, React Compiler, optimized CSS, optimized `@vidstack/react` imports, security headers, CSP, bundle analyzer via `ANALYZE=true`, and remote image patterns.
