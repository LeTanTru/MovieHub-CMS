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

| Technology                                    | Version | Purpose                                     |
| --------------------------------------------- | ------- | ------------------------------------------- |
| [Next.js](https://nextjs.org/)                | 16      | React framework with App Router & Turbopack |
| [React](https://react.dev/)                   | 19      | UI library with React Compiler              |
| [TypeScript](https://www.typescriptlang.org/) | 5       | Strict type safety                          |
| [Tailwind CSS](https://tailwindcss.com/)      | 4       | Utility-first styling                       |

### State & Data Management

| Technology                                   | Purpose                 |
| -------------------------------------------- | ----------------------- |
| [TanStack Query](https://tanstack.com/query) | Server state & caching  |
| [Zustand](https://github.com/pmndrs/zustand) | Client state management |
| [Axios](https://axios-http.com/)             | HTTP client with auth   |

### Forms & Validation

| Technology                                      | Purpose                               |
| ----------------------------------------------- | ------------------------------------- |
| [React Hook Form](https://react-hook-form.com/) | Performant form handling              |
| [Zod](https://zod.dev/)                         | v4 schema validation & type inference |

### UI Components & Animations

| Technology                                      | Purpose                         |
| ----------------------------------------------- | ------------------------------- |
| [Radix UI](https://www.radix-ui.com/)           | Headless UI primitives          |
| [Framer Motion](https://www.framer.com/motion/) | Animations (LazyMotion pattern) |
| [Lucide React](https://lucide.dev/)             | Icon library                    |
| [Recharts](https://recharts.org/)               | Charts & data visualization     |
| [@dnd-kit](https://dndkit.com/)                 | Drag & drop functionality       |

### Media & Rich Content

| Technology                                               | Purpose                       |
| -------------------------------------------------------- | ----------------------------- |
| [Vidstack](https://www.vidstack.io/)                     | Video player with HLS support |
| [TinyMCE](https://www.tiny.cloud/)                       | Rich text editor              |
| [AWS SDK S3](https://aws.amazon.com/sdk-for-javascript/) | Presigned URL uploads         |
| [MQTT](https://mqtt.org/)                                | Real-time messaging           |

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
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth route group (login)
│   │   ├── admin/             # Admin management
│   │   ├── category/          # Category CRUD
│   │   ├── collection/        # Collection management
│   │   ├── employee/          # Employee management
│   │   ├── group-permission/  # Permission groups
│   │   ├── movie/             # Movie & series management
│   │   ├── person/            # People (actors/directors)
│   │   ├── profile/           # User profile
│   │   ├── sidebar/           # Sidebar configuration
│   │   ├── style/             # Theme & style management
│   │   ├── user/              # End-user management
│   │   └── video-library/     # Video library
│   ├── assets/                # Images, fonts, static resources
│   ├── components/            # Reusable React components
│   │   ├── form/             # 34 form field components
│   │   ├── ui/               # Radix UI wrappers
│   │   ├── providers/        # Context providers
│   │   ├── table/            # Table with pagination
│   │   ├── video-player/     # Vidstack player
│   │   └── permission-guard/ # Route access control
│   ├── constants/             # Centralized configuration
│   │   ├── api-config.ts     # ~900 lines of endpoint definitions
│   │   ├── route.ts          # Route metadata & permissions
│   │   ├── menu-config.ts    # Sidebar navigation
│   │   └── storage-key.ts    # LocalStorage keys
│   ├── hooks/                 # 20 custom React hooks
│   │   ├── use-list-base.tsx # Standardized list page logic
│   │   ├── use-save-base.tsx # Standardized create/edit logic
│   │   └── use-auth.ts       # Authentication hook
│   ├── queries/               # 16 TanStack Query hook files
│   ├── routes/                # Route definitions with permissions
│   ├── schemaValidations/     # 23 Zod validation schemas
│   ├── store/                 # Zustand stores (auth, sidebar, etc.)
│   ├── types/                 # 32 TypeScript type definitions
│   ├── utils/                 # Utility functions
│   │   ├── http.util.ts      # Axios wrapper with auth
│   │   └── storage.util.ts   # LocalStorage helpers
│   └── lib/                   # Third-party library configs
├── .env.example               # Environment template
├── next.config.ts             # Next.js config (React Compiler, 2GB body limit)
├── tailwind.config.ts         # Tailwind CSS v4 config
└── tsconfig.json              # TypeScript strict mode
```

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

### Notable Architecture Patterns

**Configuration-Driven CRUD**
All pages follow the same pattern using `useListBase` (list pages) and `useSaveBase` (create/edit pages). This dramatically reduces boilerplate and ensures consistency across the entire application.

**Single Source of Truth**

- API endpoints defined in `api-config.ts` (~900 lines)
- Permission codes cascade automatically through routes, menus, and components
- Adding a new feature requires updates to only 3 places: api-config, routes, and menu config

**Form Dirty Guard**
When navigating away from unsaved changes, users see a confirmation dialog. Cancel stores the previous path in localStorage for "return to previous" behavior.

**Dual Token Storage**
JWT tokens stored in both cookies (SSR) and localStorage (CSR) for seamless authentication across server and client.

**No Test Framework**
There is intentionally no test setup -- no `test` script in package.json, no test files, no testing library dependency.

### Code Conventions

- Use `'use client'` directive for hooks and components using browser APIs
- Import from `@/*` aliases instead of relative paths
- Use `m` from framer-motion (not `motion`)
- Use `cn()` from `@/lib/utils` for conditional class merging
- Follow Zod v4 patterns (`.check()` for chained validators)
- Prefix unused vars with `_` to suppress warnings
- All commits must include: `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`

### Styling Conventions

- Tailwind CSS v4 utility classes
- Component variants with `class-variance-authority`
- Radix UI for headless component primitives
- Framer Motion animations via LazyMotion + domAnimation
- 12-column grid system (`src/styles/grid.css`)

### Form Patterns

- `BaseForm` + `useForm` (react-hook-form) + Zod resolver
- `ImageField` supports `freeAspect` and `freePreviewAspect` props
- `UploadImageField` supports `originalSize` prop for original dimensions
- `onFormChange(isDirty)` callback for dirty tracking

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
