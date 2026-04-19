![MovieHub](./src/assets/images/logo-with-text.webp)

<h1 align="center">MovieHub CMS</h1>

<p align="center">
  <strong>A content management system for movie streaming platforms</strong>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-development">Development</a>
</p>

---

## 📋 Overview

**MovieHub CMS** is an administration console for managing a movie streaming platform. It is built with Next.js App Router and TypeScript, with configuration-driven APIs, routes, and permissions.

### What is MovieHub CMS?

This system serves as the central hub for:

- **Content Management**: Manage movies, categories, people, collections, comments, and reviews
- **User Administration**: Manage admins, employees, groups, and profiles
- **Media Management**: Manage video library and related media metadata
- **Platform Configuration**: Manage sidebar, style, and app/server configuration
- **Permission System**: Enforce route and action permissions using permission codes

Built with **Next.js (App Router)** and **TypeScript**, the system emphasizes type safety, consistency, and maintainability.

## ✨ Features

### Content Management

- **Movies & Series**: Manage movies, episodes/items, and related data
- **Categories & Collections**: Organize content with categories and collections
- **People Management**: Manage actors/directors and related references
- **Rich Metadata**: Handle comments, reviews, and classifications
- **Media Assets**: Video-library workflows and uploads

### User & Access Management

- **Role System**: Admin and employee flows with user management
- **Permission Groups**: Group-based permission assignment
- **Profile Management**: Profile update workflows
- **Authentication**: JWT-based auth with refresh token handling
- **Authorization**: Route-level and API-level permission enforcement

### Platform Configuration

- **Dynamic Sidebar**: Configurable navigation
- **Style Management**: UI styling configuration
- **Version/Server Config**: App version and server settings modules

### Developer Experience

- **Type Safety**: TypeScript + Zod schemas
- **Form Management**: React Hook Form + shared form components
- **State Management**: Zustand + TanStack Query
- **UI Components**: Radix UI wrappers + Framer Motion
- **Code Quality**: ESLint, Prettier, Husky, lint-staged, Commitlint

## 🛠 Tech Stack

### Core Framework

| Technology                                    | Purpose                                     |
| --------------------------------------------- | ------------------------------------------- |
| [Next.js](https://nextjs.org/)                | React framework with App Router & Turbopack |
| [React](https://react.dev/)                   | UI library                                  |
| [TypeScript](https://www.typescriptlang.org/) | Strict type safety                          |
| [Tailwind CSS](https://tailwindcss.com/)      | Utility-first styling                       |

### State & Data Management

| Technology                                   | Purpose                 |
| -------------------------------------------- | ----------------------- |
| [TanStack Query](https://tanstack.com/query) | Server state & caching  |
| [Zustand](https://github.com/pmndrs/zustand) | Client state management |
| [Axios](https://axios-http.com/)             | HTTP client with auth   |

### Forms & Validation

| Technology                                      | Purpose                             |
| ----------------------------------------------- | ----------------------------------- |
| [React Hook Form](https://react-hook-form.com/) | Performant form handling            |
| [Zod](https://zod.dev/)                         | v4 schema validation & type support |

### UI Components & Animations

| Technology                                      | Purpose                   |
| ----------------------------------------------- | ------------------------- |
| [Radix UI](https://www.radix-ui.com/)           | Headless UI primitives    |
| [Framer Motion](https://www.framer.com/motion/) | Animations (`LazyMotion`) |
| [Lucide React](https://lucide.dev/)             | Icon library              |
| [Recharts](https://recharts.org/)               | Charts                    |
| [@dnd-kit](https://dndkit.com/)                 | Drag & drop               |

### Media & Rich Content

| Technology                                               | Purpose               |
| -------------------------------------------------------- | --------------------- |
| [Vidstack](https://www.vidstack.io/)                     | Video player          |
| [TinyMCE](https://www.tiny.cloud/)                       | Rich text editor      |
| [AWS SDK S3](https://aws.amazon.com/sdk-for-javascript/) | Presigned URL uploads |
| [MQTT](https://mqtt.org/)                                | Realtime messaging    |

### Development Tools

| Technology                                 | Purpose                         |
| ------------------------------------------ | ------------------------------- |
| [ESLint](https://eslint.org/)              | Code linting                    |
| [Prettier](https://prettier.io/)           | Code formatting                 |
| [Husky](https://typicode.github.io/husky/) | Git pre-commit hooks            |
| [Commitlint](https://commitlint.js.org/)   | Conventional commit enforcement |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20 or higher
- **Yarn** package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd MovieHub-CMS
   ```

2. **Install dependencies**

   ```bash
   yarn
   ```

3. **Configure environment variables**

   Copy the example environment file:

   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env

   # macOS/Linux
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   NEXT_PUBLIC_NODE_ENV=development
   NEXT_PUBLIC_AUTH_API_URL=https://your-auth-api.com
   NEXT_PUBLIC_API_URL=https://your-api.com
   NEXT_PUBLIC_API_MEDIA_URL=https://your-media-api.com
   NEXT_PUBLIC_APP_USERNAME=your-app-username
   NEXT_PUBLIC_APP_PASSWORD=your-app-password
   NEXT_PUBLIC_URL=http://localhost:3001
   NEXT_PUBLIC_TINYMCE_URL=https://cdn.tiny.cloud
   NEXT_PUBLIC_GRANT_TYPE=password
   NEXT_PUBLIC_APP_NAME=MovieHub CMS
   NEXT_PUBLIC_GRANT_TYPE_REFRESH_TOKEN=refresh_token
   NEXT_PUBLIC_MEDIA_HOST=https://your-media-host.com
   NEXT_PUBLIC_CLIENT_TYPE=CMS
   ```

4. **Start the development server**

   ```bash
   yarn dev
   ```

   The application will be available at **http://localhost:3001**

## 📜 Available Scripts

These commands match `package.json` exactly:

| Command            | Description                                       |
| ------------------ | ------------------------------------------------- |
| `yarn dev`         | Start development server (`next dev --turbopack`) |
| `yarn clean-dev`   | Remove `.next`, then start dev server             |
| `yarn prebuild`    | Remove `.next` and `out` before build             |
| `yarn build`       | Build production bundle                           |
| `yarn start`       | Start production server on port 3001              |
| `yarn prepare`     | Install/refresh Husky hooks                       |
| `yarn lint`        | Run ESLint on `.ts/.tsx/.js/.jsx`                 |
| `yarn format`      | Format code with Prettier                         |
| `yarn lint-staged` | Run lint-staged                                   |

### Testing status

- No test framework is configured in this repository.
- There is no `test` script in `package.json`.
- There is no single-test command available.

## 📁 Project Structure

```text
MovieHub-CMS/
├── .github/                    # GitHub configuration and CI/CD
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth route group
│   │   ├── admin/              # Admin management
│   │   ├── category/           # Category CRUD
│   │   ├── collection/         # Collection management
│   │   ├── employee/           # Employee management
│   │   ├── group-permission/   # Permission groups
│   │   ├── movie/              # Movie management
│   │   ├── person/             # People management
│   │   ├── profile/            # User profile
│   │   ├── sidebar/            # Sidebar configuration
│   │   ├── style/              # Style management
│   │   ├── user/               # User management
│   │   └── video-library/      # Video library
│   ├── assets/                 # Images, fonts, static resources
│   ├── components/             # Reusable React components
│   │   ├── form/               # Form building blocks
│   │   ├── ui/                 # Radix UI wrappers
│   │   ├── providers/          # Context providers
│   │   ├── table/              # Table components
│   │   └── video-player/       # Vidstack player
│   ├── constants/              # App constants/configuration
│   │   ├── api-config.ts       # Endpoints + permission codes
│   │   ├── menu-config.ts      # Sidebar navigation
│   │   └── storage-key.ts      # Storage/header keys
│   ├── hooks/                  # Shared hooks
│   │   ├── use-list-base.tsx   # Standardized list-page logic
│   │   ├── use-save-base.tsx   # Standardized save-page logic
│   │   └── use-auth.ts         # Authentication/permission hook
│   ├── queries/                # TanStack Query hooks
│   ├── routes/                 # Route definitions + metadata
│   ├── schemaValidations/      # Zod validation schemas
│   ├── store/                  # Zustand stores
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Utility functions
│   │   ├── http.util.ts        # HTTP wrapper + token refresh flow
│   │   └── storage.util.ts     # Storage helpers
│   └── lib/                    # Third-party library configs
├── .env.example                # Environment template
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind config
└── tsconfig.json               # TypeScript strict mode
```

## 🏗 Architecture Overview

### Provider Hierarchy

The application uses this provider chain in `src/app/layout.tsx`:

```text
ThemeProvider
  └─ QueryProvider
      └─ AppProvider
          └─ PermissionGuard
              └─ Page Content
```

### Core Architecture

1. **Query Provider** (`src/components/providers/query-provider/get-query-provider.ts`)
   - Uses one shared browser query client
   - Defaults: `staleTime: 60s`, `refetchOnWindowFocus: false`, `retry: false`

2. **App Provider** (`src/components/providers/app-provider/app-provider.tsx`)
   - Reads token and user kind from storage
   - Loads profile via `useProfileQuery` or `useEmployeeProfileQuery`
   - Syncs profile into `useAuthStore`
   - Initializes `LazyMotion` and MQTT subscriptions

3. **Config-driven access control**
   - Endpoints + permission codes: `src/constants/api-config.ts`
   - Route metadata (`auth`, `permissionCode`, `separate`): `src/routes/route.ts`
   - Route checks at render time: `PermissionGuard`

4. **HTTP layer** (`src/utils/http.util.ts`)
   - Auth header injection
   - Refresh-token retry queue for concurrent 401 handling
   - Path param replacement and multipart upload support

5. **Shared CRUD hooks**
   - `useListBase`: list query, filter/query-string sync, pagination, delete flow
   - `useSaveBase`: create/edit fetch + submit, dirty-leave guard, query invalidation

### Authentication Flow

1. User logs in and tokens are stored
2. HTTP requests include `Authorization: Bearer <token>`
3. `401` responses trigger refresh-token flow with queued retries
4. Profile is loaded and synced to `useAuthStore`
5. Permission checks are enforced by route metadata and permission utilities

### Permission System

- **API-Level**: `permissionCode` is defined in `api-config.ts`
- **Route-Level**: `auth`, `permissionCode`, `separate` are defined in `route.ts`
- **Component-Level**: `<HasPermission>` is used for conditional UI
- **Save-page split**: create vs edit checks use `separate` semantics

## 💻 Development

### Key Patterns

- Keep `apiConfig` as the source of truth for endpoints and permission codes.
- Use `useListBase` for list pages and `useSaveBase` for create/edit pages.
- Keep required hidden filters in `defaultFilters` + `notShowFromSearchParams`.
- Prefer `apiConfig.*.autoComplete` endpoints for autocomplete fields when available.
- `useSaveBase` already handles dirty-form leave confirmation and invalidation of `[queryKey]` and `[`${queryKey}-list`]`.

### Code Conventions

- Use `'use client'` for interactive/client-only code
- Use `@/*` path aliases instead of deep relative imports
- Use `m` from `framer-motion` (not `motion`)
- Use `cn()` from `@/lib/utils` for class composition
- Follow Zod v4 form validation patterns (`.check(...)`)
- Prefix intentionally unused variables with `_`

### Modal Pattern

```tsx
<Modal open={open} onClose={handleClose} confirmOnClose={isFormChanged}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>{/* Form content */}</Modal.Body>
  <Modal.Confirm message='Bạn có chắc chắn muốn hủy không ?' />
</Modal>
```

## 🤝 Contributing

1. Follow the established code patterns (see `.github/copilot-instructions.md` and `AGENTS.md`)
2. Use TypeScript for all new code
3. Add Zod schemas for form validation where needed
4. Use conventional commit messages (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`)
5. Run `yarn lint` and `yarn format` before committing
6. Test changes manually across different user permission levels (no automated test setup)

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"  # Commitlint enforces format

# Pre-commit hooks run on staged files:
# - ESLint (auto-fix)
# - Prettier (auto-format)

# Push and create PR
git push origin feature/your-feature-name
```

## 📝 Environment Variables

| Variable                               | Description                 | Example                      |
| -------------------------------------- | --------------------------- | ---------------------------- |
| `NEXT_PUBLIC_NODE_ENV`                 | Environment mode            | `development` / `production` |
| `NEXT_PUBLIC_AUTH_API_URL`             | Authentication API base URL | `https://auth.example.com`   |
| `NEXT_PUBLIC_API_URL`                  | Main API base URL           | `https://api.example.com`    |
| `NEXT_PUBLIC_API_MEDIA_URL`            | Media API base URL          | `https://media.example.com`  |
| `NEXT_PUBLIC_APP_USERNAME`             | App credentials username    | `app-client`                 |
| `NEXT_PUBLIC_APP_PASSWORD`             | App credentials password    | `secret-password`            |
| `NEXT_PUBLIC_URL`                      | Application URL             | `http://localhost:3001`      |
| `NEXT_PUBLIC_TINYMCE_URL`              | TinyMCE CDN URL             | `https://cdn.tiny.cloud`     |
| `NEXT_PUBLIC_GRANT_TYPE`               | OAuth grant type            | `password`                   |
| `NEXT_PUBLIC_APP_NAME`                 | Application name            | `MovieHub CMS`               |
| `NEXT_PUBLIC_GRANT_TYPE_REFRESH_TOKEN` | Refresh token grant type    | `refresh_token`              |
| `NEXT_PUBLIC_MEDIA_HOST`               | Media files host            | `https://cdn.example.com`    |
| `NEXT_PUBLIC_CLIENT_TYPE`              | Client type identifier      | `CMS`                        |

## 📄 License

MIT License - see LICENSE file for details

---

<p align="center">
  Built with ❤️ by the MovieHub Team
</p>
