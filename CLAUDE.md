# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MovieHub CMS is a Next.js App Router administration console for managing a movie streaming platform. It is configuration-driven: endpoints, routes, and permissions are all defined in centralized config files rather than scattered across components.

## Commands

```bash
yarn            # Install dependencies
yarn dev        # Dev server on port 3001 (Turbopack)
yarn clean-dev  # Clear .next cache, then dev
yarn build      # Production build (output: 'standalone')
yarn start      # Production server on port 3001
yarn lint       # ESLint on .ts/.tsx/.js/.jsx
yarn format     # Prettier write all files
yarn lint-staged  # Run on staged files (pre-commit hook)
ANALYZE=true yarn build  # Build with bundle analyzer
```

**No test framework is configured.** Do not add test infrastructure or a `test` script.

## Architecture

### Provider Chain (in `src/app/layout.tsx`)

```
ThemeProvider -> QueryProvider -> AppProvider -> Suspense -> PermissionGuard -> children
```

- **QueryProvider**: Single shared browser `QueryClient`. Defaults: `staleTime: 60s`, `refetchOnWindowFocus: false`, `retry: false`.
- **AppProvider**: Reads auth session from server cookie (session query uses `gcTime: 0`, `refetchOnMount: 'always'` — see `src/queries/auth.query.ts`), loads admin/employee profile, syncs to `useAuthStore`, and initializes `LazyMotion`.
- **PermissionGuard**: Enforces route-level auth and permission checks, shows full-screen loader during session resolution.
- **MqttProvider**: Mounted alongside guarded content inside `AppProvider`; subscribes to CMS/account and user report notification topics (including comment/review target highlighting) and invalidates query caches.

### Configuration-Driven Access Control

Permissions and API endpoints are centralized:

| File                                                   | Purpose                                                                                                          |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `src/constants/api-config.ts`                          | Endpoint URLs, HTTP methods, and permission codes                                                                |
| `src/constants/app.ts`                                 | API base URLs (`authApiUrl`, `apiUrl`, `mediaUrl`)                                                               |
| `src/routes/route.ts`                                  | Route metadata: `auth`, `permissionCode`, `separate` (create/edit split)                                         |
| `src/components/permission-guard/permission-guard.tsx` | Route-level auth enforcement and redirect logic                                                                  |
| `src/utils/validate-permission.util.ts`                | Permission resolution — when `separate: true`, uses `path` ('create'/'edit') to pick the correct permission code |

### HTTP Layer (`src/utils/http.util.ts`)

- Injects `Authorization: Bearer <token>` header
- Handles 401 with refresh-token rotation and a dedup queue (concurrent requests wait for token refresh)
- Path param replacement (`/:id` style) and multipart upload support
- On refresh failure: calls `clearState()` and redirects to login

### Stores (`src/store/index.ts`, Zustand)

`useAuthStore`, `useCommentStore`, `useReviewStore`, `useSidebarStore`, `useVideoLibrarySubtitleStore`. Use `useShallow` for multi-field selectors to avoid unnecessary re-renders. For `useAuthStore`, always use `clearState()` (not individual setters) to reset auth on logout or token expiry.

Compute derived state during render, not in `useEffect`. When a store must be synced from a ref/DOM value in an effect, use `useLayoutEffect` — `useEffect` here triggers a React "update while rendering" error.

### CRUD Hooks

- **`useListBase`**: List query state, query-param sync, pagination, delete flow. Keep required hidden filters in `defaultFilters` + `notShowFromSearchParams`. Preserve query key shape: ``[`${queryKey}-list`, queryFilter]``.
- **`useSaveBase`**: Create/edit submit flow, dirty-leave guard, cache invalidation for both `[queryKey]` and ``[`${queryKey}-list`]``.
- Prefer `apiConfig.*.autoComplete` endpoints for autocomplete fields when available.

### Query Files (`src/queries/*.query.ts`)

All `useQuery` hooks should use `select: (data) => data.data` to extract the response payload, simplifying data access in components. Mutations don't need `select`. Do not use destructuring aliases for mutation returns (keep `mutate` and `isPending` without aliases).

### Query Key Convention (`src/constants/master-data/query-keys.ts`)

All `queryKey` strings for TanStack Query mutations/queries are centralized in `queryKeys`. Base keys (e.g., `ADMIN: 'admin'`) define entity names; mutation keys (e.g., `CHANGE_ADMIN_STATUS: 'change-admin-status'`) are explicit strings. Always import and use `queryKeys` instead of hardcoding strings.

### API Base URLs — `AppConstants` (`src/constants/app.ts`)

API base URLs use `AppConstants.authApiUrl`, `AppConstants.apiUrl`, and `AppConstants.mediaUrl` rather than raw env vars. Do not hardcode `process.env.NEXT_PUBLIC_*` in `src/constants/api-config.ts`.

### Table Components

- `BaseTable` and `DragDropTable` apply `w-auto min-w-fit` to `<Table>` so columns don't collapse on resize. The base `Table` UI primitive (`src/components/ui/table.tsx`) intentionally does not force `w-full` — columns size to content and the wrapper scrolls.
- `DragDropTable` uses a module-level `EMPTY_DATA_SOURCE` constant instead of an inline `[]` to avoid recreating the array every render (which would retrigger drag-and-drop setup).

### Environment Variables

Validated through Zod in `src/config.ts`. Add new env vars there (and update `.env.example`). Key variables:

| Variable                   | Purpose                                                      |
| -------------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_API_URL`      | Main API base URL                                            |
| `NEXT_PUBLIC_AUTH_API_URL` | Auth API base URL                                            |
| `NEXT_PUBLIC_CLIENT_TYPE`  | Used as both local storage key and outbound HTTP header name |
| `NEXT_PUBLIC_URL`          | App URL                                                      |
| `NEXT_PUBLIC_MQTT_*`       | MQTT broker credentials                                      |

## Code Conventions

- Use `@/*` path aliases instead of deep relative imports
- `'use client'` for components using browser APIs or hooks
- `m` from `framer-motion` (not `motion`) within existing `LazyMotion` setup
- `cn()` from `@/lib/utils` for class composition
- Zod v4: use `.safeParse()` for env/config and parsed runtime input validation
- `FormControl` (Radix `Slot`) requires the actual input as its direct child so `id`/`aria-*` props apply correctly
- `Col` has no `span` prop — control width via utility classes
- Grid utilities: `grid-row`, `grid-col`, `grid-c-*` from `src/styles/grid.css`
- Prefix intentionally unused variables with `_`

## Common Lint/Review Findings

These recur in review even though not all are raw ESLint errors — check for them proactively:

- Add an `onKeyDown` (Enter/Space) handler on any element with `role='button'` or a click handler (`jsx-a11y/click-events-have-key-events`).
- Don't wrap trivial expressions (string concat, property access, ternaries) in `useMemo`.
- Use `.flatMap()` instead of `.map().filter(Boolean)`.
- Heavy libraries (e.g. `recharts`, chart/editor components) must be loaded via `next/dynamic` with `ssr: false`.
- Use a custom `cubic-bezier(0.16, 1, 0.3, 1)` transition instead of Tailwind's `animate-bounce`.
- For external SVGs, use `next/image` with `fill` + `unoptimized` rather than a raw `<img>`.

## Modal Pattern

```tsx
<Modal confirmOnClose={isFormChanged}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>{/* Form content */}</Modal.Body>
  <Modal.Confirm message='Bạn có chắc chắn muốn hủy không ?' />
</Modal>
```

## Git

- Conventional commits enforced: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- Branch prefixes: `feature/`, `fix/`, `refactor/`
- Pre-commit hooks auto-fix and format staged files via lint-staged

## Security Review

`docs/security-scan.md` is the current static security review and remediation backlog. Review it before changing auth/session routes, internal file APIs, token handling, MQTT config, rich text sanitization, CSP/security headers, deployment workflow, or runtime dependencies.
