![MovieHub](./src/assets/images/logo-with-text.webp)

<h1 align="center">MovieHub CMS</h1>

<p align="center">
  <strong>A comprehensive content management system for movie streaming platforms</strong>
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

**MovieHub CMS** is an enterprise-grade administration console designed for managing movie streaming platforms. Built with modern web technologies, it provides operations teams with powerful tools to manage content, users, permissions, and platform configuration.

### What is MovieHub CMS?

This system serves as the central hub for:

- **Content Management**: Comprehensive movie catalog with metadata, categories, people, and collections
- **User Administration**: Role-based access control for admins, employees, and end users
- **Media Management**: Video library with upload, processing, and playback capabilities
- **Platform Configuration**: Customizable UI elements, sidebar navigation, and styling
- **Permission System**: Granular permission management with group-based access control

Built with **Next.js 16 (App Router)** and **TypeScript**, the system emphasizes type safety, performance, and developer experience.

## ✨ Features

### Content Management

- **Movies & Series**: Complete lifecycle management for movies, TV series, episodes, and trailers
- **Categories & Collections**: Organize content with categories, sections, and curated collections
- **People Management**: Track directors, actors, and other crew members with detailed profiles
- **Rich Metadata**: Support for ratings, reviews, comments, and age classifications
- **Media Assets**: Advanced video library with HLS streaming support

### User & Access Management

- **Role System**: Admin, employee, and user role hierarchies
- **Permission Groups**: Flexible group-based permission assignment
- **Profile Management**: User profiles with avatar uploads and personal information
- **Authentication**: JWT-based auth with refresh token rotation
- **Authorization**: Route-level and API-level permission enforcement

### Platform Configuration

- **Dynamic Sidebar**: Configurable navigation menus
- **Style Management**: Customizable themes and UI styling
- **App Version Control**: Feature flag management and version tracking

### Developer Experience

- **Type Safety**: Full TypeScript coverage with Zod schema validation
- **Form Management**: React Hook Form integration with automatic error handling
- **State Management**: Zustand for global state, TanStack Query for server state
- **UI Components**: Radix UI primitives with custom styling and animations
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks, and Commitlint

## 🛠 Tech Stack

### Core Framework

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

### State & Data Management

- **[TanStack Query](https://tanstack.com/query)** - Server state management
- **[Zustand](https://github.com/pmndrs/zustand)** - Client state management
- **[Axios](https://axios-http.com/)** - HTTP client

### Forms & Validation

- **[React Hook Form](https://react-hook-form.com/)** - Form state management
- **[Zod](https://zod.dev/)** - Schema validation

### UI & Styling

- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI components
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Lucide React](https://lucide.dev/)** - Icon library

### Media & Rich Content

- **[Vidstack](https://www.vidstack.io/)** - Video player components
- **[HLS.js](https://github.com/video-dev/hls.js/)** - HLS video streaming
- **[TinyMCE](https://www.tiny.cloud/)** - Rich text editor

### Development Tools

- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[Commitlint](https://commitlint.js.org/)** - Commit message linting

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
   NEXT_PUBLIC_API_SOCKET_URL=wss://your-socket-url
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

| Command            | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `yarn dev`         | Start development server on port 3001 with Turbopack |
| `yarn clean-dev`   | Remove `.next` cache and start dev server            |
| `yarn build`       | Build production bundle                              |
| `yarn start`       | Start production server on port 3001                 |
| `yarn lint`        | Run ESLint on TypeScript/JavaScript files            |
| `yarn format`      | Format code with Prettier                            |
| `yarn lint-staged` | Run linting and formatting on staged files           |

## 📁 Project Structure

```
MovieHub-CMS/
├── .github/                    # GitHub configuration and CI/CD
│   └── copilot-instructions.md # Copilot AI assistant instructions
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth-related pages (login)
│   │   ├── admin/             # Admin management pages
│   │   ├── category/          # Category management
│   │   ├── collection/        # Collection management
│   │   ├── employee/          # Employee management
│   │   ├── group-permission/  # Permission group management
│   │   ├── movie/             # Movie management
│   │   ├── person/            # People (actors/directors) management
│   │   ├── profile/           # User profile pages
│   │   ├── sidebar/           # Sidebar configuration
│   │   ├── style/             # Style/theme management
│   │   ├── user/              # User management
│   │   ├── video-library/     # Video library management
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Home page
│   ├── assets/                # Images, fonts, and static resources
│   ├── components/            # Reusable React components
│   │   ├── form/             # Form components (fields, inputs, etc.)
│   │   ├── providers/        # React context providers
│   │   ├── ui/               # UI primitives (Radix UI wrappers)
│   │   ├── modal/            # Modal components
│   │   ├── permission-guard/ # Route permission wrapper
│   │   └── ...
│   ├── constants/             # Application constants
│   │   ├── api-config.ts     # API endpoint configuration
│   │   ├── master-data.ts    # Query keys and dropdown options
│   │   ├── menu-config.ts    # Sidebar menu configuration
│   │   ├── route.ts          # Route definitions
│   │   └── storage-key.ts    # LocalStorage key constants
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-list-base.tsx # Standardized list page hook
│   │   ├── use-save-base.tsx # Standardized save/edit hook
│   │   ├── use-auth.ts       # Authentication hook
│   │   └── ...
│   ├── queries/               # TanStack Query hooks by domain
│   ├── routes/                # Route metadata and permissions
│   │   └── route.ts          # Route configuration with auth/permissions
│   ├── schemaValidations/     # Zod validation schemas
│   ├── store/                 # Zustand stores
│   │   ├── use-auth-store.ts # Auth state
│   │   └── ...
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   │   ├── http.util.ts      # HTTP client wrapper
│   │   ├── storage.util.ts   # LocalStorage helpers
│   │   └── ...
│   └── lib/                   # Third-party library configurations
├── .env                       # Environment variables (git-ignored)
├── .env.example               # Environment variables template
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

### Key Directories

- **`src/app`**: Next.js 16 App Router pages with nested routing and layouts
- **`src/components`**: Reusable UI components, form fields, and shared widgets
- **`src/hooks`**: Custom React hooks for common patterns (lists, forms, auth)
- **`src/queries`**: TanStack Query hooks organized by domain (movies, users, etc.)
- **`src/constants`**: Centralized configuration for APIs, routes, and app constants
- **`src/schemaValidations`**: Zod schemas for form validation and type inference
- **`src/utils`**: Pure utility functions (HTTP, formatting, storage, etc.)

## 🏗 Architecture Overview

### Provider Hierarchy

The application uses a layered provider architecture in `src/app/layout.tsx`:

```
ThemeProvider (next-themes)
  └─ QueryProvider (TanStack Query client)
      └─ AppProvider (auth bootstrapping + Framer Motion)
          └─ PermissionGuard (route-level auth/permission check)
              └─ Page Content
```

### Data Flow

1. **API Configuration** (`src/constants/api-config.ts`)
   - Defines all endpoints, HTTP methods, headers, and permission codes
   - Used by HTTP utility and hooks as single source of truth

2. **Route Configuration** (`src/routes/route.ts`)
   - Maps paths to permission requirements
   - Used by PermissionGuard for access control

3. **HTTP Layer** (`src/utils/http.util.ts`)
   - Axios wrapper with token injection
   - Automatic refresh token handling
   - Path parameter replacement
   - Multipart form data support

4. **Data Hooks** (`src/hooks/use-list-base.tsx`, `use-save-base.tsx`)
   - Standardized CRUD operations
   - Query parameter synchronization
   - Permission-aware UI rendering
   - Automatic cache invalidation

### Authentication Flow

1. User logs in → JWT access token + refresh token stored
2. HTTP requests include `Authorization: Bearer {token}` header
3. 401 responses trigger refresh token flow (queued to prevent duplicates)
4. Profile data fetched and stored in Zustand `useAuthStore`
5. Permissions extracted from JWT and checked against route requirements

### Permission System

- **API-Level**: Each endpoint in `api-config.ts` has a `permissionCode`
- **Route-Level**: Routes in `route.ts` require specific permission codes
- **Component-Level**: `<HasPermission>` wrapper for conditional rendering
- **Hook-Level**: `useValidatePermission()` for programmatic checks

## 💻 Development

### Code Organization Patterns

#### List Pages

Use `useListBase` hook for standardized list functionality:

```typescript
const { data, loading, handlers } = useListBase({
  apiConfig: apiConfig.movie,
  options: {
    queryKey: 'movies',
    objectName: 'phim',
    defaultFilters: { status: STATUS_ACTIVE },
    notShowFromSearchParams: ['status']
  }
});
```

#### Save Pages (Create/Edit)

Use `useSaveBase` hook for standardized form operations:

```typescript
const { data, loading, handleSubmit } = useSaveBase({
  apiConfig: {
    getById: apiConfig.movie.getById,
    create: apiConfig.movie.create,
    update: apiConfig.movie.update
  },
  options: {
    queryKey: 'movie',
    objectName: 'phim',
    mode: isNew ? 'create' : 'edit',
    pathParams: { id }
  }
});
```

#### Forms

Use `BaseForm` with Zod schema:

```typescript
<BaseForm
  schema={movieSchema}
  defaultValues={defaultValues}
  initialValues={data}
  onSubmit={handleSubmit}
>
  {(form) => (
    <>
      <InputField name="title" label="Tiêu đề" control={form.control} />
      <TextAreaField name="description" label="Mô tả" control={form.control} />
    </>
  )}
</BaseForm>
```

### Common Conventions

- Use `'use client'` directive for hooks and components using browser APIs
- Import from `@/*` aliases instead of relative paths
- Use `m` from framer-motion (not `motion`)
- Centralize storage keys in `src/constants/storage-key.ts`
- Reuse query keys from `src/constants/master-data.ts`
- Follow Zod v4 patterns (`.check()` for chained validators)

### Styling Conventions

- Use Tailwind utility classes
- Component variants with `class-variance-authority`
- Radix UI for headless component primitives
- `cn()` utility from `@/lib` for conditional classes
- Framer Motion for animations (via LazyMotion)

## 🤝 Contributing

1. Follow the established code patterns (see `.github/copilot-instructions.md`)
2. Use TypeScript for all new code
3. Add Zod schemas for form validation
4. Write commit messages following conventional commits
5. Run `yarn lint` and `yarn format` before committing
6. Test changes across different user permission levels

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"  # Commitlint enforces format

# Pre-commit hooks will run automatically:
# - ESLint (auto-fix)
# - Prettier (auto-format)
# - Commitlint (message validation)

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
| `NEXT_PUBLIC_API_SOCKET_URL`           | WebSocket API URL           | `wss://socket.example.com`   |
| `NEXT_PUBLIC_GRANT_TYPE`               | OAuth grant type            | `password`                   |
| `NEXT_PUBLIC_APP_NAME`                 | Application name            | `MovieHub CMS`               |
| `NEXT_PUBLIC_GRANT_TYPE_REFRESH_TOKEN` | Refresh token grant type    | `refresh_token`              |
| `NEXT_PUBLIC_MEDIA_HOST`               | Media files host            | `https://cdn.example.com`    |
| `NEXT_PUBLIC_CLIENT_TYPE`              | Client type identifier      | `WEB`                        |

## 📄 License

MIT License - see LICENSE file for details

---

<p align="center">
  Built with ❤️ by the MovieHub Team
</p>
