# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MovieHub CMS is a Next.js App Router administration console for managing a movie streaming platform. It is configuration-driven: endpoints, routes, and permissions are all defined in centralized config files rather than scattered across components.

## Commands

```bash
yarn              # Install dependencies
yarn dev          # Dev server on port 3001 (Turbopack)
yarn clean-dev    # Clear .next cache, then dev
yarn build        # Production build
yarn start        # Production server on port 3001
yarn lint         # ESLint on .ts/.tsx/.js/.jsx
yarn format       # Prettier write all files
yarn lint-staged  # Run on staged files (pre-commit hook)
```

**No test framework is configured.** Do not add test infrastructure.

## Architecture

### Provider Chain (in `src/app/layout.tsx`)

```
ThemeProvider → QueryProvider → AppProvider → PermissionGuard → children
```

- **QueryProvider**: Single shared browser `QueryClient`. Defaults: `staleTime: 60s`, `refetchOnWindowFocus: false`, `retry: false`.
- **AppProvider**: Reads auth session from server cookie, loads admin/employee profile, syncs to `useAuthStore`, initializes `LazyMotion` and MQTT subscriptions.
- **PermissionGuard**: Enforces route-level auth and permission checks, shows full-screen loader during session resolution.

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

### Auth State — `useAuthStore` (Zustand)

Use `useShallow` for multi-field selectors to avoid unnecessary re-renders. Always use `clearState()` (not individual setters) to reset auth on logout or token expiry.

### CRUD Hooks

- **`useListBase`**: List query state, query-param sync, pagination, delete flow. Keep required hidden filters in `defaultFilters` + `notShowFromSearchParams`. Preserve query key shape: ``[`${queryKey}-list`, queryFilter]``.
- **`useSaveBase`**: Create/edit submit flow, dirty-leave guard, cache invalidation for both `[queryKey]` and ``[`${queryKey}-list`]``.
- Prefer `apiConfig.*.autoComplete` endpoints for autocomplete fields when available.

### Query Files (`src/queries/*.query.ts`)

All `useQuery` hooks should use `select: (data) => data.data` to extract the response payload, simplifying data access in components. Mutations don't need `select`.

### Query Key Convention (`src/constants/master-data.ts`)

All `queryKey` strings for TanStack Query mutations/queries are centralized in `queryKeys`. Base keys (e.g., `ADMIN: 'admin'`) define entity names; mutation keys (e.g., `CHANGE_ADMIN_STATUS: 'change-admin-status'`) are explicit strings. Always import and use `queryKeys` instead of hardcoding strings.

### API Base URLs — `AppConstants` (`src/constants/app.ts`)

API base URLs use `AppConstants.authApiUrl`, `AppConstants.apiUrl`, and `AppConstants.mediaUrl` rather than raw env vars. Do not hardcode `process.env.NEXT_PUBLIC_*` in `src/constants/api-config.ts`.

### Environment Variables

Validated through Zod in `src/config.ts`. Add new env vars there (and update `.env.example`). Key variables:

| Variable                   | Purpose                                                      |
| -------------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_API_URL`      | Main API base URL                                            |
| `NEXT_PUBLIC_AUTH_API_URL` | Auth API base URL                                            |
| `NEXT_PUBLIC_CLIENT_TYPE`  | Used as both local storage key and outbound HTTP header name |
| `NEXT_PUBLIC_MQTT_*`       | MQTT broker credentials                                      |

## Code Conventions

- Use `@/*` path aliases instead of deep relative imports
- `'use client'` for components using browser APIs or hooks
- `m` from `framer-motion` (not `motion`) within existing `LazyMotion` setup
- `cn()` from `@/lib/utils` for class composition
- Zod v4: `.check()` for validators
- `FormControl` (Radix `Slot`) requires the actual input as its direct child so `id`/`aria-*` props apply correctly
- `Col` has no `span` prop — control width via utility classes
- Grid utilities: `grid-row`, `grid-col`, `grid-c-*` from `src/styles/grid.css`
- Prefix intentionally unused variables with `_`

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
